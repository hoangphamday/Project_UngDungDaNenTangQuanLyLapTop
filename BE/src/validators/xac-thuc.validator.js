const { body, validationResult } = require('express-validator');

const kiemTraKetQua = (req, res, next) => {
  const ketQua = validationResult(req);
  if (!ketQua.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Du lieu dau vao khong hop le',
      errors: ketQua.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  return next();
};

const matKhau = (field) => body(field)
  .isString().withMessage('Mat khau phai la chuoi')
  .isLength({ min: 8, max: 72 }).withMessage('Mat khau phai tu 8 den 72 ky tu')
  .matches(/[a-z]/).withMessage('Mat khau can co chu thuong')
  .matches(/[A-Z]/).withMessage('Mat khau can co chu hoa')
  .matches(/\d/).withMessage('Mat khau can co chu so');

const dangKy = [
  body('tenDangNhap').trim().isLength({ min: 4, max: 100 }).matches(/^[A-Za-z0-9_.]+$/),
  matKhau('matKhau'),
  body('email').trim().isEmail().normalizeEmail(),
  body('soDienThoai').trim().matches(/^0\d{9}$/).withMessage('So dien thoai Viet Nam khong hop le'),
  body('hoTen').trim().isLength({ min: 2, max: 150 }),
  body('ngaySinh').optional({ nullable: true }).isISO8601({ strict: true }),
  body('gioiTinh').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  body('thietBi.deviceId').optional().trim().isLength({ max: 150 }),
  body('thietBi.deviceName').optional().trim().isLength({ max: 150 }),
  kiemTraKetQua,
];

const dangNhap = [
  body('dinhDanh').trim().notEmpty().isLength({ max: 150 }),
  body('matKhau').isString().notEmpty().isLength({ max: 72 }),
  body('thietBi.deviceId').optional().trim().isLength({ max: 150 }),
  body('thietBi.deviceName').optional().trim().isLength({ max: 150 }),
  kiemTraKetQua,
];

const refreshToken = [body('refreshToken').isString().notEmpty(), kiemTraKetQua];
const quenMatKhau = [body('soDienThoai').trim().matches(/^0\d{9}$/), kiemTraKetQua];
const xacMinhOtp = [
  body('soDienThoai').trim().matches(/^0\d{9}$/),
  body('maOtp').isString().matches(/^\d{6}$/),
  kiemTraKetQua,
];
const datLaiMatKhau = [body('resetToken').isString().notEmpty(), matKhau('matKhauMoi'), kiemTraKetQua];

module.exports = { dangKy, dangNhap, refreshToken, quenMatKhau, xacMinhOtp, datLaiMatKhau };
