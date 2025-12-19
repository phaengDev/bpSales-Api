import { Router } from "express";
import {verifyToken, login } from "../middleware/auth";
import { createUpload } from "../utils/uploadFile";
import {getProvince, getDistrict, getCountry,getCompany} from "../controllers/addressController";

import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
  getUserOption
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
  createProduct, 
  updateProduct, 
  deleteProduct,
getProductSales,
getProductbyCategory,
getProductbyBrand,
getProductbySearch,
getProductOptions } from "../controllers/productController";
// import order controller
import {
  addOrder,
  getCartOrder,
  updateCartPlus,
  updateCartMinus,
  deleteCart,
  addOrderBarcode
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
import {
  createPriceOne,
  createPriceMt,
  updatePrice,
  deletePrice,
  deletePricebyProduct,
  getPricebyProduct,
  getPriceAll,
} from "../controllers/wholesaleController";

// import Promotion controller
import {
  createPrometion,
  createPrometionMt,
  updatePrometion,
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
  fetchBillCancel} from "../controllers/billsaleController";
import {getTransportation} from "../controllers/transonrtation";
// ========== import billsale
import {createImport,getImportAll} from "../controllers/importController";
import {createPurchase,
  getPurchase,
  getPurchaseById,
  getPurchaseBymain,
  searchBillPurchase} from "../controllers/purchaseController";
// =========== Transportation
const router = Router();
router.post("/auth/login", login);

router.get("/address/province", getProvince);
router.get("/address/district/pv/:id", getDistrict);
router.get("/address/country/:id", getCountry);
router.get("/address/company", getCompany);

router.use(verifyToken);
// ===== User routes
router.get("/user/fetch/:id", getUsers);
router.get("/user/:id", getUserById);
router.post("/user/create", createUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);
router.get("/user/option/:id", getUserOption);
// ====== Supplier routes
router.get("/supplier/fetch/:id", getSupplier);
router.get("/supplier/option/:id", getSupplierOption);
router.post("/supplier/create", createUpload("logo").single("logos"), createSupplier);
router.put("/supplier/:id", createUpload("logo").single("logos"), updateSupplier);
router.delete("/supplier/:id", deleteSupplier);
// ===== Customer routes
router.post("/customer/fetch", getCustomer);
router.post("/customer/option/", getCustomerOption);
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
router.post("/product/create", createUpload("product").single("images"), createProduct);
router.put("/product/:id", createUpload("product").single("images"), updateProduct);
router.delete("/product/:id", deleteProduct);
router.post("/product/sales", getProductSales);
router.get("/product/category/:id", getProductbyCategory);
router.get("/product/brand/category/:id", getProductbyBrand);
router.post("/product/search", getProductbySearch);
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
// === Price routes
router.post("/price/create/one", createPriceOne);
router.post("/price/create/mt", createPriceMt);
router.put("/price/:id", updatePrice);
router.delete("/price/:id", deletePrice);
router.delete("/price/product/:id", deletePricebyProduct);
router.get("/price/product/:id", getPricebyProduct);
router.post("/price/fetch", getPriceAll);
// ===== Order routes
router.post("/order/create", addOrder);
router.get("/order/fetch/:id", getCartOrder);
router.put("/order/plus/:id", updateCartPlus);
router.put("/order/minus/:id", updateCartMinus);
router.delete("/order/:id", deleteCart);
router.post("/order/getsale", addOrderBarcode);
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
// ========= Transportation routes
router.post("/online/fetch", getTransportation);

export default router;
