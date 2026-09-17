-- ============================================================
-- PROJECT: XÂY DỰNG HỆ THỐNG MOBILE ĐA NỀN TẢNG QUẢN LÝ
--          CỬA HÀNG BÁN LAPTOP (BẢN CẢI TIẾN V2 - 27 BẢNG)
-- Database: MySQL 8.0+
-- Stack: MySQL + Node.js + Expo (React Native)
-- ============================================================

DROP DATABASE IF EXISTS laptop_store;
CREATE DATABASE laptop_store
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE laptop_store;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. VAI TRÒ
CREATE TABLE vai_tro (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_vai_tro VARCHAR(50) NOT NULL UNIQUE,
    mo_ta VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TÀI KHOẢN
CREATE TABLE tai_khoan (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vai_tro_id BIGINT UNSIGNED NOT NULL,
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20) UNIQUE,
    trang_thai ENUM('ACTIVE','LOCKED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    lan_dang_nhap_cuoi DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_taikhoan_vaitro FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id)
) ENGINE=InnoDB;

-- 3. REFRESH TOKEN
CREATE TABLE refresh_token (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_id VARCHAR(150),
    device_name VARCHAR(150),
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME NULL,
    CONSTRAINT fk_refreshtoken_taikhoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. THIẾT BỊ / PUSH TOKEN (mới - bắt buộc cho Expo push notification)
CREATE TABLE thiet_bi (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id BIGINT UNSIGNED NOT NULL,
    expo_push_token VARCHAR(255) NOT NULL,
    device_id VARCHAR(150) NULL,
    platform ENUM('IOS','ANDROID') NOT NULL,
    app_version VARCHAR(20) NULL,
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_thietbi_token (expo_push_token),
    CONSTRAINT fk_thietbi_taikhoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_thietbi_taikhoan ON thiet_bi(tai_khoan_id, trang_thai);

-- 5. OTP XÁC THỰC (mới - đăng ký / đăng nhập / quên mật khẩu qua SMS)
CREATE TABLE otp_xac_thuc (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    so_dien_thoai VARCHAR(20) NOT NULL,
    ma_otp VARCHAR(10) NOT NULL,
    muc_dich ENUM('REGISTER','LOGIN','RESET_PASSWORD','VERIFY_PHONE') NOT NULL,
    so_lan_thu TINYINT UNSIGNED NOT NULL DEFAULT 0,
    da_su_dung BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_otp_sdt_mucdich ON otp_xac_thuc(so_dien_thoai, muc_dich, da_su_dung);

-- 6. KHÁCH HÀNG
CREATE TABLE khach_hang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id BIGINT UNSIGNED NOT NULL UNIQUE,
    ho_ten VARCHAR(150) NOT NULL,
    ngay_sinh DATE NULL,
    gioi_tinh ENUM('MALE','FEMALE','OTHER') DEFAULT 'OTHER',
    avatar_url VARCHAR(500) NULL,
    diem_tich_luy INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_khachhang_taikhoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. NHÂN VIÊN
CREATE TABLE nhan_vien (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id BIGINT UNSIGNED NOT NULL UNIQUE,
    ma_nhan_vien VARCHAR(30) NOT NULL UNIQUE,
    ho_ten VARCHAR(150) NOT NULL,
    chuc_vu VARCHAR(100),
    luong DECIMAL(15,2) DEFAULT 0,
    ngay_vao_lam DATE NULL,
    trang_thai ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_nhanvien_taikhoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. HÃNG LAPTOP
CREATE TABLE hang_laptop (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_hang VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT NULL,
    logo_url VARCHAR(500) NULL,
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. DANH MỤC (cải tiến: hỗ trợ phân cấp)
CREATE TABLE danh_muc (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_danh_muc VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT UNSIGNED NULL,
    thu_tu INT UNSIGNED NOT NULL DEFAULT 0,
    mo_ta TEXT NULL,
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_danhmuc_parent FOREIGN KEY (parent_id) REFERENCES danh_muc(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_danhmuc_parent ON danh_muc(parent_id);

-- 10. LAPTOP (cải tiến: tách cột thông số chính để filter/index, giữ JSON cho phần phụ)
CREATE TABLE laptop (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_san_pham VARCHAR(50) NOT NULL UNIQUE,
    hang_laptop_id BIGINT UNSIGNED NOT NULL,
    danh_muc_id BIGINT UNSIGNED NOT NULL,
    ten_san_pham VARCHAR(255) NOT NULL,
    slug VARCHAR(300) UNIQUE,
    gia_nhap DECIMAL(15,2) NOT NULL DEFAULT 0,
    gia_ban DECIMAL(15,2) NOT NULL,
    gia_khuyen_mai DECIMAL(15,2) NULL,
    mo_ta TEXT NULL,
    anh_dai_dien VARCHAR(500) NULL,
    bao_hanh_thang INT UNSIGNED NOT NULL DEFAULT 12,
    -- Cột thông số chính (đã tách để filter/index nhanh)
    cpu VARCHAR(100) NULL,
    ram_gb SMALLINT UNSIGNED NULL,
    ssd_gb SMALLINT UNSIGNED NULL,
    gpu VARCHAR(100) NULL,
    man_hinh_inch DECIMAL(3,1) NULL,
    tan_so_quet_hz SMALLINT UNSIGNED NULL,
    -- Thông số phụ ít dùng để lọc, giữ dạng JSON
    thong_so_ky_thuat JSON NULL,
    trang_thai ENUM('ACTIVE','INACTIVE','OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_laptop_hang FOREIGN KEY (hang_laptop_id) REFERENCES hang_laptop(id),
    CONSTRAINT fk_laptop_danhmuc FOREIGN KEY (danh_muc_id) REFERENCES danh_muc(id)
) ENGINE=InnoDB;

CREATE INDEX idx_laptop_hang ON laptop(hang_laptop_id);
CREATE INDEX idx_laptop_danhmuc ON laptop(danh_muc_id);
CREATE INDEX idx_laptop_gia ON laptop(gia_ban);
CREATE INDEX idx_laptop_cpu ON laptop(cpu);
CREATE INDEX idx_laptop_ram ON laptop(ram_gb);
CREATE INDEX idx_laptop_gpu ON laptop(gpu);
CREATE INDEX idx_laptop_hang_gia_ram ON laptop(hang_laptop_id, gia_ban, ram_gb);
ALTER TABLE laptop ADD FULLTEXT INDEX ft_laptop_search (ten_san_pham, mo_ta);

-- 11. HÌNH ẢNH LAPTOP
CREATE TABLE hinh_anh_laptop (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    laptop_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    la_anh_chinh BOOLEAN NOT NULL DEFAULT FALSE,
    thu_tu INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hinhanh_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. KHO
CREATE TABLE kho (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_kho VARCHAR(30) NOT NULL UNIQUE,
    ten_kho VARCHAR(150) NOT NULL,
    dia_chi VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. TỒN KHO
CREATE TABLE ton_kho (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kho_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    so_luong INT UNSIGNED NOT NULL DEFAULT 0,
    so_luong_da_dat INT UNSIGNED NOT NULL DEFAULT 0,
    muc_ton_toi_thieu INT UNSIGNED NOT NULL DEFAULT 5,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tonkho_kho_laptop (kho_id, laptop_id),
    CONSTRAINT fk_tonkho_kho FOREIGN KEY (kho_id) REFERENCES kho(id) ON DELETE CASCADE,
    CONSTRAINT fk_tonkho_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. NHÀ CUNG CẤP
CREATE TABLE nha_cung_cap (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_ncc VARCHAR(30) NOT NULL UNIQUE,
    ten_ncc VARCHAR(200) NOT NULL,
    nguoi_lien_he VARCHAR(150),
    so_dien_thoai VARCHAR(20),
    email VARCHAR(150),
    dia_chi VARCHAR(255),
    ghi_chu TEXT,
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 15. PHIẾU NHẬP
CREATE TABLE phieu_nhap (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_phieu VARCHAR(30) NOT NULL UNIQUE,
    nha_cung_cap_id BIGINT UNSIGNED NOT NULL,
    kho_id BIGINT UNSIGNED NOT NULL,
    nhan_vien_id BIGINT UNSIGNED NOT NULL,
    tong_tien DECIMAL(15,2) NOT NULL DEFAULT 0,
    ghi_chu TEXT,
    trang_thai ENUM('DRAFT','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    ngay_nhap DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phieunhap_ncc FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id),
    CONSTRAINT fk_phieunhap_kho FOREIGN KEY (kho_id) REFERENCES kho(id),
    CONSTRAINT fk_phieunhap_nhanvien FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id)
) ENGINE=InnoDB;

-- 16. CHI TIẾT PHIẾU NHẬP
CREATE TABLE chi_tiet_phieu_nhap (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phieu_nhap_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    so_luong INT UNSIGNED NOT NULL,
    don_gia DECIMAL(15,2) NOT NULL,
    thanh_tien DECIMAL(15,2) GENERATED ALWAYS AS (so_luong * don_gia) STORED,
    CONSTRAINT fk_ctphieunhap_phieu FOREIGN KEY (phieu_nhap_id) REFERENCES phieu_nhap(id) ON DELETE CASCADE,
    CONSTRAINT fk_ctphieunhap_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id)
) ENGINE=InnoDB;

-- 17. ĐỊA CHỈ KHÁCH HÀNG
CREATE TABLE dia_chi (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id BIGINT UNSIGNED NOT NULL,
    nguoi_nhan VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    tinh_thanh VARCHAR(100) NOT NULL,
    quan_huyen VARCHAR(100) NOT NULL,
    phuong_xa VARCHAR(100) NOT NULL,
    dia_chi_chi_tiet VARCHAR(255) NOT NULL,
    mac_dinh BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_diachi_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. CHI TIẾT GIỎ HÀNG
CREATE TABLE chi_tiet_gio_hang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    so_luong INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_giohang_khach_laptop (khach_hang_id, laptop_id),
    CONSTRAINT fk_ctgiohang_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE,
    CONSTRAINT fk_ctgiohang_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. KHUYẾN MÃI (cải tiến: bổ sung danh_muc_id / hang_laptop_id cho scope CATEGORY/BRAND)
CREATE TABLE khuyen_mai (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_khuyen_mai VARCHAR(50) NOT NULL UNIQUE,
    ten_khuyen_mai VARCHAR(200) NOT NULL,
    pham_vi_ap_dung ENUM('ALL','PRODUCT','CATEGORY','BRAND') NOT NULL DEFAULT 'ALL',
    danh_muc_id BIGINT UNSIGNED NULL,
    hang_laptop_id BIGINT UNSIGNED NULL,
    loai_giam ENUM('PERCENT','FIXED') NOT NULL,
    gia_tri_giam DECIMAL(15,2) NOT NULL,
    don_hang_toi_thieu DECIMAL(15,2) NOT NULL DEFAULT 0,
    giam_toi_da DECIMAL(15,2) NULL,
    so_luong INT UNSIGNED NOT NULL DEFAULT 0,
    so_luong_da_dung INT UNSIGNED NOT NULL DEFAULT 0,
    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL,
    trang_thai ENUM('ACTIVE','INACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    mo_ta TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_km_danhmuc FOREIGN KEY (danh_muc_id) REFERENCES danh_muc(id) ON DELETE SET NULL,
    CONSTRAINT fk_km_hang FOREIGN KEY (hang_laptop_id) REFERENCES hang_laptop(id) ON DELETE SET NULL
) ENGINE=InnoDB;
-- Quy ước dùng ở tầng service (Node.js):
--  ALL      -> áp dụng toàn shop
--  PRODUCT  -> dùng bảng chi_tiet_khuyen_mai
--  CATEGORY -> dùng khuyen_mai.danh_muc_id
--  BRAND    -> dùng khuyen_mai.hang_laptop_id

-- 20. CHI TIẾT KHUYẾN MÃI (scope PRODUCT)
CREATE TABLE chi_tiet_khuyen_mai (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khuyen_mai_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    UNIQUE KEY uk_km_laptop (khuyen_mai_id, laptop_id),
    CONSTRAINT fk_ctkm_km FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id) ON DELETE CASCADE,
    CONSTRAINT fk_ctkm_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 21. ĐƠN HÀNG
CREATE TABLE don_hang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_don_hang VARCHAR(40) NOT NULL UNIQUE,
    khach_hang_id BIGINT UNSIGNED NOT NULL,
    dia_chi_id BIGINT UNSIGNED NULL,
    khuyen_mai_id BIGINT UNSIGNED NULL,
    nhan_vien_id BIGINT UNSIGNED NULL,
    phuong_thuc_nhan ENUM('DELIVERY','PICKUP') NOT NULL DEFAULT 'DELIVERY',
    tong_tien_hang DECIMAL(15,2) NOT NULL DEFAULT 0,
    phi_van_chuyen DECIMAL(15,2) NOT NULL DEFAULT 0,
    tien_giam DECIMAL(15,2) NOT NULL DEFAULT 0,
    tong_thanh_toan DECIMAL(15,2) NOT NULL DEFAULT 0,
    ghi_chu_khach_hang TEXT,
    ghi_chu_nhan_vien TEXT,
    trang_thai ENUM(
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'
    ) NOT NULL DEFAULT 'PENDING',
    ly_do_huy VARCHAR(500) NULL,
    ngay_dat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_xac_nhan DATETIME NULL,
    ngay_giao DATETIME NULL,
    ngay_hoan_thanh DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donhang_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
    CONSTRAINT fk_donhang_diachi FOREIGN KEY (dia_chi_id) REFERENCES dia_chi(id) ON DELETE SET NULL,
    CONSTRAINT fk_donhang_khuyenmai FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id) ON DELETE SET NULL,
    CONSTRAINT fk_donhang_nhanvien FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_donhang_trangthai ON don_hang(trang_thai);
CREATE INDEX idx_donhang_khachhang ON don_hang(khach_hang_id);

-- 22. CHI TIẾT ĐƠN HÀNG
CREATE TABLE chi_tiet_don_hang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    don_hang_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    ten_san_pham VARCHAR(255) NOT NULL,
    don_gia DECIMAL(15,2) NOT NULL,
    so_luong INT UNSIGNED NOT NULL,
    thanh_tien DECIMAL(15,2) GENERATED ALWAYS AS (don_gia * so_luong) STORED,
    CONSTRAINT fk_ctdonhang_donhang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
    CONSTRAINT fk_ctdonhang_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id)
) ENGINE=InnoDB;

-- 23. THANH TOÁN (cải tiến: cho phép nhiều lần thử thanh toán trên 1 đơn hàng)
CREATE TABLE thanh_toan (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    don_hang_id BIGINT UNSIGNED NOT NULL,
    lan_thu TINYINT UNSIGNED NOT NULL DEFAULT 1,
    phuong_thuc ENUM('COD','BANK_TRANSFER','MOMO','VNPAY','ZALOPAY') NOT NULL,
    trang_thai ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    ma_giao_dich VARCHAR(150) NULL UNIQUE,
    so_tien DECIMAL(15,2) NOT NULL,
    thoi_gian_thanh_toan DATETIME NULL,
    noi_dung TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_thanhtoan_donhang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_thanhtoan_donhang ON thanh_toan(don_hang_id, trang_thai);
-- Lấy giao dịch hiệu lực: SELECT * FROM thanh_toan WHERE don_hang_id=? AND trang_thai='PAID' LIMIT 1

-- 24. ĐÁNH GIÁ
CREATE TABLE danh_gia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    don_hang_id BIGINT UNSIGNED NULL,
    so_sao TINYINT UNSIGNED NOT NULL,
    noi_dung TEXT,
    anh_url VARCHAR(500) NULL,
    trang_thai ENUM('PENDING','APPROVED','HIDDEN') NOT NULL DEFAULT 'APPROVED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_danhgia_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE,
    CONSTRAINT fk_danhgia_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE,
    CONSTRAINT fk_danhgia_donhang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_danhgia_laptop ON danh_gia(laptop_id, trang_thai);

-- 25. SẢN PHẨM YÊU THÍCH
CREATE TABLE san_pham_yeu_thich (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_yeuthich_khach_laptop (khach_hang_id, laptop_id),
    CONSTRAINT fk_yeuthich_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE,
    CONSTRAINT fk_yeuthich_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 26. BANNER QUẢNG CÁO
CREATE TABLE banner_quang_cao (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tieu_de VARCHAR(200) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    loai_banner ENUM('SLIDER','POPUP','HOME_BANNER','CATEGORY_BANNER') NOT NULL,
    link_dich VARCHAR(300) NULL,
    thu_tu INT UNSIGNED NOT NULL DEFAULT 0,
    ngay_bat_dau DATETIME NULL,
    ngay_ket_thuc DATETIME NULL,
    trang_thai ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 27. THÔNG BÁO
CREATE TABLE thong_bao (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id BIGINT UNSIGNED NOT NULL,
    loai_thong_bao ENUM('ORDER_CREATED','ORDER_CONFIRMED','ORDER_SHIPPING','ORDER_DELIVERED','ORDER_CANCELLED','PROMOTION','SYSTEM') NOT NULL,
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT NOT NULL,
    du_lieu JSON NULL,
    da_doc BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_thongbao_taikhoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_thongbao_taikhoan ON thong_bao(tai_khoan_id, da_doc);

-- ============================================================
-- DỮ LIỆU MẪU CƠ BẢN
-- ============================================================

INSERT INTO vai_tro (id, ten_vai_tro, mo_ta) VALUES
(1, 'ADMIN', 'Quản trị hệ thống'),
(2, 'STAFF', 'Nhân viên cửa hàng'),
(3, 'CUSTOMER', 'Khách hàng');

INSERT INTO tai_khoan (id, vai_tro_id, ten_dang_nhap, mat_khau_hash, email, so_dien_thoai, trang_thai) VALUES
(1, 1, 'admin', '$2b$10$demoHashAdmin', 'admin@laptopstore.vn', '0900000001', 'ACTIVE'),
(3, 3, 'nguyenvana', '$2b$10$demoHashUser01', 'nguyenvana@gmail.com', '0900000003', 'ACTIVE');

INSERT INTO khach_hang (id, tai_khoan_id, ho_ten, ngay_sinh, gioi_tinh, diem_tich_luy) VALUES
(1, 3, 'Nguyễn Văn A', '2004-05-10', 'MALE', 120);

INSERT INTO hang_laptop (id, ten_hang) VALUES (1, 'ASUS'), (2, 'DELL');

INSERT INTO danh_muc (id, ten_danh_muc, parent_id) VALUES
(1, 'Laptop Gaming', NULL),
(2, 'Laptop Văn phòng', NULL);

-- Insert Laptop: cột thông số chính đã tách + JSON đầy đủ cho phần phụ
INSERT INTO laptop (
    id, ma_san_pham, hang_laptop_id, danh_muc_id, ten_san_pham, slug,
    gia_nhap, gia_ban, cpu, ram_gb, ssd_gb, gpu, man_hinh_inch, tan_so_quet_hz,
    thong_so_ky_thuat
) VALUES
(1, 'L001', 1, 1, 'ASUS TUF Gaming F15', 'asus-tuf-gaming-f15',
    18000000, 21990000, 'Intel Core i7-12700H', 16, 512, 'RTX 4060 8GB', 15.6, 144,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1080", "can_nang_kg": 2.2, "cong_ket_noi": ["USB-C", "HDMI 2.1", "RJ45"]}'),
(2, 'L003', 2, 2, 'Dell Inspiron 15', 'dell-inspiron-15',
    14000000, 16990000, 'Intel Core i5-1335U', 16, 512, 'Intel Iris Xe', 15.6, 60,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1080", "can_nang_kg": 1.7, "cong_ket_noi": ["USB-C", "HDMI", "RJ45"]}');

-- Giỏ hàng
INSERT INTO chi_tiet_gio_hang (khach_hang_id, laptop_id, so_luong) VALUES (1, 2, 1);

-- Khuyến mãi (scope PRODUCT)
INSERT INTO khuyen_mai (id, ma_khuyen_mai, ten_khuyen_mai, pham_vi_ap_dung, loai_giam, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc) VALUES
(1, 'GIAM10', 'Giảm 10%', 'PRODUCT', 'PERCENT', 10, '2026-01-01', '2026-12-31');
INSERT INTO chi_tiet_khuyen_mai (khuyen_mai_id, laptop_id) VALUES (1, 1);

-- Banner quảng cáo mẫu
INSERT INTO banner_quang_cao (tieu_de, image_url, loai_banner, link_dich) VALUES
('Back to School', 'https://example.com/banner1.jpg', 'HOME_BANNER', '/category/sinh-vien');

SET FOREIGN_KEY_CHECKS = 1;