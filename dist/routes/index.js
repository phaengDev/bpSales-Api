"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const uploadFile_1 = require("../utils/uploadFile");
const addressController_1 = require("../controllers/addressController");
const userController_1 = require("../controllers/userController");
// ======import supplier controller
const supplierController_1 = require("../controllers/supplierController");
//  import Country controller
const customerController_1 = require("../controllers/customerController");
//  import Category controller
const categoriesController_1 = require("../controllers/categoriesController");
// import brand controller
const brandController_1 = require("../controllers/brandController");
// import Unit controller
const unitsController_1 = require("../controllers/unitsController");
// import Size controller
const sizeController_1 = require("../controllers/sizeController");
const productController_1 = require("../controllers/productController");
// import order controller
const addOrder_1 = require("../controllers/addOrder");
//  import Price controller
const wholesaleController_1 = require("../controllers/wholesaleController");
// import Promotion controller
const promotionController_1 = require("../controllers/promotionController");
// ===========
const billsaleController_1 = require("../controllers/billsaleController");
const router = (0, express_1.Router)();
router.post("/auth/login", auth_1.login);
router.get("/address/province", addressController_1.getProvince);
router.get("/address/district/pv/:id", addressController_1.getDistrict);
router.get("/address/country/:id", addressController_1.getCountry);
router.get("/address/company", addressController_1.getCompany);
router.use(auth_1.verifyToken);
// ===== User routes
router.get("/user/fetch/:id", userController_1.getUsers);
router.get("/user/:id", userController_1.getUserById);
router.post("/user/create", userController_1.createUser);
router.put("/user/:id", userController_1.updateUser);
router.delete("/user/:id", userController_1.deleteUser);
// ====== Supplier routes
router.get("/supplier/fetch/:id", supplierController_1.getSupplier);
router.get("/supplier/option/:id", supplierController_1.getSupplierOption);
router.post("/supplier/create", (0, uploadFile_1.createUpload)("logo").single("logos"), supplierController_1.createSupplier);
router.put("/supplier/:id", (0, uploadFile_1.createUpload)("logo").single("logos"), supplierController_1.updateSupplier);
router.delete("/supplier/:id", supplierController_1.deleteSupplier);
// ===== Customer routes
router.post("/customer/fetch", customerController_1.getCustomer);
router.post("/customer/option/", customerController_1.getCustomerOption);
router.post("/customer/create", (0, uploadFile_1.createUpload)("profile").single("profiles"), customerController_1.createCustomer);
router.put("/customer/:id", (0, uploadFile_1.createUpload)("profile").single("profiles"), customerController_1.updateCustomer);
router.delete("/customer/:id", customerController_1.deleteCustomer);
router.put("/customer/status/:id", customerController_1.updateCustomerStatus);
// ===== Category routes
router.get("/category/fetch/:id", categoriesController_1.getCategories);
router.get("/category/option/:id", categoriesController_1.getCategoriesOption);
router.post("/category/create", categoriesController_1.createCategories);
router.put("/category/:id", categoriesController_1.updateCategories);
router.delete("/category/:id", categoriesController_1.deleteCategories);
// ==== Brand routes
router.post("/brand/fetch", brandController_1.getBrand);
router.get("/brand/option/:id", brandController_1.getBrandbycategory);
router.post("/brand/create", brandController_1.createBrand);
router.put("/brand/:id", brandController_1.updateBrand);
router.delete("/brand/:id", brandController_1.deleteBrand);
// ==== Unit routes
router.get("/unit/fetch/:id", unitsController_1.getUnits);
router.get("/unit/option/:id", unitsController_1.getUnitOption);
router.post("/unit/create", unitsController_1.createUnit);
router.put("/unit/:id", unitsController_1.updateUnit);
router.delete("/unit/:id", unitsController_1.deleteUnit);
// ==== Size routes
router.get("/size/fetch/:id", sizeController_1.getSize);
router.get("/size/option/:id", sizeController_1.getSizeOption);
router.post("/size/create", sizeController_1.createSize);
router.put("/size/:id", sizeController_1.updateSize);
router.delete("/size/:id", sizeController_1.deleteSize);
// ==== Product routes
router.post("/product/fetch", productController_1.getProducts);
router.post("/product/create", (0, uploadFile_1.createUpload)("product").single("images"), productController_1.createProduct);
router.put("/product/:id", (0, uploadFile_1.createUpload)("product").single("images"), productController_1.updateProduct);
router.delete("/product/:id", productController_1.deleteProduct);
router.post("/product/sales", productController_1.getProductSales);
router.get("/product/category/:id", productController_1.getProductbyCategory);
router.post("/product/search", productController_1.getProductbySearch);
router.get("/product/option/:id", productController_1.getProductOptions);
// === Price routes
router.post("/price/create/one", wholesaleController_1.createPriceOne);
router.post("/price/create/mt", wholesaleController_1.createPriceMt);
router.put("/price/:id", wholesaleController_1.updatePrice);
router.delete("/price/:id", wholesaleController_1.deletePrice);
router.delete("/price/product/:id", wholesaleController_1.deletePricebyProduct);
router.get("/price/product/:id", wholesaleController_1.getPricebyProduct);
router.post("/price/fetch", wholesaleController_1.getPriceAll);
// ===== Order routes
router.post("/order/create", addOrder_1.addOrder);
router.get("/order/fetch/:id", addOrder_1.getCartOrder);
router.put("/order/plus/:id", addOrder_1.updateCartPlus);
router.put("/order/minus/:id", addOrder_1.updateCartMinus);
router.delete("/order/:id", addOrder_1.deleteCart);
// ====== Promotion routes
router.post("/promotion/fetch/", promotionController_1.getPrometion);
router.post("/promotion/fetch/many", promotionController_1.getPrometionhasMany);
router.post("/promotion/create", promotionController_1.createPrometion);
router.post("/promotion/create/mt", promotionController_1.createPrometionMt);
router.put("/promotion/:id", promotionController_1.updatePrometion);
router.delete("/promotion/:id", promotionController_1.deletePrometion);
router.get("/promotion/product/:id", promotionController_1.getPrometionbypsid);
// ======= Billsale routes
router.post("/billsale/create", billsaleController_1.createBillsale);
router.post("/billsale/fetch", billsaleController_1.fetchSaleDaily);
router.get("/billsale/list/:id", billsaleController_1.getsaleListbybill);
router.get("/billsale/:id", billsaleController_1.getSalebyid);
exports.default = router;
