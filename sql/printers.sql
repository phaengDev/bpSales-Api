-- ══ ປຣີນເຕີຂອງແຕ່ລະຮ້ານ ══════════════════════════════════════
-- 1 ຮ້ານມີໄດ້ຫຼາຍໜ່ວຍ, ຜູກສະເພາະຜູ້ໃຊ້ໄດ້ (user_uuid = NULL ຄືໃຊ້ຮ່ວມກັນທັງຮ້ານ)
CREATE TABLE IF NOT EXISTS `tbl_printers` (
  `_uuid`       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shopid`      INT              DEFAULT NULL,
  `user_uuid`   INT              DEFAULT NULL,
  `printerName` VARCHAR(255)     DEFAULT NULL,
  `link`        VARCHAR(20)      DEFAULT 'system'  COMMENT 'system | usb | bluetooth | network',
  `deviceName`  VARCHAR(255)     DEFAULT NULL      COMMENT 'ຊື່ຈິງທີ່ຕິດຕັ້ງໃນເຄື່ອງ',
  `address`     VARCHAR(255)     DEFAULT NULL      COMMENT 'IP:port | vendorId:productId | bluetooth id',
  `purpose`     VARCHAR(20)      DEFAULT 'receipt' COMMENT 'receipt | label | kitchen',
  `paper`       VARCHAR(10)      DEFAULT '80mm',
  `copies`      INT              DEFAULT 1,
  `isDefault`   INT              DEFAULT 0,
  `status`      INT              DEFAULT 1,
  `createdAt`   DATETIME         DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME         DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_uuid`),
  KEY `idx_printers_shop` (`shopid`),
  KEY `idx_printers_user` (`user_uuid`),
  KEY `idx_printers_scope` (`shopid`, `purpose`, `user_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══ ຂໍ້ມູນຮ້ານ: ເລກອາກອນ + ເບີໂທເປັນຂໍ້ຄວາມ ══════════════════
-- MySQL ບໍ່ຮອງຮັບ ADD COLUMN IF NOT EXISTS — ຖ້າມີຄໍລຳແລ້ວມັນຈະແຈ້ງ error ໃຫ້ຂ້າມແຖວນັ້ນໄປ
ALTER TABLE `tbl_shops`
  ADD COLUMN `taxNumber` VARCHAR(50) DEFAULT NULL AFTER `email`;

-- ເບີແບບ '020 5555 1234' ເກັບເປັນ INT ບໍ່ໄດ້
ALTER TABLE `tbl_shops`
  MODIFY COLUMN `phone` VARCHAR(20) DEFAULT NULL;

-- ══ ຮູບຂອງຮ້ານ ═══════════════════════════════════════════════
-- ເກັບແຕ່ຊື່ໄຟລ໌ (ໂລໂກ້ຢູ່ src/uploads/logo, QR ຢູ່ src/uploads/QR) — ຖ້າມີຄໍລຳແລ້ວໃຫ້ຂ້າມ 2 ແຖວນີ້
ALTER TABLE `tbl_shops`
  ADD COLUMN `logo` VARCHAR(255) DEFAULT NULL AFTER `shopName`;
ALTER TABLE `tbl_shops`
  ADD COLUMN `bank_qr` VARCHAR(255) DEFAULT NULL AFTER `logo`;

-- ══ ຮູບແບບບິນ: ຄ່າພື້ນຖານຂອງແຕ່ລະຮ້ານ ═══════════════════════
-- ແຖວດຽວຕໍ່ 1 ຮ້ານ (API ຈະສ້າງໃຫ້ເອງເມື່ອຮ້ານນັ້ນເປີດໜ້າຕັ້ງຄ່າເທື່ອທຳອິດ)
CREATE TABLE IF NOT EXISTS `tbl_bill_settings` (
  `_uuid`       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shopid`      INT              DEFAULT NULL,
  `paper`       VARCHAR(10)      DEFAULT '80mm'    COMMENT '58mm | 80mm | A5 | A4',
  `fontScale`   VARCHAR(5)       DEFAULT 'md'      COMMENT 'sm | md | lg',
  `copies`      INT              DEFAULT 1,
  `margin`      INT              DEFAULT 3         COMMENT 'ໄລຍະຂອບເຈ້ຍ (mm)',
  `showLogo`    INT              DEFAULT 1,
  `showAddress` INT              DEFAULT 1,
  `showPhone`   INT              DEFAULT 1,
  `showSeller`  INT              DEFAULT 1,
  `showTax`     INT              DEFAULT 0,
  `showQr`      INT              DEFAULT 0,
  `autoPrint`   INT              DEFAULT 0,
  `silentPrint` INT              DEFAULT 1,
  `footerText`  VARCHAR(255)     DEFAULT NULL,
  `labelSize`   VARCHAR(20)      DEFAULT '100x150',
  `logo`        VARCHAR(255)     DEFAULT NULL      COMMENT 'ໂລໂກ້ສະເພາະໃນບິນ (ວ່າງ = ໃຊ້ໂລໂກ້ຮ້ານ)',
  `createdAt`   DATETIME         DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME         DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_uuid`),
  UNIQUE KEY `uq_bill_settings_shop` (`shopid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
