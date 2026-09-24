const { body, validationResult } = require('express-validator');

const ketQua = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Du lieu dau vao khong hop le',
      errors: result.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  return next();
};
const id = (field) => body(field).isInt({ min: 1 }).withMessage(`${field} phai la ID hop le`).toInt();
const text = (field, min = 1, max = 255) => body(field).trim().isLength({ min, max });
const optionalText = (field, max = 255) => body(field).optional({ nullable: true }).trim().isLength({ max });
const money = (field, required = true) => body(field)[required ? 'exists' : 'optional']({ nullable: !required }).isFloat({ min: 0 }).toFloat();
const enumField = (field, values, required = true) => body(field)[required ? 'exists' : 'optional']().isIn(values);

const device = [text('expoPushToken', 10, 255), enumField('platform', ['IOS', 'ANDROID']), optionalText('deviceId', 150), optionalText('appVersion', 20), ketQua];
const profile = [optionalText('hoTen', 150), body('email').optional().isEmail().normalizeEmail(), body('soDienThoai').optional().matches(/^0\d{9}$/), body('ngaySinh').optional({ nullable: true }).isISO8601({ strict: true }), enumField('gioiTinh', ['MALE', 'FEMALE', 'OTHER'], false), ketQua];
const addressFields = [text('nguoiNhan', 2, 150), body('soDienThoai').matches(/^0\d{9}$/), text('tinhThanh', 1, 100), text('quanHuyen', 1, 100), text('phuongXa', 1, 100), text('diaChiChiTiet', 1, 255), body('macDinh').optional().isBoolean().toBoolean(), ketQua];
const addressUpdate = [optionalText('nguoiNhan', 150), body('soDienThoai').optional().matches(/^0\d{9}$/), optionalText('tinhThanh', 100), optionalText('quanHuyen', 100), optionalText('phuongXa', 100), optionalText('diaChiChiTiet', 255), body('macDinh').optional().isBoolean().toBoolean(), ketQua];
const cartAdd = [id('laptopId'), body('soLuong').optional().isInt({ min: 1, max: 99 }).toInt(), ketQua];
const quantity = [body('soLuong').isInt({ min: 1, max: 99 }).toInt(), ketQua];
const promotionCode = [text('maKhuyenMai', 1, 50), ketQua];
const order = [body('diaChiId').optional({ nullable: true }).isInt({ min: 1 }).toInt(), enumField('phuongThucNhan', ['DELIVERY', 'PICKUP'], false), enumField('phuongThucThanhToan', ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'ZALOPAY'], false), optionalText('maKhuyenMai', 50), body('phiVanChuyen').optional().isFloat({ min: 0 }).toFloat(), optionalText('ghiChu', 1000), ketQua];
const paymentRetry = [enumField('phuongThuc', ['BANK_TRANSFER', 'MOMO', 'VNPAY', 'ZALOPAY']), ketQua];
const review = [body('soSao').isInt({ min: 1, max: 5 }).toInt(), optionalText('noiDung', 2000), body('anhUrl').optional({ nullable: true }).isURL(), ketQua];
const reviewUpdate = [body('soSao').optional().isInt({ min: 1, max: 5 }).toInt(), optionalText('noiDung', 2000), body('anhUrl').optional({ nullable: true }).isURL(), ketQua];
const brand = [text('tenHang', 1, 100), optionalText('moTa', 5000), body('logoUrl').optional({ nullable: true }).isURL(), ketQua];
const category = [text('tenDanhMuc', 1, 100), body('parentId').optional({ nullable: true }).isInt({ min: 1 }).toInt(), body('thuTu').optional().isInt({ min: 0 }).toInt(), optionalText('moTa', 5000), ketQua];
const laptop = [text('maSanPham', 1, 50), id('hangLaptopId'), id('danhMucId'), text('tenSanPham', 1, 255), money('giaBan'), money('giaNhap', false), money('giaKhuyenMai', false), body('baoHanhThang').optional().isInt({ min: 0 }).toInt(), body('ramGb').optional({ nullable: true }).isInt({ min: 1 }).toInt(), body('ssdGb').optional({ nullable: true }).isInt({ min: 1 }).toInt(), ketQua];
const promotion = [text('maKhuyenMai', 1, 50), text('tenKhuyenMai', 1, 200), enumField('phamViApDung', ['ALL', 'PRODUCT', 'CATEGORY', 'BRAND'], false), enumField('loaiGiam', ['PERCENT', 'FIXED']), money('giaTriGiam'), money('donHangToiThieu', false), money('giamToiDa', false), body('soLuong').optional().isInt({ min: 0 }).toInt(), body('ngayBatDau').isISO8601(), body('ngayKetThuc').isISO8601(), body('laptopIds').optional().isArray(), ketQua];
const warehouse = [text('maKho', 1, 30), text('tenKho', 1, 150), optionalText('diaChi', 255), body('soDienThoai').optional({ nullable: true }).matches(/^0\d{9}$/), ketQua];
const supplier = [text('maNcc', 1, 30), text('tenNcc', 1, 200), optionalText('nguoiLienHe', 150), body('soDienThoai').optional({ nullable: true }).matches(/^0\d{9}$/), body('email').optional({ nullable: true }).isEmail().normalizeEmail(), optionalText('diaChi', 255), ketQua];
const importReceipt = [id('nhaCungCapId'), id('khoId'), body('items').isArray({ min: 1 }), body('items.*.laptopId').isInt({ min: 1 }).toInt(), body('items.*.soLuong').isInt({ min: 1 }).toInt(), body('items.*.donGia').isFloat({ min: 0 }).toFloat(), ketQua];
const staff = [text('tenDangNhap', 4, 100), body('matKhau').isLength({ min: 8, max: 72 }).matches(/[a-z]/).matches(/[A-Z]/).matches(/\d/), body('email').isEmail().normalizeEmail(), text('maNhanVien', 1, 30), text('hoTen', 2, 150), body('soDienThoai').optional({ nullable: true }).matches(/^0\d{9}$/), money('luong', false), body('ngayVaoLam').optional({ nullable: true }).isISO8601({ strict: true }), ketQua];
const staffUpdate = [optionalText('hoTen', 150), optionalText('chucVu', 100), body('email').optional().isEmail().normalizeEmail(), body('soDienThoai').optional({ nullable: true }).matches(/^0\d{9}$/), money('luong', false), body('ngayVaoLam').optional({ nullable: true }).isISO8601({ strict: true }), ketQua];

const status = (values) => [enumField('trangThai', values), ketQua];
module.exports = {
  ketQua, device, profile, addressFields, addressUpdate, cartAdd, quantity, promotionCode,
  order, paymentRetry, review, reviewUpdate, brand, category, laptop, promotion, warehouse,
  supplier, importReceipt, staff, staffUpdate,
  booleanStatus: [body('trangThai').isBoolean().toBoolean(), ketQua],
  laptopStatus: status(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
  promotionStatus: status(['ACTIVE', 'INACTIVE', 'EXPIRED']),
  orderStatus: status(['CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  reviewStatus: status(['PENDING', 'APPROVED', 'HIDDEN']),
  accountStatus: status(['ACTIVE', 'LOCKED', 'INACTIVE']),
  staffStatus: status(['ACTIVE', 'INACTIVE']),
};
