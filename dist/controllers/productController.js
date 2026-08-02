"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductOptions = exports.SearchProductbysku = exports.getProductbySearch = exports.getProductbyBrand = exports.getProductbyCategory = exports.getProductSales = exports.getProducts = exports.updatedStatus = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
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
const Toppings_model_1 = require("../models/Toppings.model");
// create product
const createProduct = async (req, res) => {
    const uploadedImage = req.file?.filename;
    let toppings = [];
    const rawToppings = req.body.toppings;
    if (rawToppings !== undefined && rawToppings !== null && rawToppings !== "") {
        try {
            const parsedToppings = typeof rawToppings === "string"
                ? JSON.parse(rawToppings)
                : rawToppings;
            if (!Array.isArray(parsedToppings) || parsedToppings.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
                throw new Error("Invalid toppings format");
            }
            toppings = parsedToppings;
        }
        catch (error) {
            if (uploadedImage)
                (0, uploadFile_1.deleteFile)("product", uploadedImage);
            return res.status(400).json({
                error: "toppings must be a valid JSON array",
            });
        }
    }
    const skuPrefix = String(req.body.sku ?? "").trim();
    if (!skuPrefix) {
        if (uploadedImage)
            (0, uploadFile_1.deleteFile)("product", uploadedImage);
        return res.status(400).json({ error: "sku is required" });
    }
    if (!req.body.barcode && !req.body.shopid) {
        if (uploadedImage)
            (0, uploadFile_1.deleteFile)("product", uploadedImage);
        return res.status(400).json({
            error: "shopid is required when barcode is not provided",
        });
    }
    try {
        const product = await database_1.sequelize.transaction(async (transaction) => {
            const { toppings: _ignoredToppings, ...productData } = req.body;
            productData.product_uuid = await (0, utils_1.maxid)(Products_1.default, "product_uuid", { transaction });
            productData.sku = await (0, generateBarCode_1.maxsku)(Products_1.default, "sku", skuPrefix, transaction);
            productData.barcode = req.body.barcode || await (0, generateBarCode_1.generateBarCode)(req.body.shopid, transaction);
            productData.images = uploadedImage || "";
            const createdProduct = await Products_1.default.create(productData, { transaction });
            if (toppings.length > 0) {
                const toppingRows = toppings.map(({ _uuid, productid, ...topping }) => ({
                    ...topping,
                    productid: createdProduct.product_uuid,
                }));
                await Toppings_model_1.Toppings.bulkCreate(toppingRows, { transaction });
            }
            return createdProduct;
        });
        res.status(200).json({ message: "Product created successfully", data: product });
    }
    catch (error) {
        if (uploadedImage)
            (0, uploadFile_1.deleteFile)("product", uploadedImage);
        console.error("createProduct error:", error);
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
const updatedStatus = async (req, res) => {
    try {
        const product_uuid = atob(req.params.id);
        const product = await Products_1.default.findByPk(product_uuid);
        if (!product)
            return res.status(404).json({ error: "Product not found" });
        req.body.updatedAt = new Date();
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
exports.updatedStatus = updatedStatus;
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
                },
                {
                    model: Toppings_model_1.Toppings,
                    as: "toppings",
                },
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
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const offset = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "product_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { shopid, brandid, categorieid } = req.body;
        const whereConditions = {
            shopid: shopid,
            status: 1
        };
        if (brandid) {
            whereConditions.brandid = brandid;
        }
        // if (categorieid) {
        //     whereConditions['$brand.categorieid$'] = categorieid;
        // }
        const { rows, count } = await Products_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
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
                    required: !!categorieid,
                    where: categorieid
                        ? { categorieid }
                        : undefined
                },
                {
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
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            offset
        });
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
            whereConditions['$brand.categorieid$'] = categorieid;
        }
        const product = await Products_1.default.findAll({
            where: whereConditions,
            include: [{
                    model: Brands_1.default,
                    as: "brand",
                    attributes: [
                        "brand_uuid", "brandName"
                    ]
                },
                {
                    model: Units_1.default,
                    as: "unit",
                    attributes: [
                        "unit_uuid", "unitName"
                    ]
                },
                {
                    model: Sizes_1.default,
                    as: "size",
                    attributes: [
                        "size_uuid", "sizeName"
                    ]
                },
            ]
        });
        res.status(200).json({ data: product });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch product" + req.params.id });
    }
};
exports.getProductbyCategory = getProductbyCategory;
const getProductbyBrand = async (req, res) => {
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
                    required: true,
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
                                "unit_uuid", "unitName"
                            ]
                        },
                        {
                            model: Sizes_1.default,
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
exports.getProductbyBrand = getProductbyBrand;
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
                "barcode",
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
const SearchProductbysku = async (req, res) => {
    try {
        const { shopid, searchTerm } = req.body;
        const whereConditions = {
            status: 1,
            shopid: shopid,
        };
        // ✅ ค้นทั้งชื่อสินค้า และรหัสสินค้า
        if (searchTerm) {
            whereConditions[sequelize_1.Op.or] = [
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
exports.SearchProductbysku = SearchProductbysku;
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
