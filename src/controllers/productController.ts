import { Request, Response } from "express";
import { Op, fn, col, literal, Transaction } from "sequelize";
import { maxid, url } from "../utils";
import { deleteFile } from "../utils/uploadFile";
import Products from "../models/Products";
import { generateBarCode, maxsku } from "../utils/generateBarCode";
import Brands from "../models/Brands";
import Categories from "../models/Categories";
import Sizes from "../models/Sizes.controller";
import Units from "../models/Units.controller";
import Wholesale from "../models/Wholesale";
import { sequelize } from "../config/database";
import { Toppings } from "../models/Toppings.model";
import Promotion from "../models/Promotion";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

interface ToppingPayload {
    _uuid?: number;
    toppingName?: unknown;
    prices?: unknown;
    status?: unknown;
}

class ProductRequestError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "ProductRequestError";
    }
}

const parseToppings = (rawToppings: unknown): ToppingPayload[] => {
    if (rawToppings === undefined || rawToppings === null || rawToppings === "") {
        return [];
    }
    let parsedToppings: unknown = rawToppings;
    if (typeof rawToppings === "string") {
        try {
            parsedToppings = JSON.parse(rawToppings);
        } catch {
            throw new ProductRequestError(400, "toppings must be a valid JSON array");
        }
    }

    if (!Array.isArray(parsedToppings)) {
        throw new ProductRequestError(400, "toppings must be an array");
    }

    return parsedToppings.map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            throw new ProductRequestError(400, "Each topping must be an object");
        }

        const topping = item as Record<string, unknown>;
        const rawUuid = topping._uuid;
        let uuid: number | undefined;

        if (rawUuid !== undefined && rawUuid !== null && rawUuid !== "") {
            uuid = Number(rawUuid);
            if (!Number.isInteger(uuid) || uuid <= 0) {
                throw new ProductRequestError(400, "Invalid topping _uuid");
            }
        }

        return {
            _uuid: uuid,
            toppingName: topping.toppingName,
            prices: topping.prices,
            status: topping.status,
        };
    });
};

const getToppingValues = (topping: ToppingPayload): Record<string, unknown> => {
    const values: Record<string, unknown> = {};

    if (topping.toppingName !== undefined) values.toppingName = topping.toppingName;
    if (topping.prices !== undefined) values.prices = topping.prices;
    if (topping.status !== undefined) values.status = topping.status;

    return values;
};

const syncProductToppings = async (
    productid: number,
    toppings: ToppingPayload[],
    transaction: Transaction
): Promise<void> => {
    const existingToppings = await Toppings.findAll({
        where: { productid },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    const existingIds = new Set(
        existingToppings.map((item) => Number(item._uuid))
    );
    const incomingIds = toppings
        .filter((item) => item._uuid !== undefined)
        .map((item) => item._uuid as number);

    if (new Set(incomingIds).size !== incomingIds.length) {
        throw new ProductRequestError(400, "Duplicate topping _uuid");
    }

    const invalidId = incomingIds.find((uuid) => !existingIds.has(uuid));
    if (invalidId !== undefined) {
        throw new ProductRequestError(
            400,
            `Topping ${invalidId} does not belong to this product`
        );
    }

    const incomingIdSet = new Set(incomingIds);
    const idsToDelete = [...existingIds].filter(
        (uuid) => !incomingIdSet.has(uuid)
    );

    if (idsToDelete.length > 0) {
        await Toppings.destroy({
            where: {
                _uuid: { [Op.in]: idsToDelete },
                productid,
            },
            transaction,
        });
    }

    for (const topping of toppings) {
        if (topping._uuid === undefined) continue;
        const values = getToppingValues(topping);
        if (Object.keys(values).length === 0) continue;
        await Toppings.update(values, {
            where: { _uuid: topping._uuid, productid },
            transaction,
        });
    }

    const newToppings = toppings
        .filter((item) => item._uuid === undefined)
        .map((item) => ({
            ...getToppingValues(item),
            productid,
        }));

    if (newToppings.length > 0) {
        await Toppings.bulkCreate(newToppings, { transaction });
    }
};

// create product

export const createProduct = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const {toppings} = req.body;
        const new_uuid = await maxid(Products, "product_uuid");
        req.body.product_uuid = new_uuid;

        const skuPrefix = req.body.sku || "";
        const newSku = await maxsku(Products, "sku", skuPrefix);

        req.body.sku = newSku;
        if (!req.body.barcode) {
            req.body.barcode = await generateBarCode(req.body.shopid);
        }
        const images = req.file?.filename;
        req.body.images = images || "";

        const product = await Products.create(req.body);

        if (toppings && toppings.length > 0) {
            for (const topping of toppings) {
                topping._uuid = await maxid(Toppings, "_uuid");
                topping.productid = product.product_uuid;
                await Toppings.create(topping, { transaction: t });
            }
            await Toppings.bulkCreate(toppings);
        }

        await t.commit();
        res.status(200).json({ message: "Product created successfully", data: product });
    } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
    }
};
// update product
export const updateProduct = async (req: Request<{ id: string }>, res: Response) => {
    const uploadedImage = req.file?.filename;
    const hasToppings = Object.prototype.hasOwnProperty.call(req.body, "toppings");
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

        const toppings = hasToppings ? parseToppings(req.body.toppings) : [];
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
                product_uuid: _ignoredProductUuid,
                createdAt: _ignoredCreatedAt,
                images: _ignoredImages,
                ...productData
            } = req.body;

            productData.updatedAt = new Date();
            if (uploadedImage) productData.images = uploadedImage;

            await product.update(productData, { transaction });

            if (hasToppings) {
                await syncProductToppings(
                    product.product_uuid,
                    toppings,
                    transaction
                );
            }

            return Products.findByPk(product.product_uuid, {
                transaction,
                include: [{ model: Toppings, as: "toppings" }],
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
                {
                    model: Wholesale,
                    as: "price",
                },
                {
                    model: Toppings,
                    as: "toppings",
                },
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
                }, {
                    model: Wholesale,
                    as: "price",
                }, {
                    model: Toppings,
                    as: "toppings",
                },
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

        // ✅ ค้นทั้งชื่อสินค้า และรหัสสินค้า
        if (searchTerm) {
            whereConditions[Op.or] = [
                { sku: { [Op.like]: `%${searchTerm}%` } },
            ];
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
