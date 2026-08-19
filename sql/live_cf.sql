-- ============================================================
-- Live CF (ຂາຍສົດຜ່ານ Facebook Live)
-- ຕາຕະລາງສຳລັບເກັບປະຫວັດ: ໄລ໌ຄັ້ງໜຶ່ງເອົາສິນຄ້າເຂົ້າຈັກລາຍການ,
-- ແຕ່ລະລາຍການ CF ເຂົ້າມາຈັກຄັ້ງ/ຈັກຊິ້ນ ແລະ ຂາຍໄດ້ເທົ່າໃດ
-- PK ເປັນ INT UNSIGNED ສ້າງຈາກ maxid() ໃນໂຄ້ດ (ບໍ່ໃຊ້ AUTO_INCREMENT)
-- ============================================================

-- 1) ໄລ໌ແຕ່ລະຄັ້ງ
CREATE TABLE IF NOT EXISTS tbl_live_session (
  live_uuid      INT UNSIGNED  NOT NULL,
  shopid         INT           NULL,
  title          VARCHAR(255)  NULL,
  platform       VARCHAR(20)   NULL DEFAULT 'facebook',
  videoid        VARCHAR(64)   NULL,
  videoUrl       VARCHAR(500)  NULL,
  pageid         VARCHAR(64)   NULL,
  accessToken    TEXT          NULL,
  status         INT           NULL DEFAULT 1,   -- 1=ກຳລັງໄລ໌, 2=ຈົບແລ້ວ, 9=ຍົກເລີກ
  startedAt      DATETIME      NULL,
  endedAt        DATETIME      NULL,
  viewers_peak   INT           NULL DEFAULT 0,
  viewers_last   INT           NULL DEFAULT 0,
  total_products INT           NULL DEFAULT 0,   -- ເອົາສິນຄ້າເຂົ້າໄລ໌ຈັກລາຍການ
  total_comments INT           NULL DEFAULT 0,
  total_cf       INT           NULL DEFAULT 0,
  total_orders   INT           NULL DEFAULT 0,
  total_qty      INT           NULL DEFAULT 0,
  total_amount   DECIMAL(15,2) NULL DEFAULT 0,
  description    VARCHAR(255)  NULL,
  createby       INT           NULL,
  createdAt      DATETIME      NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (live_uuid),
  KEY ix_live_shop_status (shopid, status),
  KEY ix_live_shop_start (shopid, startedAt),
  KEY ix_live_video (shopid, videoid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) ສິນຄ້າທີ່ເພີ່ມເຂົ້າໄລ໌ + ການຕັ້ງຄ່າ CF + ຕົວນັບ
CREATE TABLE IF NOT EXISTS tbl_live_product (
  _uuid        INT UNSIGNED  NOT NULL,
  liveid       INT           NULL,
  shopid       INT           NULL,
  productid    INT           NULL,
  code         VARCHAR(6)    NULL,             -- ລະຫັດ CF ເຊັ່ນ A1
  -- ຊື່, SKU, ຫົວໜ່ວຍ, ຮູບ, ລາຄາ ແລະ ສະຕ໋ອກ ດຶງຈາກ tbl_products ດ້ວຍ join (productid)
  -- ການຕັ້ງຄ່າ CF
  deductStock  INT           NULL DEFAULT 1,   -- 1=CF ແລ້ວຕັດສະຕ໋ອກ, 0=ບໍ່ຕັດ
  limit_qty    INT           NULL DEFAULT 0,   -- ຈຳກັດຈຳນວນ CF (0=ບໍ່ຈຳກັດ)
  sort         INT           NULL DEFAULT 0,
  -- ຕົວນັບ
  cf_count     INT           NULL DEFAULT 0,   -- CF ເຂົ້າມາຈັກຄັ້ງ
  cf_qty       INT           NULL DEFAULT 0,   -- CF ເຂົ້າມາຈັກຊິ້ນ
  reject_qty   INT           NULL DEFAULT 0,   -- ຖືກປະຕິເສດ (ເກີນຈຳກັດ/ສະຕ໋ອກບໍ່ພໍ)
  sold_qty     INT           NULL DEFAULT 0,   -- ບັນທຶກອໍເດີແລ້ວຈັກຊິ້ນ
  sold_amount  DECIMAL(15,2) NULL DEFAULT 0,
  stock_end    INT           NULL,             -- ສະຕ໋ອກຕອນປິດໄລ໌
  status       INT           NULL DEFAULT 1,   -- 1=ກຳລັງຂາຍ, 2=ເຕັມ/ໝົດ, 3=ປິດຊົ່ວຄາວ, 9=ເອົາອອກ
  createdAt    DATETIME      NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (_uuid),
  UNIQUE KEY uq_live_product_code (liveid, code),
  KEY ix_live_product_live (liveid, status),
  KEY ix_live_product_product (productid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ຖ້າສ້າງຕາຕະລາງນີ້ໄປແລ້ວແບບເກົ່າ (ມີຄໍລຳສຳເນົາ) ໃຫ້ລຶບອອກດ້ວຍຄຳສັ່ງນີ້:
-- ALTER TABLE tbl_live_product
--   DROP COLUMN productName, DROP COLUMN sku, DROP COLUMN unitName,
--   DROP COLUMN image, DROP COLUMN price, DROP COLUMN stock_start;

-- 3) ຄອມເມັນທີ່ດຶງມາຈາກ Facebook
CREATE TABLE IF NOT EXISTS tbl_live_comment (
  _uuid         INT UNSIGNED  NOT NULL,
  liveid        INT           NULL,
  commentid     VARCHAR(64)   NULL,            -- id ຄອມເມັນຈາກ FB
  fb_userid     VARCHAR(64)   NULL,
  customerName  VARCHAR(255)  NULL,
  picture       VARCHAR(500)  NULL,
  message       TEXT          NULL,
  is_cf         INT           NULL DEFAULT 0,
  code          VARCHAR(6)    NULL,
  quantity      INT           NULL DEFAULT 0,
  liveproductid INT           NULL,
  status        INT           NULL DEFAULT 0,  -- 0=ທຳມະດາ, 1=CF ຈັບຄູ່ໄດ້, 2=ບໍ່ພົບລະຫັດ, 3=ເກີນຈຳກັດ, 4=ບັນທຶກແລ້ວ, 9=ຍົກເລີກ
  commentAt     DATETIME      NULL,
  createdAt     DATETIME      NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (_uuid),
  UNIQUE KEY uq_live_comment (liveid, commentid),
  KEY ix_live_comment_cf (liveid, is_cf),
  KEY ix_live_comment_code (liveid, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) ໃບຈອງ CF ຕໍ່ລູກຄ້າ 1 ຄົນ
CREATE TABLE IF NOT EXISTS tbl_live_order (
  order_uuid    INT UNSIGNED  NOT NULL,
  liveid        INT           NULL,
  shopid        INT           NULL,
  orderNo       VARCHAR(30)   NULL,            -- LV250818-1
  customerid    INT           NULL,            -- ລູກຄ້າໃນລະບົບ
  fb_userid     VARCHAR(64)   NULL,
  customerName  VARCHAR(255)  NULL,
  phone         VARCHAR(30)   NULL,
  address       VARCHAR(255)  NULL,
  total_qty     INT           NULL DEFAULT 0,
  total_amount  DECIMAL(15,2) NULL DEFAULT 0,
  discount      DECIMAL(13,2) NULL DEFAULT 0,
  shipping_fee  DECIMAL(13,2) NULL DEFAULT 0,
  balance_total DECIMAL(15,2) NULL DEFAULT 0,
  status        INT           NULL DEFAULT 1,  -- 1=ຈອງ, 2=ຢືນຢັນ, 3=ຊຳລະແລ້ວ, 4=ສົ່ງແລ້ວ, 9=ຍົກເລີກ
  billid        INT           NULL,            -- ອ້າງອິງ tbl_billsales ເມື່ອແປງເປັນບິນຂາຍ
  description   VARCHAR(255)  NULL,
  createby      INT           NULL,
  createdAt     DATETIME      NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_uuid),
  UNIQUE KEY uq_live_order_no (orderNo),
  KEY ix_live_order_live (liveid, status),
  KEY ix_live_order_fb (fb_userid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) ລາຍການສິນຄ້າໃນໃບຈອງ
CREATE TABLE IF NOT EXISTS tbl_live_order_list (
  _uuid         INT UNSIGNED  NOT NULL,
  orderid       INT           NULL,
  liveid        INT           NULL,
  liveproductid INT           NULL,
  productid     INT           NULL,
  code          VARCHAR(6)    NULL,
  productName   VARCHAR(255)  NULL,
  quantity      INT           NULL DEFAULT 1,
  price         DECIMAL(13,2) NULL DEFAULT 0,
  balance_total DECIMAL(15,2) NULL DEFAULT 0,
  commentid     VARCHAR(64)   NULL,            -- ຄອມເມັນຕົ້ນທາງ (ກັນຊ້ຳ)
  deductStock   INT           NULL DEFAULT 1,
  stock_moved   INT           NULL DEFAULT 0,  -- 1=ຕັດສະຕ໋ອກແລ້ວ
  status        INT           NULL DEFAULT 1,  -- 1=ປົກກະຕິ, 9=ຍົກເລີກ
  createdAt     DATETIME      NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (_uuid),
  UNIQUE KEY uq_live_order_comment (liveid, commentid, code),
  KEY ix_live_list_order (orderid),
  KEY ix_live_list_product (liveid, liveproductid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
