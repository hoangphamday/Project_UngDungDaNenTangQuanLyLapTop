const admin = require('../services/admin.service');
const { thanhCong } = require('../utils/phan-hoi');

const thanhToan = async (req, res) => {
  let body;
  try {
    body = JSON.parse(req.body.toString('utf8'));
  } catch (_) {
    return res.status(400).json({ success: false, message: 'JSON khong hop le', errors: [] });
  }
  const data = await admin.payments.webhook(req.params.provider, req.headers, body, req.body);
  return thanhCong(res, { message: 'Da xu ly webhook', data });
};

module.exports = { thanhToan };
