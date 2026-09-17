const env = require('../config/env');
const repo = require('../repositories/xac-thuc.repository');
const LoiUngDung = require('../utils/loi-ung-dung');
const { xacMinhToken } = require('../utils/bao-mat');

const xacThuc = async (req, _res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) throw new LoiUngDung('Can cung cap Bearer token', 401);

  let payload;
  try {
    payload = xacMinhToken(token, env.jwt.accessSecret, 'access');
  } catch (_) {
    throw new LoiUngDung('Access token khong hop le hoac da het han', 401);
  }

  const taiKhoan = await repo.timTaiKhoanTheoId(payload.sub);
  if (!taiKhoan) throw new LoiUngDung('Tai khoan khong ton tai', 401);
  if (taiKhoan.trang_thai !== 'ACTIVE') throw new LoiUngDung('Tai khoan khong o trang thai hoat dong', 403);
  req.user = { id: taiKhoan.id, role: taiKhoan.ten_vai_tro };
  return next();
};

module.exports = { xacThuc };
