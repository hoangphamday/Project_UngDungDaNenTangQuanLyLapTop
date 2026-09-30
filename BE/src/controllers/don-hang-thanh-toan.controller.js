const api = require('../services/api.service');
const admin = require('../services/admin.service');
const { traDuLieu, traKetQua } = require('./controller-helper');

module.exports = {
  taoDonHang: traDuLieu((req) => api.orders.create(req.user.id, req.body), { statusCode: 201, message: 'Dat hang thanh cong' }),
  danhSachDonHang: traDuLieu((req) => api.orders.list(req.user.id, req.query)),
  chiTietDonHang: traDuLieu((req) => api.orders.get(req.user.id, req.params.id)),
  huyDonHang: traKetQua((req) => api.orders.cancel(req.user.id, req.params.id, req.body.lyDo), { message: 'Da huy don hang' }),
  danhSachThanhToan: traDuLieu((req) => admin.payments.customerList(req.user.id, req.params.orderId)),
  thanhToanLai: traDuLieu((req) => admin.payments.retry(req.user.id, req.params.orderId, req.body), { statusCode: 201, message: 'Da tao lan thanh toan' }),
};
