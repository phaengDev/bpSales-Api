import { Router } from "express";
import {verifyToken, login, loginWithFacebook, linkFacebook } from "../middleware/auth";
import { createUpload } from "../utils/uploadFile";
import {getProvince, getDistrict, getCountry,
  getCompany,
getShops} from "../controllers/addressController";

import {
  createExchange,
  getExchange
} from "../controllers/exchangeController";

import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
  getUserOption,
  getMyProfile,
  updateMyPassword,
  connectFacebook,
  disconnectFacebook
} from "../controllers/userController";
// ======import supplier controller
import {
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierOption
} from "../controllers/supplierController";
//  import Country controller
import {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOption,
  searchCustomer,
  updateCustomerStatus
} from "../controllers/customerController";

//  import Category controller
import {
  getCategories,
  createCategories,
  updateCategories,
  deleteCategories,
  getCategoriesOption
} from "../controllers/categoriesController";
// import brand controller
import {
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandbycategory
} from "../controllers/brandController";
// import Unit controller
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitOption
} from "../controllers/unitsController";
// import Size controller
import {
  getSize,
  createSize,
  updateSize,
  deleteSize,
  getSizeOption
} from "../controllers/sizeController";
import { 
  getProducts, 
  getProductsbyid,
  createProduct, 
  updateProduct, 
  deleteProduct,
  updatedStatus,
  getProductSales,
  getProductbyCategory,
  getProductbyBrand,
  getProductbySearch,
  SearchProductbysku,
  getProductOptions } from "../controllers/productController";
// import order controller
import {
  addOrder,
  addOrderScan,
  addOrderbyPorduct,
  getCartOrder,
  updateCartPlus,
  updateCartMinus,
  deleteCart,
  addOrderBarcode,
  updatePriceOrder,
  updateQuantityOrder
} from "../controllers/addOrder";
// ===== import order controller
import {
  addorderImport,
  getCartImport,
  deleteCartImport,
  deleteCartImportAll,
  addorderImportSku,
  addorderImportBarcode
} from "../controllers/cartImport";
//  import Price controller

// import Promotion controller
import {
  createPrometion,
  createPrometionMt,
  updatePrometion,
  updatePrometionStatus,
  deletePrometion,
  deletePrometionbyProduct,
  getPrometion,
  getPrometionhasMany,
  getPrometionbypsid
} from "../controllers/promotionController";
// ===========
import {createBillsale,
  createOnline,
  fetchSaleDaily,
  getsaleListbybill,
  getSalebyid,
  fetchSaleList,
  searchBillSale,
  cancleBillsale,
  fetchBillCancel,
  closeSaleDaily} from "../controllers/billsaleController";
import {getTransportation} from "../controllers/transonrtation";
// ========== import billsale
import {createImport,getImportAll} from "../controllers/importController";
import {createPurchase,
  getPurchase,
  getPurchaseById,
  getPurchaseBymain,
  searchBillPurchase} from "../controllers/purchaseController";
// =========== import live CF controller
import {
  createLiveSession,
  getLiveSession,
  getLiveById,
  closeLiveSession,
  createLiveProduct,
  getLiveProduct,
  updateLiveProduct,
  deleteLiveProduct,
  fetchLiveComments,
  createLiveOrder,
  getLiveOrder,
  cancelLiveOrder,
  getLiveReport} from "../controllers/liveController";
// =========== Transportation
const router = Router();
router.post("/auth/login", login);
router.post("/auth/facebook", loginWithFacebook);
router.post("/auth/facebook/link", linkFacebook);

router.get("/address/province", getProvince);
router.get("/address/district/pv/:id", getDistrict);
router.get("/address/country", getCountry);
router.get("/address/company", getCompany);
router.get("/verify",verifyToken);

router.use(verifyToken);
router.get("/shop/:id",getShops);
// ===== User routes
router.get("/user/fetch/:id", getUsers);
router.get("/user/:id", getUserById);
router.post("/user/create", createUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);
router.get("/user/option/:id", getUserOption);
// ===== ໂປຣໄຟລ໌ຂອງຕົນເອງ (ອີງ user_uuid ຈາກ token)
router.get("/user/profile/me", getMyProfile);
router.put("/user/profile/password", updateMyPassword);
router.post("/user/profile/facebook", connectFacebook);
router.delete("/user/profile/facebook", disconnectFacebook);
// ====================
router.get("/exchange/fetch/:id", getExchange);
router.post("/exchange/create", createExchange);

// ====== Supplier routes
router.get("/supplier/fetch/:id", getSupplier);
router.get("/supplier/option/:id", getSupplierOption);
router.post("/supplier/create", createUpload("logo").single("logos"), createSupplier);
router.put("/supplier/:id", createUpload("logo").single("logos"), updateSupplier);
router.delete("/supplier/:id", deleteSupplier);
// ===== Customer routes
router.post("/customer/fetch", getCustomer);
router.post("/customer/option/", getCustomerOption);
router.post("/customer/search", searchCustomer);
router.post("/customer/create", createUpload("profile").single("profiles"), createCustomer);
router.put("/customer/:id", createUpload("profile").single("profiles"), updateCustomer);
router.delete("/customer/:id", deleteCustomer);
router.put("/customer/status/:id", updateCustomerStatus);

// ===== Category routes
router.get("/category/fetch/:id", getCategories);
router.get("/category/option/:id", getCategoriesOption);
router.post("/category/create", createCategories);
router.put("/category/:id", updateCategories);
router.delete("/category/:id", deleteCategories);
// ==== Brand routes
router.post("/brand/fetch", getBrand);
router.get("/brand/option/:id", getBrandbycategory);
router.post("/brand/create", createBrand);
router.put("/brand/:id", updateBrand);
router.delete("/brand/:id", deleteBrand);

// ==== Unit routes
router.get("/unit/fetch/:id", getUnits);
router.get("/unit/option/:id", getUnitOption);
router.post("/unit/create", createUnit);
router.put("/unit/:id", updateUnit);
router.delete("/unit/:id", deleteUnit);
// ==== Size routes
router.get("/size/fetch/:id", getSize);
router.get("/size/option/:id", getSizeOption);
router.post("/size/create", createSize);
router.put("/size/:id", updateSize);
router.delete("/size/:id", deleteSize);
// ==== Product routes
router.post("/product/fetch", getProducts);
router.get("/product/byid/:id", getProductsbyid);
router.post("/product/create", createUpload("product").single("images"), createProduct);
router.put("/product/:id", createUpload("product").single("images"), updateProduct);
router.delete("/product/:id", deleteProduct);
router.put("/product/status/:id", updatedStatus);
router.post("/product/sales", getProductSales);
router.get("/product/category/:id", getProductbyCategory);
router.get("/product/brand/category/:id", getProductbyBrand);
router.post("/product/search", getProductbySearch);
router.post('/product/search/sku',SearchProductbysku)
router.get("/product/option/:id", getProductOptions);
// === Import routes
router.post("/import/create", createImport);
router.post("/import/fetch", getImportAll);
// === Purchase routes
router.post("/purchase/create", createPurchase);
router.post("/purchase/fetch", getPurchase);
router.get("/purchase/:id", getPurchaseById);
router.get("/purchase/main/:id", getPurchaseBymain);
router.post("/purchase/search", searchBillPurchase);

// ===== Order routes
router.post("/order/create", addOrder);
router.post("/order/create/product", addOrderbyPorduct);
router.post("/order/create/scan", addOrderScan);
router.get("/order/fetch/:id", getCartOrder);
router.put("/order/plus/:id", updateCartPlus);
router.put("/order/minus/:id", updateCartMinus);
router.delete("/order/:id", deleteCart);
router.post("/order/getsale", addOrderBarcode);
router.put("/order/price/:id", updatePriceOrder);
router.put("/order/qty/:id", updateQuantityOrder);

// ======= Order import routes
router.post("/cartimport/create", addorderImport);
router.delete("/cartimport/:id", deleteCartImport);
router.delete("/cartimport/All/:id", deleteCartImportAll);
router.get("/cartimport/fetch/:id", getCartImport);
router.post("/cartimport/createbysku", addorderImportSku);
router.post("/cartimport/barcode", addorderImportBarcode);

// ====== Promotion routes
router.post("/promotion/fetch/", getPrometion);
router.post("/promotion/many", getPrometionhasMany);
router.post("/promotion/create", createPrometion);
router.post("/promotion/create/mt", createPrometionMt);
router.put("/promotion/status", updatePrometionStatus);
router.put("/promotion/:id", updatePrometion);
router.delete("/promotion/:id", deletePrometion);
router.delete("/promotion/ps/:id", deletePrometionbyProduct);
router.get("/promotion/product/:id", getPrometionbypsid);

// ======= Billsale routes
router.post("/billsale/create", createBillsale);
router.post("/billsale/create/online", createOnline);
router.post("/billsale/fetch", fetchSaleDaily);
router.get("/billsale/list/:id", getsaleListbybill);
router.get("/billsale/:id", getSalebyid);
router.post("/billsale/fetch/list", fetchSaleList);
router.post("/billsale/search", searchBillSale);
router.put("/billsale/cancel/:id", cancleBillsale);
router.post("/billsale/fetch/cancel", fetchBillCancel);
router.put("/billsale/offsale", closeSaleDaily);
// ========= Transportation routes
router.post("/online/fetch", getTransportation);

// ======= Live CF routes
router.post("/live/create", createLiveSession);
router.post("/live/fetch", getLiveSession);
router.get("/live/report/:id", getLiveReport);
router.put("/live/close/:id", closeLiveSession);
// --- ສິນຄ້າທີ່ໄລ໌
router.post("/live/product/create", createLiveProduct);
router.get("/live/product/:id", getLiveProduct);
router.put("/live/product/:id", updateLiveProduct);
router.delete("/live/product/:id", deleteLiveProduct);
// --- ຄອມເມັນ ແລະ ອໍເດີ CF
router.post("/live/comments", fetchLiveComments);
router.post("/live/order", createLiveOrder);
router.get("/live/order/:id", getLiveOrder);
router.put("/live/order/cancel/:id", cancelLiveOrder);
router.get("/live/:id", getLiveById);

export default router;
