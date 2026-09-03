import { Request, Response } from "express";
import { Op, fn, col, literal, Transaction, Model, ModelStatic } from "sequelize";
import { maxid, url } from "../utils";
import { deleteFile } from "../utils/uploadFile";
import Products from "../models/Products";
import { generateBarCode, maxsku } from "../utils/generateBarCode";
import Brands from "../models/Brands";
import Categories from "../models/Categories";
import Sizes from "../models/Sizes.Model";
import Units from "../models/Units.Model";

import { sequelize } from "../config/database";
import { Toppings } from "../models/Toppings.model";
import Promotion from "../models/Promotion";
import DetailPorduct from "../models/DetailPorduct";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

/** ແຖວລູກຂອງສິນຄ້າ (toppings / details) */
type ChildRow = Record<string, unknown> & { _uuid?: number };

const TOPPING_FIELDS = ["toppingName", "prices", "status"] as const;
const DETAIL_FIELDS = ["title", "name", "status"] as const;

class ProductRequestError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "ProductRequestError";
    }
}

/**
 * ຮັບໄດ້ທັງ array (multipart: details[0][title]) ແລະ JSON string
 */
const parseChildRows = (
    raw: unknown,
    label: string,
    fields: readonly string[]
): ChildRow[] => {
    if (raw === undefined || raw === null || raw === "") {
        return [];
    }

    let parsed: unknown = raw;
    if (typeof raw === "string") {
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new ProductRequestError(400, `${label} must be a valid JSON array`);
        }
    }

    if (!Array.isArray(parsed)) {
        throw new ProductRequestError(400, `${label} must be an array`);
    }

    return parsed.map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            throw new ProductRequestError(400, `Each ${label} row must be an object`);
        }

        const source = item as Record<string, unknown>;
        const rawUuid = source._uuid;
        let uuid: number | undefined;

        if (rawUuid !== undefined && rawUuid !== null && rawUuid !== "") {
            uuid = Number(rawUuid);
            if (!Number.isInteger(uuid) || uuid <= 0) {
                throw new ProductRequestError(400, `Invalid ${label} _uuid`);
            }
        }

        const row: ChildRow = { _uuid: uuid };
        for (const field of fields) {
            if (source[field] !== undefined) row[field] = source[field];
        }

        return row;
    });
};

const getChildValues = (
    row: ChildRow,
    fields: readonly string[]
): Record<string, unknown> => {
    const values: Record<string, unknown> = {};
    for (const field of fields) {
        if (row[field] !== undefined) values[field] = row[field];
    }
    return values;
};

const buildChildRows = (
    rows: ChildRow[],
    fields: readonly string[],
    productid: number
): Record<string, unknown>[] =>
    rows.map((row) => ({ ...getChildValues(row, fields), productid }));

/**
 * ຊິງຄ໌ແຖວລູກ: ລຶບອັນທີ່ບໍ່ໄດ້ສົ່ງມາ, ອັບເດດອັນທີ່ມີ _uuid, ເພີ່ມອັນໃໝ່
 */
const syncProductChildren = async (
    model: ModelStatic<Model<any, any>>,
    productid: number,
    rows: ChildRow[],
    label: string,
    fields: readonly string[],
    transaction: Transaction
): Promise<void> => {
    const existingRows = await model.findAll({
        where: { productid },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    const existingIds = new Set(
        existingRows.map((item) => Number(item.get("_uuid")))
    );
    const incomingIds = rows
        .filter((item) => item._uuid !== undefined)
        .map((item) => item._uuid as number);

    if (new Set(incomingIds).size !== incomingIds.length) {
        throw new ProductRequestError(400, `Duplicate ${label} _uuid`);
    }

    const invalidId = incomingIds.find((uuid) => !existingIds.has(uuid));
    if (invalidId !== undefined) {
        throw new ProductRequestError(
            400,
            `${label} ${invalidId} does not belong to this product`
        );
    }

    const incomingIdSet = new Set(incomingIds);
    const idsToDelete = [...existingIds].filter(
        (uuid) => !incomingIdSet.has(uuid)
    );

    if (idsToDelete.length > 0) {
        await model.destroy({
            where: {
                _uuid: { [Op.in]: idsToDelete },
                productid,
            },
            transaction,
        });
    }

    for (const row of rows) {
        if (row._uuid === undefined) continue;
        const values = getChildValues(row, fields);
        if (Object.keys(values).length === 0) continue;
        await model.update(values, {
            where: { _uuid: row._uuid, productid },
            transaction,
        });
    }

    const newRows = rows.filter((item) => item._uuid === undefined);
    if (newRows.length > 0) {
        await model.bulkCreate(buildChildRows(newRows, fields, productid), {
            transaction,
        });
    }
};

/** types: 1 = ສິນຄ້າຈຳນວນຫຼາຍ, 2 = ສິນຄ້າດຽວ (ມີລະຫັດສະເພາະເຄື່ອງ) */
const normalizeTypes = (raw: unknown): number => (Number(raw) === 2 ? 2 : 1);

/** ຄວາມສຳພັນລູກທີ່ຕິດມາກັບສິນຄ້າສະເໝີ */
const productChildInclude = [
    { model: Toppings, as: "toppings" },
    { model: DetailPorduct, as: "details" },
];

// create product

export const createProduct = async (req: Request, res: Response) => {
    const uploadedImage = req.file?.filename;
    let createCommitted = false;

    try {
        const toppings = parseChildRows(req.body.toppings, "toppings", TOPPING_FIELDS);
        const details = parseChildRows(req.body.details, "details", DETAIL_FIELDS);

        const product = await sequelize.transaction(async (transaction) => {
            const {
                toppings: _ignoredToppings,
                details: _ignoredDetails,
                product_uuid: _ignoredProductUuid,
                ...productData
            } = req.body;

            productData.product_uuid = await maxid(Products, "product_uuid", {
                transaction,
            });
            productData.sku = await maxsku(
                Products,
                "sku",
                req.body.sku || "",
                transaction
            );
            if (!productData.barcode) {
                productData.barcode = await generateBarCode(
                    req.body.shopid,
                    transaction
                );
            }
            productData.images = uploadedImage || "";
            productData.types = normalizeTypes(req.body.types);

            const created = await Products.create(productData, { transaction });

            if (toppings.length > 0) {
                await Toppings.bulkCreate(
                    buildChildRows(toppings, TOPPING_FIELDS, created.product_uuid) as any,
                    { transaction }
                );
            }

            if (details.length > 0) {
                await DetailPorduct.bulkCreate(
                    buildChildRows(details, DETAIL_FIELDS, created.product_uuid) as any,
                    { transaction }
                );
            }

            return Products.findByPk(created.product_uuid, {
                transaction,
                include: productChildInclude,
            });
        });

        createCommitted = true;

        return res.status(200).json({
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        if (uploadedImage && !createCommitted) deleteFile("product", uploadedImage);

        if (error instanceof ProductRequestError) {
            return res.status(error.status).json({ error: error.message });
        }

        console.error("createProduct error:", error);
        return res.status(500).json({ error: "Failed to create product" });
    }
};
// update product
export const updateProduct = async (req: Request<{ id: string }>, res: Response) => {
    const uploadedImage = req.file?.filename;
    const hasToppings = Object.prototype.hasOwnProperty.call(req.body, "toppings");
    const hasDetails = Object.prototype.hasOwnProperty.call(req.body, "details");
    let updateCommitted = false;

    try {
        let product_uuid: number;
        try {
            product_uuid = Number(atob(req.params.id));
        } catch {
            throw new ProductRequestError(400, "Invalid product id");
        }

        if (!Number.isInteger(product_uuid) || product_uuid <= 0) {
            throw new ProductRequestError(400, "Invalid product id");
        }

        const toppings = hasToppings
            ? parseChildRows(req.body.toppings, "toppings", TOPPING_FIELDS)
            : [];
        const details = hasDetails
            ? parseChildRows(req.body.details, "details", DETAIL_FIELDS)
            : [];
        let previousImage: string | null = null;

        const updatedProduct = await sequelize.transaction(async (transaction) => {
            const product = await Products.findByPk(product_uuid, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!product) {
                throw new ProductRequestError(404, "Product not found");
            }

            previousImage = product.images;

            const {
                toppings: _ignoredToppings,
                details: _ignoredDetails,
                product_uuid: _ignoredProductUuid,
                createdAt: _ignoredCreatedAt,
                images: _ignoredImages,
                ...productData
            } = req.body;

            productData.updatedAt = new Date();
            if (uploadedImage) productData.images = uploadedImage;
            if (productData.types !== undefined) {
                productData.types = normalizeTypes(productData.types);
            }

            await product.update(productData, { transaction });

            if (hasToppings) {
                await syncProductChildren(
                    Toppings,
                    product.product_uuid,
                    toppings,
                    "topping",
                    TOPPING_FIELDS,
                    transaction
                );
            }

            if (hasDetails) {
                await syncProductChildren(
                    DetailPorduct,
                    product.product_uuid,
                    details,
                    "detail",
                    DETAIL_FIELDS,
                    transaction
                );
            }

            return Products.findByPk(product.product_uuid, {
                transaction,
                include: productChildInclude,
            });
        });

        updateCommitted = true;

        if (uploadedImage && previousImage && previousImage !== uploadedImage) {
            deleteFile("product", previousImage);
        }

        return res.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct,
        });
    } catch (error) {
        if (uploadedImage && !updateCommitted) deleteFile("product", uploadedImage);

        if (error instanceof ProductRequestError) {
            return res.status(error.status).json({ error: error.message });
        }

        console.error("updateProduct error:", error);
        return res.status(500).json({ error: "Failed to update product" });
    }
};



// delete product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product_uuid = atob(req.params.id);
        const product = await Products.findByPk(product_uuid);
        if (!product) return res.status(404).json({ error: "Product not found" });
        if (product.dataValues.images) {
            deleteFile("product", product.dataValues.images);
        }
     const deleted=   await Products.destroy({ where: { product_uuid: product_uuid } });
     if(deleted){
        await Toppings.destroy({ where: { productid: product_uuid } });
        await DetailPorduct.destroy({ where: { productid: product_uuid } });
        await Promotion.destroy({ where: { productid: product_uuid } });
     }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
};
export const updatedStatus = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const product_uuid = atob(req.params.id);
        const product = await Products.findByPk(product_uuid);
        if (!product) return res.status(404).json({ error: "Product not found" });
        req.body.updatedAt = new Date();
        const updated = await Products.update(req.body, {
            where: { product_uuid: product_uuid },
        });
        if (!updated) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
}
// get product 
export const getProducts = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "product_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { categorieid, brandid, uniteid, sizeid, shopid } = req.body as any;
        const whereConditions: any = {
            shopid: shopid,
        }
        if (categorieid) {
            whereConditions['$brand.categorieid$'] = categorieid;
        }
        if (brandid) {
            whereConditions.brandid = brandid;
        }
        if (uniteid) {
            whereConditions.uniteid = uniteid;
        }
        if (sizeid) {
            whereConditions.sizeid = sizeid;
        }
        const { rows, count } = await Products.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
                ],
            },
            include: [
                {
                    model: Brands,
                    as: "brand",
                    include: [
                        {
                            model: Categories,
                            as: "category",
                        },
                    ],
                },
                {
                    model: Units,
                    as: "unit",
                },
                {
                    model: Sizes,
                    as: "size",
                },
                ...productChildInclude,
            ],
        })
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

export const getProductsbyid = async (req: Request<{id: string}>, res: Response) => {
    try {
        const productid = req.params.id;
       
        const product = await Products.findOne({
            where: { product_uuid: productid },
            attributes: {
                include: [
                    [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
                ],
            },
            include: [
                {
                    model: Brands,
                    as: "brand",
                    include: [
                        {
                            model: Categories,
                            as: "category",
                        },
                    ],
                },
                {
                    model: Units,
                    as: "unit",
                },
                {
                    model: Sizes,
                    as: "size",
                },
                ...productChildInclude,
            ],
        })
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({data:product});
    } catch (error) {
        console.error("getProductsbyid error:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

export const getProductSales = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
        const offset = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "product_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { shopid, brandid, categorieid } = req.body as any;
        const whereConditions: any = {
            shopid: shopid,
            status: 1
        }
        if (brandid) {
            whereConditions.brandid = brandid;
        }
        // if (categorieid) {
        //     whereConditions['$brand.categorieid$'] = categorieid;
        // }

        const { rows, count } = await Products.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
                ],
            },
            include: [
                {
                    model: Brands,
                    as: "brand",
                    required: !!categorieid,
                    where: categorieid
                        ? { categorieid }
                        : undefined
                },
                {
                    model: Units,
                    as: "unit",
                },
                {
                    model: Sizes,
                    as: "size",
                },
                ...productChildInclude,
            ],
        });
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            offset
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}



export const getProductbyCategory = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const categorieid = req.params.id;
        const whereConditions: any = {
            status: 1
        }
        if (categorieid) {
            whereConditions['$brand.categorieid$'] = categorieid;
        }
        const product = await Products.findAll({
            where: whereConditions,
            include: [{
                model: Brands,
                as: "brand",
                attributes: [
                    "brand_uuid", "brandName"
                ]
            },
            {
                model: Units,
                as: "unit",
                attributes: [
                    "unit_uuid", "unitName"
                ]
            },
            {
                model: Sizes,
                as: "size",
                attributes: [
                    "size_uuid", "sizeName"
                ]
            },
            ]
        });
        res.status(200).json({ data: product });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" + req.params.id });
    }
};


export const getProductbyBrand = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const categorieid = req.params.id;
        const whereConditions: any = {
            status: 1
        }
        if (categorieid) {
            whereConditions.categorieid = categorieid;
        }
        const product = await Brands.findAll({
            where: whereConditions,
            include: [
                {
                    model: Products,
                    as: "products",
                    required: true,
                    attributes: [
                        "product_uuid",
                        "productName",
                        "sku",
                        "buyPrices",
                        "sellPrices",
                        "quantity",
                        [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
                    ],
                    include: [
                        {
                            model: Units,
                            as: "unit",
                            attributes: [
                                "unit_uuid", "unitName"
                            ]
                        },
                        {
                            model: Sizes,
                            as: "size",
                            attributes: [
                                "size_uuid", "sizeName"
                            ]
                        },
                    ]
                },
            ]
        });
        res.status(200).json({ data: product });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};


export const getProductbySearch = async (req: Request, res: Response) => {
    try {
        const { shopid, categorieid, searchTerm } = req.body as any;

        const whereConditions: any = {
            status: 1,
            shopid: shopid,
        };

        if (categorieid) {
            whereConditions["$brand.categorieid$"] = categorieid;
        }

        // ✅ ค้นทั้งชื่อสินค้า และรหัสสินค้า
        if (searchTerm) {
            whereConditions[Op.or] = [
                { productName: { [Op.like]: `%${searchTerm}%` } },
                { sku: { [Op.like]: `%${searchTerm}%` } },
            ];
        }

        const product = await Products.findAll({
            where: whereConditions,
            attributes: [
                "product_uuid",
                "productName",
                "sku",
                "barcode",
                "buyPrices",
                "sellPrices",
                "quantity",
                "images",
                [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
            ],
            include: [
                {
                    model: Brands,
                    as: "brand",
                    attributes: ["brandCode", "brandName", "categorieid"],
                },
                {
                    model: Units,
                    as: "unit",
                    attributes: ["unitName"],
                },
                {
                    model: Sizes,
                    as: "size",
                    attributes: ["sizeName"],
                },
                {
                    model: DetailPorduct,
                    as: "detail",
                },
            ],
            order: [["product_uuid", "ASC"]],
        });

        res.status(200).json({ data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};


export const SearchProductbysku = async (req: Request, res: Response) => {
    try {
        const { shopid, searchTerm } = req.body as any;

        const whereConditions: any = {
            status: 1,
            shopid: shopid,
        };

        // ✅ ค้นทั้งรหัสสินค้า (sku) และบาร์โค้ด (barcode)
        if (searchTerm) {
            whereConditions[Op.or] = [
                { sku: { [Op.like]: `%${searchTerm}%` } },
                { barcode: { [Op.like]: `%${searchTerm}%` } },
            ];
        }

        const product = await Products.findAll({
            where: whereConditions,
            attributes: [
                "product_uuid",
                "barcode",
                "productName",
                "sku",
                "buyPrices",
                "sellPrices",
                "quantity",
                "images",
                [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
            ],
            include: [
                {
                    model: Brands,
                    as: "brand",
                    attributes: ["brandCode", "brandName", "categorieid"],
                },
                {
                    model: Units,
                    as: "unit",
                    attributes: ["unitName"],
                },
            ],
            order: [["product_uuid", "ASC"]],
        });

        res.status(200).json({ data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};



export const getProductOptions = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const categorieid = req.params.id;
        const whereConditions: any = {
            status: 1,
        };
        if (categorieid) {
            whereConditions["$brand.categorieid$"] = categorieid;
        }
        const product = await Products.findAll({
            where: whereConditions,
            attributes: [
                "product_uuid",
                "productName",
                "sku",
                "buyPrices",
                "sellPrices",
                "quantity",
                "images",
                [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
            ],
            include: [
                {
                    model: Brands,
                    as: "brand",
                    attributes: ["brandCode", "brandName", "categorieid"],
                },
                {
                    model: Units,
                    as: "unit",
                    attributes: ["unitName"],
                },
            ],
            order: [["product_uuid", "ASC"]],
        });

        res.status(200).json({ data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
