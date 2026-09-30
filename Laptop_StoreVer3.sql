-- ============================================================
-- PROJECT: XÂY DỰNG HỆ THỐNG MOBILE ĐA NỀN TẢNG QUẢN LÝ
--          CỬA HÀNG BÁN LAPTOP (BẢN CẢI TIẾN V4 - 26 BẢNG)
-- Database: MySQL 8.0+
-- Stack: MySQL + Node.js + Expo (React Native)
-- ============================================================

DROP DATABASE IF EXISTS Laptop_StoreVer3;
CREATE DATABASE Laptop_StoreVer3
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE Laptop_StoreVer3;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TÀI KHOẢN
-- Vai trò là tập giá trị cố định nên lưu trực tiếp, tránh một bảng và một JOIN không cần thiết.
CREATE TABLE tai_khoan (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vai_tro ENUM('ADMIN','STAFF','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20) UNIQUE,
    trang_thai ENUM('ACTIVE','LOCKED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    lan_dang_nhap_cuoi DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. REFRESH TOKEN
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

-- 3. THIẾT BỊ / PUSH TOKEN (mới - bắt buộc cho Expo push notification)
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
    KEY idx_thietbi_taikhoan (tai_khoan_id, trang_thai),
    CONSTRAINT fk_thietbi_taikhoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. OTP XÁC THỰC (mới - đăng ký / đăng nhập / quên mật khẩu qua SMS)
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

-- 5. KHÁCH HÀNG
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

-- 6. NHÂN VIÊN
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

-- 7. HÃNG LAPTOP
CREATE TABLE hang_laptop (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_hang VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT NULL,
    logo_url VARCHAR(500) NULL,
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. DANH MỤC (cải tiến: hỗ trợ phân cấp)
CREATE TABLE danh_muc (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_danh_muc VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT UNSIGNED NULL,
    thu_tu INT UNSIGNED NOT NULL DEFAULT 0,
    mo_ta TEXT NULL,
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_danhmuc_parent (parent_id),
    CONSTRAINT fk_danhmuc_parent FOREIGN KEY (parent_id) REFERENCES danh_muc(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. LAPTOP (cải tiến: tách cột thông số chính để filter/index, giữ JSON cho phần phụ)
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
    KEY idx_laptop_danhmuc (danh_muc_id),
    KEY idx_laptop_hang_gia_ram (hang_laptop_id, gia_ban, ram_gb),
    CONSTRAINT fk_laptop_hang FOREIGN KEY (hang_laptop_id) REFERENCES hang_laptop(id),
    CONSTRAINT fk_laptop_danhmuc FOREIGN KEY (danh_muc_id) REFERENCES danh_muc(id)
) ENGINE=InnoDB;

CREATE INDEX idx_laptop_gia ON laptop(gia_ban);
CREATE INDEX idx_laptop_cpu ON laptop(cpu);
CREATE INDEX idx_laptop_ram ON laptop(ram_gb);
CREATE INDEX idx_laptop_gpu ON laptop(gpu);
ALTER TABLE laptop ADD FULLTEXT INDEX ft_laptop_search (ten_san_pham, mo_ta);

-- 10. HÌNH ẢNH LAPTOP
CREATE TABLE hinh_anh_laptop (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    laptop_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    la_anh_chinh BOOLEAN NOT NULL DEFAULT FALSE,
    thu_tu INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hinhanh_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. KHO
CREATE TABLE kho (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_kho VARCHAR(30) NOT NULL UNIQUE,
    ten_kho VARCHAR(150) NOT NULL,
    dia_chi VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    trang_thai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12. TỒN KHO
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

-- 13. NHÀ CUNG CẤP
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

-- 14. PHIẾU NHẬP
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

-- 15. CHI TIẾT PHIẾU NHẬP
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

-- 16. ĐỊA CHỈ KHÁCH HÀNG
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

-- 17. CHI TIẾT GIỎ HÀNG
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

-- 18. KHUYẾN MÃI (cải tiến: bổ sung danh_muc_id / hang_laptop_id cho scope CATEGORY/BRAND)
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

-- 19. CHI TIẾT KHUYẾN MÃI (scope PRODUCT)
CREATE TABLE chi_tiet_khuyen_mai (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khuyen_mai_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    UNIQUE KEY uk_km_laptop (khuyen_mai_id, laptop_id),
    CONSTRAINT fk_ctkm_km FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id) ON DELETE CASCADE,
    CONSTRAINT fk_ctkm_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 20. ĐƠN HÀNG
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
-- 21. CHI TIẾT ĐƠN HÀNG
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

-- 22. THANH TOÁN (cải tiến: cho phép nhiều lần thử thanh toán trên 1 đơn hàng)
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
    KEY idx_thanhtoan_donhang (don_hang_id, trang_thai),
    CONSTRAINT fk_thanhtoan_donhang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Lấy giao dịch hiệu lực: SELECT * FROM thanh_toan WHERE don_hang_id=? AND trang_thai='PAID' LIMIT 1

-- 23. ĐÁNH GIÁ
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
    KEY idx_danhgia_laptop (laptop_id, trang_thai),
    CONSTRAINT fk_danhgia_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE,
    CONSTRAINT fk_danhgia_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE,
    CONSTRAINT fk_danhgia_donhang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 24. SẢN PHẨM YÊU THÍCH
CREATE TABLE san_pham_yeu_thich (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id BIGINT UNSIGNED NOT NULL,
    laptop_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_yeuthich_khach_laptop (khach_hang_id, laptop_id),
    CONSTRAINT fk_yeuthich_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE,
    CONSTRAINT fk_yeuthich_laptop FOREIGN KEY (laptop_id) REFERENCES laptop(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 25. THÔNG BÁO
CREATE TABLE thong_bao (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tai_khoan_id BIGINT UNSIGNED NOT NULL,
    loai_thong_bao ENUM('ORDER_CREATED','ORDER_CONFIRMED','ORDER_SHIPPING','ORDER_DELIVERED','ORDER_CANCELLED','PROMOTION','SYSTEM') NOT NULL,
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT NOT NULL,
    du_lieu JSON NULL,
    da_doc BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_thongbao_taikhoan (tai_khoan_id, da_doc),
    CONSTRAINT fk_thongbao_taikhoan FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DỮ LIỆU MẪU CƠ BẢN
-- ============================================================

INSERT INTO tai_khoan (id, vai_tro, ten_dang_nhap, mat_khau_hash, email, so_dien_thoai, trang_thai) VALUES
(1, 'ADMIN', 'admin', '$2b$10$kCfdYbVf7JT7RBEQzMtYzunJ0dhEv2Ji12j1PY9RRHdB7awkCiNei', 'admin@laptopstore.vn', '0900000001', 'ACTIVE'),
(3, 'CUSTOMER', 'nguyenvana', '$2b$10$demoHashUser01', 'nguyenvana@gmail.com', '0900000003', 'ACTIVE');

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
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1080", "can_nang_kg": 1.7, "cong_ket_noi": ["USB-C", "HDMI", "RJ45"]}'),
(3, 'L002', 1, 2, 'ASUS Vivobook 15 X1504VA', 'asus-vivobook-15-x1504va',
    12500000, 14990000, 'Intel Core i5-1335U', 16, 512, 'Intel Iris Xe', 15.6, 60,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1080", "can_nang_kg": 1.7, "mau_sac": "Bac", "cong_ket_noi": ["USB-C", "HDMI", "USB-A"]}'),
(4, 'L004', 1, 1, 'ASUS ROG Strix G16 G614JV', 'asus-rog-strix-g16-g614jv',
    31500000, 36990000, 'Intel Core i7-13650HX', 16, 512, 'RTX 4060 8GB', 16.0, 165,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1200", "can_nang_kg": 2.5, "mau_sac": "Xam", "cong_ket_noi": ["USB-C", "HDMI 2.1", "RJ45"]}'),
(5, 'L005', 2, 2, 'Dell Vostro 3530', 'dell-vostro-3530',
    14500000, 17490000, 'Intel Core i5-1335U', 16, 512, 'Intel Iris Xe', 15.6, 120,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1080", "can_nang_kg": 1.66, "mau_sac": "Den", "cong_ket_noi": ["USB-C", "HDMI", "RJ45"]}'),
(6, 'L006', 2, 1, 'Dell Gaming G15 5530', 'dell-gaming-g15-5530',
    26500000, 30990000, 'Intel Core i7-13650HX', 16, 512, 'RTX 4050 6GB', 15.6, 165,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1080", "can_nang_kg": 2.65, "mau_sac": "Xam", "cong_ket_noi": ["USB-C", "HDMI 2.1", "RJ45"]}'),
(7, 'L007', 1, 2, 'ASUS Zenbook 14 OLED UX3405MA', 'asus-zenbook-14-oled-ux3405ma',
    24500000, 28990000, 'Intel Core Ultra 7 155H', 16, 1024, 'Intel Arc Graphics', 14.0, 120,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "2880x1800", "can_nang_kg": 1.2, "mau_sac": "Xanh", "cong_ket_noi": ["Thunderbolt 4", "HDMI 2.1", "USB-A"]}'),
(8, 'L008', 2, 2, 'Dell Latitude 5440', 'dell-latitude-5440',
    22000000, 25990000, 'Intel Core i7-1355U', 16, 512, 'Intel Iris Xe', 14.0, 60,
    '{"he_dieu_hanh": "Windows 11 Pro", "do_phan_giai": "1920x1080", "can_nang_kg": 1.39, "mau_sac": "Xam", "cong_ket_noi": ["Thunderbolt 4", "HDMI", "RJ45"]}'),
(9, 'L009', 1, 1, 'ASUS TUF Gaming A15 FA507NV', 'asus-tuf-gaming-a15-fa507nv',
    23500000, 27990000, 'AMD Ryzen 7 7735HS', 16, 512, 'RTX 4060 8GB', 15.6, 144,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "1920x1080", "can_nang_kg": 2.2, "mau_sac": "Den", "cong_ket_noi": ["USB-C", "HDMI 2.1", "RJ45"]}'),
(10, 'L010', 2, 1, 'Dell Alienware m16 R2', 'dell-alienware-m16-r2',
    44500000, 51990000, 'Intel Core Ultra 7 155H', 32, 1024, 'RTX 4070 8GB', 16.0, 240,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "2560x1600", "can_nang_kg": 2.61, "mau_sac": "Den", "cong_ket_noi": ["Thunderbolt 4", "HDMI 2.1", "RJ45"]}'),
(11, 'L011', 1, 2, 'ASUS ExpertBook B1 B1402CVA', 'asus-expertbook-b1-b1402cva',
    13500000, 15990000, 'Intel Core i5-1335U', 16, 512, 'Intel Iris Xe', 14.0, 60,
    '{"he_dieu_hanh": "Windows 11 Pro", "do_phan_giai": "1920x1080", "can_nang_kg": 1.49, "mau_sac": "Den", "cong_ket_noi": ["USB-C", "HDMI", "RJ45"]}'),
(12, 'L012', 2, 2, 'Dell XPS 13 9340', 'dell-xps-13-9340',
    36500000, 42990000, 'Intel Core Ultra 7 155H', 32, 1024, 'Intel Arc Graphics', 13.4, 120,
    '{"he_dieu_hanh": "Windows 11", "do_phan_giai": "2560x1600", "can_nang_kg": 1.19, "mau_sac": "Bac", "cong_ket_noi": ["Thunderbolt 4"]}');

-- Giỏ hàng
INSERT INTO chi_tiet_gio_hang (khach_hang_id, laptop_id, so_luong) VALUES (1, 2, 1);

-- Khuyến mãi (scope PRODUCT)
INSERT INTO khuyen_mai (id, ma_khuyen_mai, ten_khuyen_mai, pham_vi_ap_dung, loai_giam, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc) VALUES
(1, 'GIAM10', 'Giảm 10%', 'PRODUCT', 'PERCENT', 10, '2026-01-01', '2026-12-31');
INSERT INTO chi_tiet_khuyen_mai (khuyen_mai_id, laptop_id) VALUES (1, 1);

SET FOREIGN_KEY_CHECKS = 1;


-- Laptop variants: convert legacy seed data to one default SKU per laptop.
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

CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(100) PRIMARY KEY, step INT NOT NULL DEFAULT 0, completed BOOLEAN NOT NULL DEFAULT FALSE);
INSERT INTO schema_migrations(name,step,completed) VALUES('001-laptop-variants',14,TRUE);

-- DỮ LIỆU MẪU BỔ SUNG: mỗi bảng nghiệp vụ thêm 10 dòng; tài khoản thêm 20 dòng.

-- ID 101-110 liên kết các bảng; tài khoản nhân viên dùng ID 111-120.

-- Tai khoan mau: mat khau 12345 duoc bam bcrypt; trang thai ACTIVE.

START TRANSACTION;

INSERT INTO tai_khoan (id, vai_tro, ten_dang_nhap, mat_khau_hash, email, so_dien_thoai, trang_thai) VALUES
(101, 'CUSTOMER', 'seed26_kh_1', '$2b$10$IFYo1TuI/0leOZwBsCEKne3qEssIuM/5Wf8fQyan/aQ5XraZr9Awu', 'seed26_kh_1@example.test', '0987000001', 'ACTIVE'),
(102, 'CUSTOMER', 'seed26_kh_2', '$2b$10$QIH2v7hfEzVbWySTGFrwVe7a6oeaOulRcc89sFXcMIggRbsLpEeSy', 'seed26_kh_2@example.test', '0987000002', 'ACTIVE'),
(103, 'CUSTOMER', 'seed26_kh_3', '$2b$10$eVXGIaDD4ygZu45pO9N4OOWvrYeF7dMAOP66mwKOdyDRT2l9sWbIS', 'seed26_kh_3@example.test', '0987000003', 'ACTIVE'),
(104, 'CUSTOMER', 'seed26_kh_4', '$2b$10$cXCuO.vbqCzyDjACq3dU9eGmKQ44wODjWNrC75RXM7zzvA2IIcC6W', 'seed26_kh_4@example.test', '0987000004', 'ACTIVE'),
(105, 'CUSTOMER', 'seed26_kh_5', '$2b$10$3.DRrZ6KvCH0e3DU.Y50OeN//0HZz3O6osmflmS5YXwMIHarNakZq', 'seed26_kh_5@example.test', '0987000005', 'ACTIVE'),
(106, 'CUSTOMER', 'seed26_kh_6', '$2b$10$HWo2VOzNpLbw.GQdmNfa4.UjTJyKmjPKGi.9JcAspAL2rCQGDyVDy', 'seed26_kh_6@example.test', '0987000006', 'ACTIVE'),
(107, 'CUSTOMER', 'seed26_kh_7', '$2b$10$JsB3ZHCfzddeaeIylXBiueWOMDTacYDXVcegDxEE8mfINNh3pd6OS', 'seed26_kh_7@example.test', '0987000007', 'ACTIVE'),
(108, 'CUSTOMER', 'seed26_kh_8', '$2b$10$ZLVIwPge1kXEfwZ6O3PYLugN6pLVxluOl1uVg2jxseLmEwbYExzO6', 'seed26_kh_8@example.test', '0987000008', 'ACTIVE'),
(109, 'CUSTOMER', 'seed26_kh_9', '$2b$10$ol8olXHpvC49CvXFRSlaO.Fk6w6I5MS/2o5gf.763HZRXpQEf1FTy', 'seed26_kh_9@example.test', '0987000009', 'ACTIVE'),
(110, 'CUSTOMER', 'seed26_kh_10', '$2b$10$sqUUhdsDy.m6rqC5TxAY9eQlvqlgQW8H2cB9VzRprEMtDptztdL5a', 'seed26_kh_10@example.test', '0987000010', 'ACTIVE'),
(111, 'STAFF', 'seed26_nv_1', '$2b$10$3tLfG2lqyn2WtFHNkd2OE.2/fAWYCeKyJMYX2DkUK..1dv.fZnvhW', 'seed26_nv_1@example.test', '0988000001', 'ACTIVE'),
(112, 'STAFF', 'seed26_nv_2', '$2b$10$4xPaoQiqmYeyGa/LLduGZut62KT9lheAVsOmlZ.DbWfY8FVmRrbGe', 'seed26_nv_2@example.test', '0988000002', 'ACTIVE'),
(113, 'STAFF', 'seed26_nv_3', '$2b$10$kO2CnlJTOvvTdxmyUxJds.5HMUN/rzHyA0fewnX9mGtJZHvLtTVw2', 'seed26_nv_3@example.test', '0988000003', 'ACTIVE'),
(114, 'STAFF', 'seed26_nv_4', '$2b$10$4l6WRTmRfieHB9VQjoj01eU83Xed.TBofNi0TOw8LrIHnQXUOmhQO', 'seed26_nv_4@example.test', '0988000004', 'ACTIVE'),
(115, 'STAFF', 'seed26_nv_5', '$2b$10$Zyb6a3kHVlKRITwM/gIGN.SeOviRTOCSRqVpZn8BKYv8iV5K4Idga', 'seed26_nv_5@example.test', '0988000005', 'ACTIVE'),
(116, 'STAFF', 'seed26_nv_6', '$2b$10$yZeOTzTtoqFBgeGauFGzduenNl.Wcpmc.VcjEWj44aS8OvtKTUYfy', 'seed26_nv_6@example.test', '0988000006', 'ACTIVE'),
(117, 'STAFF', 'seed26_nv_7', '$2b$10$SOWFtJoVLWiRrBuEr3w1cO/QcOk/53VsZrLG2aVFB2WvwaykAxxSq', 'seed26_nv_7@example.test', '0988000007', 'ACTIVE'),
(118, 'STAFF', 'seed26_nv_8', '$2b$10$DTpU9NTD1UvfXaeTsXpLAOp4LmA4Kqy8y8.YK6TqLY0Um9MxF4gEm', 'seed26_nv_8@example.test', '0988000008', 'ACTIVE'),
(119, 'STAFF', 'seed26_nv_9', '$2b$10$4JJECerNgYDgGr35NYOzYe9eyCyNcOHhpXmWwv/fFNja2UYOh6e.O', 'seed26_nv_9@example.test', '0988000009', 'ACTIVE'),
(120, 'STAFF', 'seed26_nv_10', '$2b$10$uDols/O7pCk5yZPci7EnMO2BB4CbVVrxI8K4TRI9tiZZ5NESgWl9i', 'seed26_nv_10@example.test', '0988000010', 'ACTIVE');

INSERT INTO khach_hang (id, tai_khoan_id, ho_ten, ngay_sinh, gioi_tinh, diem_tich_luy) VALUES
(101, 101, 'Khách hàng mẫu 1', '1996-01-01', 'MALE', 10),
(102, 102, 'Khách hàng mẫu 2', '1997-01-01', 'FEMALE', 20),
(103, 103, 'Khách hàng mẫu 3', '1998-01-01', 'MALE', 30),
(104, 104, 'Khách hàng mẫu 4', '1999-01-01', 'FEMALE', 40),
(105, 105, 'Khách hàng mẫu 5', '2000-01-01', 'MALE', 50),
(106, 106, 'Khách hàng mẫu 6', '2001-01-01', 'FEMALE', 60),
(107, 107, 'Khách hàng mẫu 7', '2002-01-01', 'MALE', 70),
(108, 108, 'Khách hàng mẫu 8', '2003-01-01', 'FEMALE', 80),
(109, 109, 'Khách hàng mẫu 9', '2004-01-01', 'MALE', 90),
(110, 110, 'Khách hàng mẫu 10', '2005-01-01', 'FEMALE', 100);

INSERT INTO nhan_vien (id, tai_khoan_id, ma_nhan_vien, ho_ten, chuc_vu, luong, ngay_vao_lam) VALUES
(101, 111, 'SEED26-NV-01', 'Nhân viên mẫu 1', 'Nhân viên bán hàng', 9250000, '2024-02-01'),
(102, 112, 'SEED26-NV-02', 'Nhân viên mẫu 2', 'Nhân viên bán hàng', 9500000, '2024-03-01'),
(103, 113, 'SEED26-NV-03', 'Nhân viên mẫu 3', 'Nhân viên bán hàng', 9750000, '2024-04-01'),
(104, 114, 'SEED26-NV-04', 'Nhân viên mẫu 4', 'Nhân viên bán hàng', 10000000, '2024-05-01'),
(105, 115, 'SEED26-NV-05', 'Nhân viên mẫu 5', 'Nhân viên bán hàng', 10250000, '2024-06-01'),
(106, 116, 'SEED26-NV-06', 'Nhân viên mẫu 6', 'Nhân viên bán hàng', 10500000, '2024-07-01'),
(107, 117, 'SEED26-NV-07', 'Nhân viên mẫu 7', 'Nhân viên bán hàng', 10750000, '2024-08-01'),
(108, 118, 'SEED26-NV-08', 'Nhân viên mẫu 8', 'Nhân viên bán hàng', 11000000, '2024-09-01'),
(109, 119, 'SEED26-NV-09', 'Nhân viên mẫu 9', 'Nhân viên bán hàng', 11250000, '2024-10-01'),
(110, 120, 'SEED26-NV-10', 'Nhân viên mẫu 10', 'Nhân viên bán hàng', 11500000, '2024-11-01');

INSERT INTO refresh_token (id, tai_khoan_id, token_hash, device_id, device_name, expires_at, is_revoked, revoked_at) VALUES
(101, 101, 'seed26-expired-token-1', 'seed26-device-1', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(102, 102, 'seed26-expired-token-2', 'seed26-device-2', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(103, 103, 'seed26-expired-token-3', 'seed26-device-3', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(104, 104, 'seed26-expired-token-4', 'seed26-device-4', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(105, 105, 'seed26-expired-token-5', 'seed26-device-5', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(106, 106, 'seed26-expired-token-6', 'seed26-device-6', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(107, 107, 'seed26-expired-token-7', 'seed26-device-7', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(108, 108, 'seed26-expired-token-8', 'seed26-device-8', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(109, 109, 'seed26-expired-token-9', 'seed26-device-9', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW()),
(110, 110, 'seed26-expired-token-10', 'seed26-device-10', 'Thiết bị thử nghiệm', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, NOW());

INSERT INTO thiet_bi (id, tai_khoan_id, expo_push_token, device_id, platform, app_version, trang_thai) VALUES
(101, 101, 'ExponentPushToken[seed26-01]', 'seed26-device-1', 'ANDROID', '1.0.0', 0),
(102, 102, 'ExponentPushToken[seed26-02]', 'seed26-device-2', 'IOS', '1.0.0', 0),
(103, 103, 'ExponentPushToken[seed26-03]', 'seed26-device-3', 'ANDROID', '1.0.0', 0),
(104, 104, 'ExponentPushToken[seed26-04]', 'seed26-device-4', 'IOS', '1.0.0', 0),
(105, 105, 'ExponentPushToken[seed26-05]', 'seed26-device-5', 'ANDROID', '1.0.0', 0),
(106, 106, 'ExponentPushToken[seed26-06]', 'seed26-device-6', 'IOS', '1.0.0', 0),
(107, 107, 'ExponentPushToken[seed26-07]', 'seed26-device-7', 'ANDROID', '1.0.0', 0),
(108, 108, 'ExponentPushToken[seed26-08]', 'seed26-device-8', 'IOS', '1.0.0', 0),
(109, 109, 'ExponentPushToken[seed26-09]', 'seed26-device-9', 'ANDROID', '1.0.0', 0),
(110, 110, 'ExponentPushToken[seed26-10]', 'seed26-device-10', 'IOS', '1.0.0', 0);

INSERT INTO otp_xac_thuc (id, so_dien_thoai, ma_otp, muc_dich, so_lan_thu, da_su_dung, expires_at) VALUES
(101, '0987000001', 'used000001', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(102, '0987000002', 'used000002', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(103, '0987000003', 'used000003', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(104, '0987000004', 'used000004', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(105, '0987000005', 'used000005', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(106, '0987000006', 'used000006', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(107, '0987000007', 'used000007', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(108, '0987000008', 'used000008', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(109, '0987000009', 'used000009', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(110, '0987000010', 'used000010', 'VERIFY_PHONE', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO hang_laptop (id, ten_hang, mo_ta) VALUES
(101, 'Lenovo', 'Hãng Lenovo - dữ liệu mẫu'),
(102, 'HP', 'Hãng HP - dữ liệu mẫu'),
(103, 'Acer', 'Hãng Acer - dữ liệu mẫu'),
(104, 'MSI', 'Hãng MSI - dữ liệu mẫu'),
(105, 'Apple', 'Hãng Apple - dữ liệu mẫu'),
(106, 'Samsung', 'Hãng Samsung - dữ liệu mẫu'),
(107, 'LG', 'Hãng LG - dữ liệu mẫu'),
(108, 'Huawei', 'Hãng Huawei - dữ liệu mẫu'),
(109, 'Gigabyte', 'Hãng Gigabyte - dữ liệu mẫu'),
(110, 'Microsoft', 'Hãng Microsoft - dữ liệu mẫu');

INSERT INTO danh_muc (id, ten_danh_muc, thu_tu, mo_ta) VALUES
(101, 'Laptop học tập', 1, 'Danh mục mẫu 1'),
(102, 'Laptop doanh nghiệp', 2, 'Danh mục mẫu 2'),
(103, 'Laptop mỏng nhẹ', 3, 'Danh mục mẫu 3'),
(104, 'Laptop sáng tạo', 4, 'Danh mục mẫu 4'),
(105, 'Laptop cao cấp', 5, 'Danh mục mẫu 5'),
(106, 'Laptop cảm ứng', 6, 'Danh mục mẫu 6'),
(107, 'Laptop siêu nhẹ', 7, 'Danh mục mẫu 7'),
(108, 'Laptop văn phòng 14 inch', 8, 'Danh mục mẫu 8'),
(109, 'Laptop gaming phổ thông', 9, 'Danh mục mẫu 9'),
(110, 'Laptop thiết kế 2 trong 1', 10, 'Danh mục mẫu 10');

INSERT INTO laptop (id, ma_san_pham, hang_laptop_id, danh_muc_id, ten_san_pham, slug, gia_nhap, gia_ban, mo_ta, cpu, ram_gb, ssd_gb, thong_so_ky_thuat) VALUES
(101, 'SEED26-L01', 101, 101, 'Lenovo IdeaPad Slim 3 15IRH8', 'seed26-laptop-1', 12000000, 15990000, 'Lenovo IdeaPad Slim 3 15IRH8 - sản phẩm mẫu', 'Intel Core i5-13420H', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(102, 'SEED26-L02', 102, 102, 'HP ProBook 440 G10', 'seed26-laptop-2', 16000000, 19990000, 'HP ProBook 440 G10 - sản phẩm mẫu', 'Intel Core i5-1335U', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(103, 'SEED26-L03', 103, 103, 'Acer Swift Go 14', 'seed26-laptop-3', 18000000, 22990000, 'Acer Swift Go 14 - sản phẩm mẫu', 'Intel Core Ultra 5 125H', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(104, 'SEED26-L04', 104, 104, 'MSI Creator M16', 'seed26-laptop-4', 25500000, 30990000, 'MSI Creator M16 - sản phẩm mẫu', 'Intel Core i7-13620H', 16, 1024, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(105, 'SEED26-L05', 105, 105, 'MacBook Air 13 M3', 'seed26-laptop-5', 26000000, 31990000, 'MacBook Air 13 M3 - sản phẩm mẫu', 'Apple M3', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(106, 'SEED26-L06', 106, 106, 'Samsung Galaxy Book4 360', 'seed26-laptop-6', 20500000, 24990000, 'Samsung Galaxy Book4 360 - sản phẩm mẫu', 'Intel Core 5 120U', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(107, 'SEED26-L07', 107, 107, 'LG Gram 14 2024', 'seed26-laptop-7', 22500000, 27990000, 'LG Gram 14 2024 - sản phẩm mẫu', 'Intel Core Ultra 5 125H', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(108, 'SEED26-L08', 108, 108, 'Huawei MateBook D14', 'seed26-laptop-8', 13500000, 16990000, 'Huawei MateBook D14 - sản phẩm mẫu', 'Intel Core i5-12450H', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(109, 'SEED26-L09', 109, 109, 'Gigabyte G5 KF', 'seed26-laptop-9', 19500000, 23990000, 'Gigabyte G5 KF - sản phẩm mẫu', 'Intel Core i5-12500H', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}'),
(110, 'SEED26-L10', 110, 110, 'Surface Laptop Studio 2', 'seed26-laptop-10', 38500000, 45990000, 'Surface Laptop Studio 2 - sản phẩm mẫu', 'Intel Core i7-13700H', 16, 512, '{"mau_sac":"Bạc","he_dieu_hanh":"Windows 11"}');

INSERT INTO bien_the_laptop (id, laptop_id, ma_sku, mau_sac, ram_gb, ssd_gb, gia_nhap, gia_ban) VALUES
(101, 101, 'SEED26-L01-BAC', 'Bạc', 16, 512, 12000000, 15990000),
(102, 102, 'SEED26-L02-BAC', 'Bạc', 16, 512, 16000000, 19990000),
(103, 103, 'SEED26-L03-BAC', 'Bạc', 16, 512, 18000000, 22990000),
(104, 104, 'SEED26-L04-BAC', 'Bạc', 16, 1024, 25500000, 30990000),
(105, 105, 'SEED26-L05-BAC', 'Bạc', 16, 512, 26000000, 31990000),
(106, 106, 'SEED26-L06-BAC', 'Bạc', 16, 512, 20500000, 24990000),
(107, 107, 'SEED26-L07-BAC', 'Bạc', 16, 512, 22500000, 27990000),
(108, 108, 'SEED26-L08-BAC', 'Bạc', 16, 512, 13500000, 16990000),
(109, 109, 'SEED26-L09-BAC', 'Bạc', 16, 512, 19500000, 23990000),
(110, 110, 'SEED26-L10-BAC', 'Bạc', 16, 512, 38500000, 45990000);

INSERT INTO hinh_anh_laptop (id, laptop_id, image_url, la_anh_chinh, thu_tu) VALUES
(101, 101, 'https://placehold.co/800x600/png?text=SEED26-L01', 1, 1),
(102, 102, 'https://placehold.co/800x600/png?text=SEED26-L02', 1, 1),
(103, 103, 'https://placehold.co/800x600/png?text=SEED26-L03', 1, 1),
(104, 104, 'https://placehold.co/800x600/png?text=SEED26-L04', 1, 1),
(105, 105, 'https://placehold.co/800x600/png?text=SEED26-L05', 1, 1),
(106, 106, 'https://placehold.co/800x600/png?text=SEED26-L06', 1, 1),
(107, 107, 'https://placehold.co/800x600/png?text=SEED26-L07', 1, 1),
(108, 108, 'https://placehold.co/800x600/png?text=SEED26-L08', 1, 1),
(109, 109, 'https://placehold.co/800x600/png?text=SEED26-L09', 1, 1),
(110, 110, 'https://placehold.co/800x600/png?text=SEED26-L10', 1, 1);

INSERT INTO kho (id, ma_kho, ten_kho, dia_chi, so_dien_thoai) VALUES
(101, 'SEED26-K01', 'Kho mẫu 1', 'Số 1, đường Mẫu, Hà Nội', '02438880001'),
(102, 'SEED26-K02', 'Kho mẫu 2', 'Số 2, đường Mẫu, Hà Nội', '02438880002'),
(103, 'SEED26-K03', 'Kho mẫu 3', 'Số 3, đường Mẫu, Hà Nội', '02438880003'),
(104, 'SEED26-K04', 'Kho mẫu 4', 'Số 4, đường Mẫu, Hà Nội', '02438880004'),
(105, 'SEED26-K05', 'Kho mẫu 5', 'Số 5, đường Mẫu, Hà Nội', '02438880005'),
(106, 'SEED26-K06', 'Kho mẫu 6', 'Số 6, đường Mẫu, Hà Nội', '02438880006'),
(107, 'SEED26-K07', 'Kho mẫu 7', 'Số 7, đường Mẫu, Hà Nội', '02438880007'),
(108, 'SEED26-K08', 'Kho mẫu 8', 'Số 8, đường Mẫu, Hà Nội', '02438880008'),
(109, 'SEED26-K09', 'Kho mẫu 9', 'Số 9, đường Mẫu, Hà Nội', '02438880009'),
(110, 'SEED26-K10', 'Kho mẫu 10', 'Số 10, đường Mẫu, Hà Nội', '02438880010');

INSERT INTO nha_cung_cap (id, ma_ncc, ten_ncc, nguoi_lien_he, so_dien_thoai, email, dia_chi) VALUES
(101, 'SEED26-NCC01', 'Nhà phân phối Lenovo', 'Bộ phận kinh doanh', '02838880001', 'seed26_ncc_1@example.test', 'TP. Hồ Chí Minh'),
(102, 'SEED26-NCC02', 'Nhà phân phối HP', 'Bộ phận kinh doanh', '02838880002', 'seed26_ncc_2@example.test', 'TP. Hồ Chí Minh'),
(103, 'SEED26-NCC03', 'Nhà phân phối Acer', 'Bộ phận kinh doanh', '02838880003', 'seed26_ncc_3@example.test', 'TP. Hồ Chí Minh'),
(104, 'SEED26-NCC04', 'Nhà phân phối MSI', 'Bộ phận kinh doanh', '02838880004', 'seed26_ncc_4@example.test', 'TP. Hồ Chí Minh'),
(105, 'SEED26-NCC05', 'Nhà phân phối Apple', 'Bộ phận kinh doanh', '02838880005', 'seed26_ncc_5@example.test', 'TP. Hồ Chí Minh'),
(106, 'SEED26-NCC06', 'Nhà phân phối Samsung', 'Bộ phận kinh doanh', '02838880006', 'seed26_ncc_6@example.test', 'TP. Hồ Chí Minh'),
(107, 'SEED26-NCC07', 'Nhà phân phối LG', 'Bộ phận kinh doanh', '02838880007', 'seed26_ncc_7@example.test', 'TP. Hồ Chí Minh'),
(108, 'SEED26-NCC08', 'Nhà phân phối Huawei', 'Bộ phận kinh doanh', '02838880008', 'seed26_ncc_8@example.test', 'TP. Hồ Chí Minh'),
(109, 'SEED26-NCC09', 'Nhà phân phối Gigabyte', 'Bộ phận kinh doanh', '02838880009', 'seed26_ncc_9@example.test', 'TP. Hồ Chí Minh'),
(110, 'SEED26-NCC10', 'Nhà phân phối Microsoft', 'Bộ phận kinh doanh', '02838880010', 'seed26_ncc_10@example.test', 'TP. Hồ Chí Minh');

INSERT INTO ton_kho (id, kho_id, laptop_id, bien_the_id, so_luong, so_luong_da_dat, muc_ton_toi_thieu) VALUES
(101, 101, 101, 101, 19, 0, 5),
(102, 102, 102, 102, 19, 0, 5),
(103, 103, 103, 103, 19, 0, 5),
(104, 104, 104, 104, 19, 0, 5),
(105, 105, 105, 105, 19, 0, 5),
(106, 106, 106, 106, 19, 0, 5),
(107, 107, 107, 107, 19, 0, 5),
(108, 108, 108, 108, 19, 0, 5),
(109, 109, 109, 109, 19, 0, 5),
(110, 110, 110, 110, 19, 0, 5);

INSERT INTO phieu_nhap (id, ma_phieu, nha_cung_cap_id, kho_id, nhan_vien_id, tong_tien, ghi_chu, trang_thai, ngay_nhap) VALUES
(101, 'SEED26-PN01', 101, 101, 101, 240000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(102, 'SEED26-PN02', 102, 102, 102, 320000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(103, 'SEED26-PN03', 103, 103, 103, 360000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(104, 'SEED26-PN04', 104, 104, 104, 510000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(105, 'SEED26-PN05', 105, 105, 105, 520000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(106, 'SEED26-PN06', 106, 106, 106, 410000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(107, 'SEED26-PN07', 107, 107, 107, 450000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(108, 'SEED26-PN08', 108, 108, 108, 270000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(109, 'SEED26-PN09', 109, 109, 109, 390000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(110, 'SEED26-PN10', 110, 110, 110, 770000000, 'Nhập 20 máy mẫu', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY));

INSERT INTO chi_tiet_phieu_nhap (id, phieu_nhap_id, laptop_id, bien_the_id, so_luong, don_gia) VALUES
(101, 101, 101, 101, 20, 12000000),
(102, 102, 102, 102, 20, 16000000),
(103, 103, 103, 103, 20, 18000000),
(104, 104, 104, 104, 20, 25500000),
(105, 105, 105, 105, 20, 26000000),
(106, 106, 106, 106, 20, 20500000),
(107, 107, 107, 107, 20, 22500000),
(108, 108, 108, 108, 20, 13500000),
(109, 109, 109, 109, 20, 19500000),
(110, 110, 110, 110, 20, 38500000);

INSERT INTO dia_chi (id, khach_hang_id, nguoi_nhan, so_dien_thoai, tinh_thanh, quan_huyen, phuong_xa, dia_chi_chi_tiet, mac_dinh) VALUES
(101, 101, 'Khách hàng mẫu 1', '0987000001', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 1 đường Thành Công', 1),
(102, 102, 'Khách hàng mẫu 2', '0987000002', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 2 đường Thành Công', 1),
(103, 103, 'Khách hàng mẫu 3', '0987000003', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 3 đường Thành Công', 1),
(104, 104, 'Khách hàng mẫu 4', '0987000004', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 4 đường Thành Công', 1),
(105, 105, 'Khách hàng mẫu 5', '0987000005', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 5 đường Thành Công', 1),
(106, 106, 'Khách hàng mẫu 6', '0987000006', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 6 đường Thành Công', 1),
(107, 107, 'Khách hàng mẫu 7', '0987000007', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 7 đường Thành Công', 1),
(108, 108, 'Khách hàng mẫu 8', '0987000008', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 8 đường Thành Công', 1),
(109, 109, 'Khách hàng mẫu 9', '0987000009', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 9 đường Thành Công', 1),
(110, 110, 'Khách hàng mẫu 10', '0987000010', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 10 đường Thành Công', 1);

INSERT INTO chi_tiet_gio_hang (id, khach_hang_id, laptop_id, bien_the_id, so_luong) VALUES
(101, 101, 102, 102, 1),
(102, 102, 103, 103, 1),
(103, 103, 104, 104, 1),
(104, 104, 105, 105, 1),
(105, 105, 106, 106, 1),
(106, 106, 107, 107, 1),
(107, 107, 108, 108, 1),
(108, 108, 109, 109, 1),
(109, 109, 110, 110, 1),
(110, 110, 101, 101, 1);

INSERT INTO khuyen_mai (id, ma_khuyen_mai, ten_khuyen_mai, pham_vi_ap_dung, loai_giam, gia_tri_giam, don_hang_toi_thieu, giam_toi_da, so_luong, ngay_bat_dau, ngay_ket_thuc, mo_ta) VALUES
(101, 'SEED26-KM01', 'Giảm giá mẫu 1', 'PRODUCT', 'PERCENT', 6, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(102, 'SEED26-KM02', 'Giảm giá mẫu 2', 'PRODUCT', 'PERCENT', 7, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(103, 'SEED26-KM03', 'Giảm giá mẫu 3', 'PRODUCT', 'PERCENT', 8, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(104, 'SEED26-KM04', 'Giảm giá mẫu 4', 'PRODUCT', 'PERCENT', 9, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(105, 'SEED26-KM05', 'Giảm giá mẫu 5', 'PRODUCT', 'PERCENT', 10, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(106, 'SEED26-KM06', 'Giảm giá mẫu 6', 'PRODUCT', 'PERCENT', 11, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(107, 'SEED26-KM07', 'Giảm giá mẫu 7', 'PRODUCT', 'PERCENT', 12, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(108, 'SEED26-KM08', 'Giảm giá mẫu 8', 'PRODUCT', 'PERCENT', 13, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(109, 'SEED26-KM09', 'Giảm giá mẫu 9', 'PRODUCT', 'PERCENT', 14, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu'),
(110, 'SEED26-KM10', 'Giảm giá mẫu 10', 'PRODUCT', 'PERCENT', 15, 10000000, 3000000, 100, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'Ưu đãi cho một sản phẩm mẫu');

INSERT INTO chi_tiet_khuyen_mai (id, khuyen_mai_id, laptop_id) VALUES
(101, 101, 101),
(102, 102, 102),
(103, 103, 103),
(104, 104, 104),
(105, 105, 105),
(106, 106, 106),
(107, 107, 107),
(108, 108, 108),
(109, 109, 109),
(110, 110, 110);

-- Mỗi đơn bán 1 máy: nhập 20, đã bán 1, còn tồn 19.

INSERT INTO don_hang (id, ma_don_hang, khach_hang_id, dia_chi_id, nhan_vien_id, phuong_thuc_nhan, tong_tien_hang, phi_van_chuyen, tien_giam, tong_thanh_toan, trang_thai, ngay_dat, ngay_xac_nhan, ngay_giao, ngay_hoan_thanh) VALUES
(101, 'SEED26-DH01', 101, 101, 101, 'DELIVERY', 15990000, 0, 0, 15990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(102, 'SEED26-DH02', 102, 102, 102, 'DELIVERY', 19990000, 0, 0, 19990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(103, 'SEED26-DH03', 103, 103, 103, 'DELIVERY', 22990000, 0, 0, 22990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(104, 'SEED26-DH04', 104, 104, 104, 'DELIVERY', 30990000, 0, 0, 30990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(105, 'SEED26-DH05', 105, 105, 105, 'DELIVERY', 31990000, 0, 0, 31990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(106, 'SEED26-DH06', 106, 106, 106, 'DELIVERY', 24990000, 0, 0, 24990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(107, 'SEED26-DH07', 107, 107, 107, 'DELIVERY', 27990000, 0, 0, 27990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(108, 'SEED26-DH08', 108, 108, 108, 'DELIVERY', 16990000, 0, 0, 16990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(109, 'SEED26-DH09', 109, 109, 109, 'DELIVERY', 23990000, 0, 0, 23990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(110, 'SEED26-DH10', 110, 110, 110, 'DELIVERY', 45990000, 0, 0, 45990000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT INTO chi_tiet_don_hang (id, don_hang_id, laptop_id, bien_the_id, ten_san_pham, don_gia, so_luong, cau_hinh) VALUES
(101, 101, 101, 101, 'Lenovo IdeaPad Slim 3 15IRH8', 15990000, 1, '{"maSku":"SEED26-L01-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(102, 102, 102, 102, 'HP ProBook 440 G10', 19990000, 1, '{"maSku":"SEED26-L02-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(103, 103, 103, 103, 'Acer Swift Go 14', 22990000, 1, '{"maSku":"SEED26-L03-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(104, 104, 104, 104, 'MSI Creator M16', 30990000, 1, '{"maSku":"SEED26-L04-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":1024}'),
(105, 105, 105, 105, 'MacBook Air 13 M3', 31990000, 1, '{"maSku":"SEED26-L05-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(106, 106, 106, 106, 'Samsung Galaxy Book4 360', 24990000, 1, '{"maSku":"SEED26-L06-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(107, 107, 107, 107, 'LG Gram 14 2024', 27990000, 1, '{"maSku":"SEED26-L07-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(108, 108, 108, 108, 'Huawei MateBook D14', 16990000, 1, '{"maSku":"SEED26-L08-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(109, 109, 109, 109, 'Gigabyte G5 KF', 23990000, 1, '{"maSku":"SEED26-L09-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}'),
(110, 110, 110, 110, 'Surface Laptop Studio 2', 45990000, 1, '{"maSku":"SEED26-L10-BAC","mauSac":"Bạc","ramGb":16,"ssdGb":512}');

INSERT INTO thanh_toan (id, don_hang_id, lan_thu, phuong_thuc, trang_thai, ma_giao_dich, so_tien, thoi_gian_thanh_toan, noi_dung) VALUES
(101, 101, 1, 'COD', 'PAID', 'SEED26-TT01', 15990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(102, 102, 1, 'COD', 'PAID', 'SEED26-TT02', 19990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(103, 103, 1, 'COD', 'PAID', 'SEED26-TT03', 22990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(104, 104, 1, 'COD', 'PAID', 'SEED26-TT04', 30990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(105, 105, 1, 'COD', 'PAID', 'SEED26-TT05', 31990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(106, 106, 1, 'COD', 'PAID', 'SEED26-TT06', 24990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(107, 107, 1, 'COD', 'PAID', 'SEED26-TT07', 27990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(108, 108, 1, 'COD', 'PAID', 'SEED26-TT08', 16990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(109, 109, 1, 'COD', 'PAID', 'SEED26-TT09', 23990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng'),
(110, 110, 1, 'COD', 'PAID', 'SEED26-TT10', 45990000, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Thanh toán khi nhận hàng');

INSERT INTO danh_gia (id, khach_hang_id, laptop_id, don_hang_id, so_sao, noi_dung, trang_thai) VALUES
(101, 101, 101, 101, 5, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 1', 'APPROVED'),
(102, 102, 102, 102, 5, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 2', 'APPROVED'),
(103, 103, 103, 103, 4, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 3', 'APPROVED'),
(104, 104, 104, 104, 5, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 4', 'APPROVED'),
(105, 105, 105, 105, 5, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 5', 'APPROVED'),
(106, 106, 106, 106, 4, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 6', 'APPROVED'),
(107, 107, 107, 107, 5, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 7', 'APPROVED'),
(108, 108, 108, 108, 5, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 8', 'APPROVED'),
(109, 109, 109, 109, 4, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 9', 'APPROVED'),
(110, 110, 110, 110, 5, 'Sản phẩm hoạt động tốt, giao hàng đúng hẹn. Đánh giá mẫu 10', 'APPROVED');

INSERT INTO san_pham_yeu_thich (id, khach_hang_id, laptop_id) VALUES
(101, 101, 101),
(102, 102, 102),
(103, 103, 103),
(104, 104, 104),
(105, 105, 105),
(106, 106, 106),
(107, 107, 107),
(108, 108, 108),
(109, 109, 109),
(110, 110, 110);

INSERT INTO thong_bao (id, tai_khoan_id, loai_thong_bao, tieu_de, noi_dung, du_lieu, da_doc) VALUES
(101, 101, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH01 đã giao thành công.', '{"maDonHang":"SEED26-DH01"}', 1),
(102, 102, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH02 đã giao thành công.', '{"maDonHang":"SEED26-DH02"}', 0),
(103, 103, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH03 đã giao thành công.', '{"maDonHang":"SEED26-DH03"}', 1),
(104, 104, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH04 đã giao thành công.', '{"maDonHang":"SEED26-DH04"}', 0),
(105, 105, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH05 đã giao thành công.', '{"maDonHang":"SEED26-DH05"}', 1),
(106, 106, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH06 đã giao thành công.', '{"maDonHang":"SEED26-DH06"}', 0),
(107, 107, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH07 đã giao thành công.', '{"maDonHang":"SEED26-DH07"}', 1),
(108, 108, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH08 đã giao thành công.', '{"maDonHang":"SEED26-DH08"}', 0),
(109, 109, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH09 đã giao thành công.', '{"maDonHang":"SEED26-DH09"}', 1),
(110, 110, 'ORDER_DELIVERED', 'Đơn hàng đã giao', 'Đơn SEED26-DH10 đã giao thành công.', '{"maDonHang":"SEED26-DH10"}', 0);

COMMIT;
