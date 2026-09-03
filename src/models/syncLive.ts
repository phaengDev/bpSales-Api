import LiveSession from "./LiveSession";
import LiveProduct from "./LiveProduct";
import LiveOrder from "./LiveOrder";
import LiveComment from "./LiveComment";
import LiveOrderList from "./LiveOrderList";

// ສ້າງຕາຕະລາງ tbl_live_* ຕາມລຳດັບ parent → child
// (ຖ້າ sync ພ້ອມກັນ ຕາຕະລາງລູກອາດຖືກສ້າງກ່ອນພໍ່ແມ່ → errno 150)
export async function syncLiveTables() {
  await LiveSession.sync();
  await LiveProduct.sync();
  await LiveOrder.sync();
  await LiveComment.sync();
  await LiveOrderList.sync();
}

export default syncLiveTables;
