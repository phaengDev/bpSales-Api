"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const uploadFile_1 = require("../utils/uploadFile");
const addressController_1 = require("../controllers/addressController");
const exchangeController_1 = require("../controllers/exchangeController");
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
// ===== import order controller
const cartImport_1 = require("../controllers/cartImport");
//  import Price controller
const wholesaleController_1 = require("../controllers/wholesaleController");
// import Promotion controller
const promotionController_1 = require("../controllers/promotionController");
// ===========
const billsaleController_1 = require("../controllers/billsaleController");
const transonrtation_1 = require("../controllers/transonrtation");
// ========== import billsale
const importController_1 = require("../controllers/importController");
const purchaseController_1 = require("../controllers/purchaseController");
// =========== Transportation
const router = (0, express_1.Router)();
router.post("/auth/login", auth_1.login);
router.get("/address/province", addressController_1.getProvince);
router.get("/address/district/pv/:id", addressController_1.getDistrict);
router.get("/address/country", addressController_1.getCountry);
router.get("/address/company", addressController_1.getCompany);
router.get("/shop/:id", addressController_1.getShops);
router.use(auth_1.verifyToken);
// ===== User routes
router.get("/user/fetch/:id", userController_1.getUsers);
router.get("/user/:id", userController_1.getUserById);
router.post("/user/create", userController_1.createUser);
router.put("/user/:id", userController_1.updateUser);
router.delete("/user/:id", userController_1.deleteUser);
router.get("/user/option/:id", userController_1.getUserOption);
// ====================
router.get("/exchange/fetch/:id", exchangeController_1.getExchange);
router.put("/exchange/:id", exchangeController_1.updateExchange);
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
router.put("/product/status/:id", productController_1.updatedStatus);
router.post("/product/sales", productController_1.getProductSales);
router.get("/product/category/:id", productController_1.getProductbyCategory);
router.get("/product/brand/category/:id", productController_1.getProductbyBrand);
router.post("/product/search", productController_1.getProductbySearch);
router.post('/product/search/sku', productController_1.SearchProductbysku);
router.get("/product/option/:id", productController_1.getProductOptions);
// === Import routes
router.post("/import/create", importController_1.createImport);
router.post("/import/fetch", importController_1.getImportAll);
// === Purchase routes
router.post("/purchase/create", purchaseController_1.createPurchase);
router.post("/purchase/fetch", purchaseController_1.getPurchase);
router.get("/purchase/:id", purchaseController_1.getPurchaseById);
router.get("/purchase/main/:id", purchaseController_1.getPurchaseBymain);
router.post("/purchase/search", purchaseController_1.searchBillPurchase);
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
router.post("/order/getsale", addOrder_1.addOrderBarcode);
router.put("/order/price/:id", addOrder_1.updatePriceOrder);
// ======= Order import routes
router.post("/cartimport/create", cartImport_1.addorderImport);
router.delete("/cartimport/:id", cartImport_1.deleteCartImport);
router.delete("/cartimport/All/:id", cartImport_1.deleteCartImportAll);
router.get("/cartimport/fetch/:id", cartImport_1.getCartImport);
router.post("/cartimport/createbysku", cartImport_1.addorderImportSku);
router.post("/cartimport/barcode", cartImport_1.addorderImportBarcode);
// ====== Promotion routes
router.post("/promotion/fetch/", promotionController_1.getPrometion);
router.post("/promotion/many", promotionController_1.getPrometionhasMany);
router.post("/promotion/create", promotionController_1.createPrometion);
router.post("/promotion/create/mt", promotionController_1.createPrometionMt);
router.put("/promotion/status", promotionController_1.updatePrometionStatus);
router.put("/promotion/:id", promotionController_1.updatePrometion);
router.delete("/promotion/:id", promotionController_1.deletePrometion);
router.delete("/promotion/ps/:id", promotionController_1.deletePrometionbyProduct);
router.get("/promotion/product/:id", promotionController_1.getPrometionbypsid);
// ======= Billsale routes
router.post("/billsale/create", billsaleController_1.createBillsale);
router.post("/billsale/create/online", billsaleController_1.createOnline);
router.post("/billsale/fetch", billsaleController_1.fetchSaleDaily);
router.get("/billsale/list/:id", billsaleController_1.getsaleListbybill);
router.get("/billsale/:id", billsaleController_1.getSalebyid);
router.post("/billsale/fetch/list", billsaleController_1.fetchSaleList);
router.post("/billsale/search", billsaleController_1.searchBillSale);
router.put("/billsale/cancel/:id", billsaleController_1.cancleBillsale);
router.post("/billsale/fetch/cancel", billsaleController_1.fetchBillCancel);
// ========= Transportation routes
router.post("/online/fetch", transonrtation_1.getTransportation);
exports.default = router;
