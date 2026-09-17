const express = require('express');
const controller = require('../controllers/xac-thuc.controller');
const validator = require('../validators/xac-thuc.validator');
const { xacThuc } = require('../middlewares/xac-thuc.middleware');
const { gioiHanTanSuat } = require('../middlewares/gioi-han-tan-suat.middleware');

const router = express.Router();
const gioiHanDangNhap = gioiHanTanSuat({
  windowMs: 15 * 60_000, max: 10, message: 'Qua nhieu lan dang nhap, vui long thu lai sau',
});
const gioiHanOtp = gioiHanTanSuat({
  windowMs: 10 * 60_000, max: 5, message: 'Qua nhieu yeu cau OTP, vui long thu lai sau',
});

router.post('/register', validator.dangKy, controller.dangKy);
router.post('/login', gioiHanDangNhap, validator.dangNhap, controller.dangNhap);
router.post('/refresh-token', validator.refreshToken, controller.lamMoiToken);
router.post('/logout', validator.refreshToken, controller.dangXuat);
router.post('/logout-all', xacThuc, controller.dangXuatTatCa);
router.post('/forgot-password', gioiHanOtp, validator.quenMatKhau, controller.quenMatKhau);
router.post('/verify-otp', gioiHanOtp, validator.xacMinhOtp, controller.xacMinhOtp);
router.post('/reset-password', gioiHanOtp, validator.datLaiMatKhau, controller.datLaiMatKhau);
router.get('/me', xacThuc, controller.thongTinCuaToi);

module.exports = router;
