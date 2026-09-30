CREATE TABLE bien_the_laptop (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  laptop_id BIGINT UNSIGNED NOT NULL,
  ma_sku VARCHAR(80) NOT NULL UNIQUE,
  mau_sac VARCHAR(60) NOT NULL,
  ram_gb SMALLINT UNSIGNED NOT NULL,
  ssd_gb SMALLINT UNSIGNED NOT NULL,
  gia_nhap DECIMAL(15,2) NOT NULL DEFAULT 0,
  gia_ban DECIMAL(15,2) NOT NULL,
  gia_khuyen_mai DECIMAL(15,2) NULL,
  anh_dai_dien VARCHAR(500) NULL,
  trang_thai ENUM('ACTIVE','INACTIVE','OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_bienthe_cauhinh (laptop_id,mau_sac,ram_gb,ssd_gb),
  UNIQUE KEY uk_bienthe_laptop_id (laptop_id,id),
  CONSTRAINT fk_bienthe_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id),
  CONSTRAINT ck_bienthe_ram CHECK (ram_gb>0 AND ssd_gb>0),
  CONSTRAINT ck_bienthe_gia CHECK (gia_nhap>=0 AND gia_ban>=0 AND (gia_khuyen_mai IS NULL OR (gia_khuyen_mai>=0 AND gia_khuyen_mai<=gia_ban)))
) ENGINE=InnoDB;

INSERT INTO bien_the_laptop(laptop_id,ma_sku,mau_sac,ram_gb,ssd_gb,gia_nhap,gia_ban,gia_khuyen_mai,anh_dai_dien,trang_thai)
SELECT id,CONCAT(ma_san_pham,'-DEFAULT'),COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(thong_so_ky_thuat,'$.mau_sac')),''),'Tiêu chuẩn'),COALESCE(ram_gb,8),COALESCE(ssd_gb,256),gia_nhap,gia_ban,gia_khuyen_mai,anh_dai_dien,trang_thai FROM laptop;

ALTER TABLE ton_kho ADD COLUMN bien_the_id BIGINT UNSIGNED NULL;
ALTER TABLE chi_tiet_gio_hang ADD COLUMN bien_the_id BIGINT UNSIGNED NULL;
ALTER TABLE chi_tiet_phieu_nhap ADD COLUMN bien_the_id BIGINT UNSIGNED NULL;
ALTER TABLE chi_tiet_don_hang ADD COLUMN bien_the_id BIGINT UNSIGNED NULL, ADD COLUMN cau_hinh JSON NULL;

UPDATE ton_kho t JOIN bien_the_laptop v ON v.laptop_id=t.laptop_id SET t.bien_the_id=v.id;
UPDATE chi_tiet_gio_hang t JOIN bien_the_laptop v ON v.laptop_id=t.laptop_id SET t.bien_the_id=v.id;
UPDATE chi_tiet_phieu_nhap t JOIN bien_the_laptop v ON v.laptop_id=t.laptop_id SET t.bien_the_id=v.id;
UPDATE chi_tiet_don_hang t JOIN bien_the_laptop v ON v.laptop_id=t.laptop_id SET t.bien_the_id=v.id,t.cau_hinh=JSON_OBJECT('maSku',v.ma_sku,'mauSac',v.mau_sac,'ramGb',v.ram_gb,'ssdGb',v.ssd_gb);

ALTER TABLE ton_kho ADD KEY idx_tonkho_laptop (laptop_id), DROP INDEX uk_tonkho_kho_laptop, MODIFY bien_the_id BIGINT UNSIGNED NOT NULL, ADD UNIQUE KEY uk_tonkho_kho_bienthe (kho_id,bien_the_id), ADD CONSTRAINT fk_tonkho_bienthe FOREIGN KEY (laptop_id,bien_the_id) REFERENCES bien_the_laptop(laptop_id,id);
ALTER TABLE chi_tiet_gio_hang ADD KEY idx_giohang_laptop (laptop_id), DROP INDEX uk_giohang_khach_laptop, MODIFY bien_the_id BIGINT UNSIGNED NOT NULL, ADD UNIQUE KEY uk_giohang_khach_bienthe (khach_hang_id,bien_the_id), ADD CONSTRAINT fk_giohang_bienthe FOREIGN KEY (laptop_id,bien_the_id) REFERENCES bien_the_laptop(laptop_id,id);
ALTER TABLE chi_tiet_phieu_nhap MODIFY bien_the_id BIGINT UNSIGNED NOT NULL, ADD CONSTRAINT fk_ctphieunhap_bienthe FOREIGN KEY (laptop_id,bien_the_id) REFERENCES bien_the_laptop(laptop_id,id);
ALTER TABLE chi_tiet_don_hang MODIFY bien_the_id BIGINT UNSIGNED NOT NULL, ADD CONSTRAINT fk_ctdonhang_bienthe FOREIGN KEY (laptop_id,bien_the_id) REFERENCES bien_the_laptop(laptop_id,id);
