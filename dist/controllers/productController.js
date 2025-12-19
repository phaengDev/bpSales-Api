"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductOptions = exports.getProductbySearch = exports.getProductbyCategory = exports.getProductSales = exports.getProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const uploadFile_1 = require("../utils/uploadFile");
const Products_1 = __importDefault(require("../models/Products"));
const generateBarCode_1 = require("../utils/generateBarCode");
const Brands_1 = __importDefault(require("../models/Brands"));
const Categories_1 = __importDefault(require("../models/Categories"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const Units_1 = __importDefault(require("../models/Units"));
const Wholesale_1 = __importDefault(require("../models/Wholesale"));
const database_1 = require("../config/database");
// create product
const createProduct = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const new_uuid = await (0, utils_1.maxid)(Products_1.default, "product_uuid");
        req.body.product_uuid = new_uuid;
        const skuPrefix = req.body.sku || "";
        const newSku = await (0, generateBarCode_1.maxsku)(Products_1.default, "sku", skuPrefix);
        req.body.sku = newSku;
        if (!req.body.barcode) {
            req.body.barcode = await (0, generateBarCode_1.generateBarCode)(req.body.shopid);
        }
        const images = req.file?.filename;
        req.body.images = images || "";
        const product = await Products_1.default.create(req.body);
        res.status(200).json({ message: "Product created successfully", data: product });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create product" });
    }
};
exports.createProduct = createProduct;
// update product
const updateProduct = async (req, res) => {
    try {
        const product_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const product = await Products_1.default.findByPk(product_uuid);
        if (!product)
            return res.status(404).json({ error: "Product not found" });
        const images = req.file?.filename;
        if (images) {
            req.body.images = images;
            if (product.dataValues.images) {
                (0, uploadFile_1.deleteFile)("product", product.dataValues.images);
            }
        }
        else {
            delete req.body.images;
        }
        const updated = await Products_1.default.update(req.body, {
            where: { product_uuid: product_uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
};
exports.updateProduct = updateProduct;
// delete product
const deleteProduct = async (req, res) => {
    try {
        const product_uuid = atob(req.params.id);
        const product = await Products_1.default.findByPk(product_uuid);
        if (!product)
            return res.status(404).json({ error: "Product not found" });
        if (product.dataValues.images) {
            (0, uploadFile_1.deleteFile)("product", product.dataValues.images);
        }
        await Products_1.default.destroy({ where: { product_uuid: product_uuid } });
        res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
};
exports.deleteProduct = deleteProduct;
// get product 
const getProducts = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "product_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { categorieid, brandid, uniteid, sizeid, shopid } = req.body;
        const whereConditions = {
            shopid: shopid,
        };
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
        const { rows, count } = await Products_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("images")), "url"],
                ],
            },
            include: [
                {
                    model: Brands_1.default,
                    as: "brand",
                    include: [
                        {
                            model: Categories_1.default,
                            as: "category",
                        },
                    ],
                },
                {
                    model: Units_1.default,
                    as: "unit",
                },
                {
                    model: Sizes_1.default,
                    as: "size",
                },
                {
                    model: Wholesale_1.default,
                    as: "price",
                }
            ],
        });
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getProducts = getProducts;
const getProductSales = async (req, res) => {
    const { shopid, brandid, categorieid } = req.body;
    const whereConditions = {
        shopid: shopid,
        status: 1
    };
    if (brandid) {
        whereConditions.brandid = brandid;
    }
    if (categorieid) {
        whereConditions['$brand.categorieid$'] = categorieid;
    }
    try {
        const product = await Products_1.default.findAll({
            where: whereConditions,
            attributes: {
                include: [
                    [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("images")), "url"],
                ],
            },
            include: [
                {
                    model: Brands_1.default,
                    as: "brand",
                }, {
                    model: Units_1.default,
                    as: "unit",
                },
                {
                    model: Sizes_1.default,
                    as: "size",
                }, {
                    model: Wholesale_1.default,
                    as: "price",
                }
            ],
        });
        res.status(200).json({ data: product });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getProductSales = getProductSales;
const getProductbyCategory = async (req, res) => {
    try {
        const categorieid = req.params.id;
        const whereConditions = {
            status: 1
        };
        if (categorieid) {
            whereConditions.categorieid = categorieid;
        }
        const product = await Brands_1.default.findAll({
            where: whereConditions,
            include: [
                {
                    model: Products_1.default,
                    as: "products",
                    attributes: [
                        "product_uuid",
                        "productName",
                        "sku",
                        "buyPrices",
                        "sellPrices",
                        "quantity",
                        [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("images")), "url"],
                    ],
                    include: [
                        {
                            model: Units_1.default,
                            as: "unit",
                            attributes: [
                                "unitName"
                            ]
                        }
                    ]
                },
            ]
        });
        res.status(200).json({ data: product });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
exports.getProductbyCategory = getProductbyCategory;
const getProductbySearch = async (req, res) => {
    try {
        const { shopid, categorieid, searchTerm } = req.body;
        const whereConditions = {
            status: 1,
            shopid: shopid,
        };
        if (categorieid) {
            whereConditions["$brand.categorieid$"] = categorieid;
        }
        // ✅ ค้นทั้งชื่อสินค้า และรหัสสินค้า
        if (searchTerm) {
            whereConditions[sequelize_1.Op.or] = [
                { productName: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { sku: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
            ];
        }
        const product = await Products_1.default.findAll({
            where: whereConditions,
            attributes: [
                "product_uuid",
                "productName",
                "sku",
                "buyPrices",
                "sellPrices",
                "quantity",
                "images",
                [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("images")), "url"],
            ],
            include: [
                {
                    model: Brands_1.default,
                    as: "brand",
                    attributes: ["brandCode", "brandName", "categorieid"],
                },
                {
                    model: Units_1.default,
                    as: "unit",
                    attributes: ["unitName"],
                },
            ],
            order: [["product_uuid", "ASC"]],
        });
        res.status(200).json({ data: product });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
exports.getProductbySearch = getProductbySearch;
const getProductOptions = async (req, res) => {
    try {
        const categorieid = req.params.id;
        const whereConditions = {
            status: 1,
        };
        if (categorieid) {
            whereConditions["$brand.categorieid$"] = categorieid;
        }
        const product = await Products_1.default.findAll({
            where: whereConditions,
            attributes: [
                "product_uuid",
                "productName",
                "sku",
                "buyPrices",
                "sellPrices",
                "quantity",
                "images",
                [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("images")), "url"],
            ],
            include: [
                {
                    model: Brands_1.default,
                    as: "brand",
                    attributes: ["brandCode", "brandName", "categorieid"],
                },
                {
                    model: Units_1.default,
                    as: "unit",
                    attributes: ["unitName"],
                },
            ],
            order: [["product_uuid", "ASC"]],
        });
        res.status(200).json({ data: product });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
exports.getProductOptions = getProductOptions;
