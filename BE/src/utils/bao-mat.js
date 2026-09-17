const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const bamToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Cot ma_otp chi VARCHAR(10), nen dung HMAC 10 ky tu thay vi luu OTP ro.
const bamOtp = (soDienThoai, maOtp, mucDich) =>
  crypto.createHmac('sha256', env.otp.secret)
    .update(`${soDienThoai}:${mucDich}:${maOtp}`)
    .digest('base64url').slice(0, 10);

const soSanhAnToan = (giaTriA, giaTriB) => {
  const a = Buffer.from(giaTriA);
  const b = Buffer.from(giaTriB);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const taoAccessToken = (taiKhoan) => jwt.sign(
  { sub: String(taiKhoan.id), role: taiKhoan.ten_vai_tro, type: 'access' },
  env.jwt.accessSecret,
  { expiresIn: env.jwt.accessExpiresIn, jwtid: crypto.randomUUID() },
);

const taoRefreshToken = (taiKhoan) => jwt.sign(
  { sub: String(taiKhoan.id), type: 'refresh' },
  env.jwt.refreshSecret,
  { expiresIn: env.jwt.refreshExpiresIn, jwtid: crypto.randomUUID() },
);

const taoResetToken = (taiKhoanId, otpId, soDienThoai) => jwt.sign(
  { sub: String(taiKhoanId), otpId: String(otpId), phone: soDienThoai, type: 'password_reset' },
  env.jwt.accessSecret,
  { expiresIn: '10m', jwtid: crypto.randomUUID() },
);

const xacMinhToken = (token, secret, type) => {
  const payload = jwt.verify(token, secret);
  if (payload.type !== type) throw new jwt.JsonWebTokenError('Sai loai token');
  return payload;
};

const ngayHetHanToken = (token) => new Date(jwt.decode(token).exp * 1000);

module.exports = { bamToken, bamOtp, soSanhAnToan, taoAccessToken, taoRefreshToken, taoResetToken, xacMinhToken, ngayHetHanToken };
