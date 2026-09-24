const { thanhCong } = require('../utils/phan-hoi');

const traDuLieu = (xuLy, { statusCode = 200, message = 'Thanh cong' } = {}) => async (req, res) =>
  thanhCong(res, { statusCode, message, data: await xuLy(req) });

const traKetQua = (xuLy, { statusCode = 200, message = 'Thanh cong' } = {}) => async (req, res) => {
  await xuLy(req);
  return thanhCong(res, { statusCode, message });
};

module.exports = { traDuLieu, traKetQua };
