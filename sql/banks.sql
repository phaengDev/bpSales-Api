-- ══ ບັນຊີທະນາຄານຂອງແຕ່ລະຮ້ານ ═════════════════════════════════
-- ໄປສະແດງຢູ່ຈໍລູກຄ້າ (POS: /sale?display=customer) ໃຫ້ລູກຄ້າເລືອກສະແກນຈ່າຍ
-- ເກັບແຕ່ຊື່ໄຟລ໌ — ຮູບຈິງຢູ່ src/uploads/bank ແລະ ເປີດຜ່ານ /image/bank/<file>
CREATE TABLE IF NOT EXISTS `tbl_banks` (
  `_uuid`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shopid`    INT          DEFAULT NULL,
  `logo`      VARCHAR(255) DEFAULT NULL COMMENT 'ໂລໂກ້ທະນາຄານ',
  `qr`        VARCHAR(255) DEFAULT NULL COMMENT 'ຮູບ QR ຮັບເງິນ',
  `abbr`      VARCHAR(50)  DEFAULT NULL COMMENT 'ຊື່ຫຍໍ້ ເຊັ່ນ BCEL One',
  `name_la`   VARCHAR(255) DEFAULT NULL,
  `name_en`   VARCHAR(255) DEFAULT NULL,
  `status`    INT          NOT NULL DEFAULT 1,
  `createdAt` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_uuid`),
  KEY `idx_banks_shop` (`shopid`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ມີຕາຕະລາງຢູ່ກ່ອນແລ້ວ (ຍັງບໍ່ມີຄໍລຳ qr) ໃຫ້ແລ່ນແຖວນີ້ເພີ່ມ
-- MySQL ບໍ່ຮອງຮັບ ADD COLUMN IF NOT EXISTS — ຖ້າມີຄໍລຳແລ້ວມັນຈະແຈ້ງ error ໃຫ້ຂ້າມໄປ
ALTER TABLE `tbl_banks`
  ADD COLUMN `qr` VARCHAR(255) DEFAULT NULL AFTER `logo`;
