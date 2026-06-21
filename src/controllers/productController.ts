import e, { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, url } from "../utils";
import { deleteFile } from "../utils/uploadFile";
import Products from "../models/Products";
import { generateBarCode, maxsku } from "../utils/generateBarCode";
import Brands from "../models/Brands";
import Categories from "../models/Categories";
import Sizes from "../models/Sizes";
import Units from "../models/Units";
import Wholesale from "../models/Wholesale";
import { sequelize } from "../config/database";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
// create product

export const createProduct = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
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
        res.status(200).json({ message: "Product created successfully", data: product });
    } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
    }
};
// update product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const product = await Products.findByPk(product_uuid);
        if (!product) return res.status(404).json({ error: "Product not found" });
        const images = req.file?.filename;
        if (images) {
            req.body.images = images;
            if (product.dataValues.images) {
                deleteFile("product", product.dataValues.images);
            }
        } else {
            delete req.body.images;
        }
        const updated = await Products.update(req.body, {
            where: { product_uuid: product_uuid },
        });
        if (!updated) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
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
        await Products.destroy({ where: { product_uuid: product_uuid } });
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
                }
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
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
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
                }
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