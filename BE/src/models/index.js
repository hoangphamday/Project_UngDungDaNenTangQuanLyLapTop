const { Sequelize, DataTypes } = require('sequelize');
const env = require('../config/env');

const sequelize = new Sequelize(env.database.name, env.database.user, env.database.password, {
  host: env.database.host, port: env.database.port, dialect: 'mysql', logging: false,
  define: { timestamps: false, freezeTableName: true },
});
const id = { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true };
const fk = { type: DataTypes.BIGINT.UNSIGNED, allowNull: false };
const define = (name, tableName, attributes) => sequelize.define(name, { id, ...attributes }, { tableName });

const models = {
  taiKhoan: define('TaiKhoan','tai_khoan',{vai_tro:DataTypes.ENUM('ADMIN','STAFF','CUSTOMER'),ten_dang_nhap:DataTypes.STRING(100),mat_khau_hash:DataTypes.STRING,email:DataTypes.STRING(150),so_dien_thoai:DataTypes.STRING(20),trang_thai:DataTypes.ENUM('ACTIVE','LOCKED','INACTIVE')}),
  refreshToken: define('RefreshToken','refresh_token',{tai_khoan_id:fk,token_hash:DataTypes.STRING,device_id:DataTypes.STRING(150),device_name:DataTypes.STRING(150),expires_at:DataTypes.DATE,is_revoked:DataTypes.BOOLEAN}),
  thietBi: define('ThietBi','thiet_bi',{tai_khoan_id:fk,expo_push_token:DataTypes.STRING,device_id:DataTypes.STRING(150),platform:DataTypes.ENUM('IOS','ANDROID'),app_version:DataTypes.STRING(20),trang_thai:DataTypes.BOOLEAN}),
  otpXacThuc: define('OtpXacThuc','otp_xac_thuc',{so_dien_thoai:DataTypes.STRING(20),ma_otp:DataTypes.STRING(10),muc_dich:DataTypes.ENUM('REGISTER','LOGIN','RESET_PASSWORD','VERIFY_PHONE'),so_lan_thu:DataTypes.TINYINT.UNSIGNED,da_su_dung:DataTypes.BOOLEAN,expires_at:DataTypes.DATE}),
  khachHang: define('KhachHang','khach_hang',{tai_khoan_id:fk,ho_ten:DataTypes.STRING(150),ngay_sinh:DataTypes.DATEONLY,gioi_tinh:DataTypes.ENUM('MALE','FEMALE','OTHER'),avatar_url:DataTypes.STRING(500),diem_tich_luy:DataTypes.INTEGER.UNSIGNED}),
  nhanVien: define('NhanVien','nhan_vien',{tai_khoan_id:fk,ma_nhan_vien:DataTypes.STRING(30),ho_ten:DataTypes.STRING(150),chuc_vu:DataTypes.STRING(100),luong:DataTypes.DECIMAL(15,2),ngay_vao_lam:DataTypes.DATEONLY,trang_thai:DataTypes.ENUM('ACTIVE','INACTIVE')}),
  hangLaptop: define('HangLaptop','hang_laptop',{ten_hang:DataTypes.STRING(100),mo_ta:DataTypes.TEXT,logo_url:DataTypes.STRING(500),trang_thai:DataTypes.BOOLEAN}),
  danhMuc: define('DanhMuc','danh_muc',{ten_danh_muc:DataTypes.STRING(100),parent_id:DataTypes.BIGINT.UNSIGNED,thu_tu:DataTypes.INTEGER.UNSIGNED,mo_ta:DataTypes.TEXT,trang_thai:DataTypes.BOOLEAN}),
  laptop: define('Laptop','laptop',{ma_san_pham:DataTypes.STRING(50),hang_laptop_id:fk,danh_muc_id:fk,ten_san_pham:DataTypes.STRING(255),slug:DataTypes.STRING(300),gia_nhap:DataTypes.DECIMAL(15,2),gia_ban:DataTypes.DECIMAL(15,2),gia_khuyen_mai:DataTypes.DECIMAL(15,2),mo_ta:DataTypes.TEXT,anh_dai_dien:DataTypes.STRING(500),bao_hanh_thang:DataTypes.INTEGER.UNSIGNED,cpu:DataTypes.STRING(100),ram_gb:DataTypes.SMALLINT.UNSIGNED,ssd_gb:DataTypes.SMALLINT.UNSIGNED,gpu:DataTypes.STRING(100),man_hinh_inch:DataTypes.DECIMAL(3,1),tan_so_quet_hz:DataTypes.SMALLINT.UNSIGNED,thong_so_ky_thuat:DataTypes.JSON,trang_thai:DataTypes.ENUM('ACTIVE','INACTIVE','OUT_OF_STOCK')}),
  hinhAnhLaptop: define('HinhAnhLaptop','hinh_anh_laptop',{laptop_id:fk,image_url:DataTypes.STRING(500),la_anh_chinh:DataTypes.BOOLEAN,thu_tu:DataTypes.INTEGER.UNSIGNED}),
  kho: define('Kho','kho',{ma_kho:DataTypes.STRING(30),ten_kho:DataTypes.STRING(150),dia_chi:DataTypes.STRING(255),so_dien_thoai:DataTypes.STRING(20),trang_thai:DataTypes.BOOLEAN}),
  tonKho: define('TonKho','ton_kho',{kho_id:fk,laptop_id:fk,so_luong:DataTypes.INTEGER.UNSIGNED,so_luong_da_dat:DataTypes.INTEGER.UNSIGNED,muc_ton_toi_thieu:DataTypes.INTEGER.UNSIGNED}),
  nhaCungCap: define('NhaCungCap','nha_cung_cap',{ma_ncc:DataTypes.STRING(30),ten_ncc:DataTypes.STRING(200),nguoi_lien_he:DataTypes.STRING(150),so_dien_thoai:DataTypes.STRING(20),email:DataTypes.STRING(150),dia_chi:DataTypes.STRING(255),ghi_chu:DataTypes.TEXT,trang_thai:DataTypes.BOOLEAN}),
  phieuNhap: define('PhieuNhap','phieu_nhap',{ma_phieu:DataTypes.STRING(30),nha_cung_cap_id:fk,kho_id:fk,nhan_vien_id:fk,tong_tien:DataTypes.DECIMAL(15,2),ghi_chu:DataTypes.TEXT,trang_thai:DataTypes.ENUM('DRAFT','COMPLETED','CANCELLED'),ngay_nhap:DataTypes.DATE}),
  chiTietPhieuNhap: define('ChiTietPhieuNhap','chi_tiet_phieu_nhap',{phieu_nhap_id:fk,laptop_id:fk,so_luong:DataTypes.INTEGER.UNSIGNED,don_gia:DataTypes.DECIMAL(15,2)}),
  diaChi: define('DiaChi','dia_chi',{khach_hang_id:fk,nguoi_nhan:DataTypes.STRING(150),so_dien_thoai:DataTypes.STRING(20),tinh_thanh:DataTypes.STRING(100),quan_huyen:DataTypes.STRING(100),phuong_xa:DataTypes.STRING(100),dia_chi_chi_tiet:DataTypes.STRING(255),mac_dinh:DataTypes.BOOLEAN}),
  chiTietGioHang: define('ChiTietGioHang','chi_tiet_gio_hang',{khach_hang_id:fk,laptop_id:fk,so_luong:DataTypes.INTEGER.UNSIGNED}),
  khuyenMai: define('KhuyenMai','khuyen_mai',{ma_khuyen_mai:DataTypes.STRING(50),ten_khuyen_mai:DataTypes.STRING(200),pham_vi_ap_dung:DataTypes.ENUM('ALL','PRODUCT','CATEGORY','BRAND'),danh_muc_id:DataTypes.BIGINT.UNSIGNED,hang_laptop_id:DataTypes.BIGINT.UNSIGNED,loai_giam:DataTypes.ENUM('PERCENT','FIXED'),gia_tri_giam:DataTypes.DECIMAL(15,2),don_hang_toi_thieu:DataTypes.DECIMAL(15,2),giam_toi_da:DataTypes.DECIMAL(15,2),so_luong:DataTypes.INTEGER.UNSIGNED,so_luong_da_dung:DataTypes.INTEGER.UNSIGNED,ngay_bat_dau:DataTypes.DATE,ngay_ket_thuc:DataTypes.DATE,trang_thai:DataTypes.ENUM('ACTIVE','INACTIVE','EXPIRED'),mo_ta:DataTypes.TEXT}),
  chiTietKhuyenMai: define('ChiTietKhuyenMai','chi_tiet_khuyen_mai',{khuyen_mai_id:fk,laptop_id:fk}),
  donHang: define('DonHang','don_hang',{ma_don_hang:DataTypes.STRING(40),khach_hang_id:fk,dia_chi_id:DataTypes.BIGINT.UNSIGNED,khuyen_mai_id:DataTypes.BIGINT.UNSIGNED,nhan_vien_id:DataTypes.BIGINT.UNSIGNED,phuong_thuc_nhan:DataTypes.ENUM('DELIVERY','PICKUP'),tong_tien_hang:DataTypes.DECIMAL(15,2),phi_van_chuyen:DataTypes.DECIMAL(15,2),tien_giam:DataTypes.DECIMAL(15,2),tong_thanh_toan:DataTypes.DECIMAL(15,2),ghi_chu_khach_hang:DataTypes.TEXT,ghi_chu_nhan_vien:DataTypes.TEXT,trang_thai:DataTypes.ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPING','DELIVERED','CANCELLED','RETURNED'),ly_do_huy:DataTypes.STRING(500)}),
  chiTietDonHang: define('ChiTietDonHang','chi_tiet_don_hang',{don_hang_id:fk,laptop_id:fk,ten_san_pham:DataTypes.STRING(255),don_gia:DataTypes.DECIMAL(15,2),so_luong:DataTypes.INTEGER.UNSIGNED}),
  thanhToan: define('ThanhToan','thanh_toan',{don_hang_id:fk,lan_thu:DataTypes.TINYINT.UNSIGNED,phuong_thuc:DataTypes.ENUM('COD','BANK_TRANSFER','MOMO','VNPAY','ZALOPAY'),trang_thai:DataTypes.ENUM('PENDING','PAID','FAILED','REFUNDED'),ma_giao_dich:DataTypes.STRING(150),so_tien:DataTypes.DECIMAL(15,2),thoi_gian_thanh_toan:DataTypes.DATE,noi_dung:DataTypes.TEXT}),
  danhGia: define('DanhGia','danh_gia',{khach_hang_id:fk,laptop_id:fk,don_hang_id:DataTypes.BIGINT.UNSIGNED,so_sao:DataTypes.TINYINT.UNSIGNED,noi_dung:DataTypes.TEXT,anh_url:DataTypes.STRING(500),trang_thai:DataTypes.ENUM('PENDING','APPROVED','HIDDEN')}),
  sanPhamYeuThich: define('SanPhamYeuThich','san_pham_yeu_thich',{khach_hang_id:fk,laptop_id:fk}),
  thongBao: define('ThongBao','thong_bao',{tai_khoan_id:fk,loai_thong_bao:DataTypes.ENUM('ORDER_CREATED','ORDER_CONFIRMED','ORDER_SHIPPING','ORDER_DELIVERED','ORDER_CANCELLED','PROMOTION','SYSTEM'),tieu_de:DataTypes.STRING(255),noi_dung:DataTypes.TEXT,du_lieu:DataTypes.JSON,da_doc:DataTypes.BOOLEAN}),
};

models.taiKhoan.hasOne(models.khachHang,{foreignKey:'tai_khoan_id',as:'khachHang'});models.khachHang.belongsTo(models.taiKhoan,{foreignKey:'tai_khoan_id',as:'taiKhoan'});
models.taiKhoan.hasOne(models.nhanVien,{foreignKey:'tai_khoan_id',as:'nhanVien'});models.nhanVien.belongsTo(models.taiKhoan,{foreignKey:'tai_khoan_id',as:'taiKhoan'});
models.taiKhoan.hasMany(models.refreshToken,{foreignKey:'tai_khoan_id',as:'refreshTokens'});models.taiKhoan.hasMany(models.thietBi,{foreignKey:'tai_khoan_id',as:'thietBi'});models.taiKhoan.hasMany(models.thongBao,{foreignKey:'tai_khoan_id',as:'thongBao'});
models.hangLaptop.hasMany(models.laptop,{foreignKey:'hang_laptop_id',as:'laptops'});models.laptop.belongsTo(models.hangLaptop,{foreignKey:'hang_laptop_id',as:'hang'});
models.danhMuc.hasMany(models.laptop,{foreignKey:'danh_muc_id',as:'laptops'});models.laptop.belongsTo(models.danhMuc,{foreignKey:'danh_muc_id',as:'danhMuc'});models.danhMuc.hasMany(models.danhMuc,{foreignKey:'parent_id',as:'children'});
models.laptop.hasMany(models.hinhAnhLaptop,{foreignKey:'laptop_id',as:'hinhAnh'});models.laptop.hasMany(models.tonKho,{foreignKey:'laptop_id',as:'tonKho'});models.kho.hasMany(models.tonKho,{foreignKey:'kho_id',as:'tonKho'});
models.phieuNhap.hasMany(models.chiTietPhieuNhap,{foreignKey:'phieu_nhap_id',as:'chiTiet'});models.donHang.hasMany(models.chiTietDonHang,{foreignKey:'don_hang_id',as:'chiTiet'});models.donHang.hasMany(models.thanhToan,{foreignKey:'don_hang_id',as:'thanhToan'});
models.khachHang.hasMany(models.diaChi,{foreignKey:'khach_hang_id',as:'diaChi'});models.khachHang.hasMany(models.donHang,{foreignKey:'khach_hang_id',as:'donHang'});models.khachHang.hasMany(models.danhGia,{foreignKey:'khach_hang_id',as:'danhGia'});

models.sequelize = sequelize;
module.exports = models;
