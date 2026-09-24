const api = require('../services/api.service');
const { traDuLieu, traKetQua } = require('./controller-helper');

module.exports = {
  taoThietBi: traDuLieu((req) => api.devices.create(req.user.id, req.body), { statusCode: 201, message: 'Da dang ky thiet bi' }),
  danhSachThietBi: traDuLieu((req) => api.devices.list(req.user.id)),
  xoaThietBi: traKetQua((req) => api.devices.remove(req.user.id, req.params.id), { message: 'Da xoa thiet bi' }),
  danhSachThongBao: traDuLieu((req) => api.notifications.list(req.user.id, req.query)),
  demChuaDoc: traDuLieu(async (req) => ({ count: await api.notifications.count(req.user.id) })),
  docThongBao: traKetQua((req) => api.notifications.read(req.user.id, req.params.id), { message: 'Da doc thong bao' }),
  docTatCa: traKetQua((req) => api.notifications.readAll(req.user.id), { message: 'Da doc tat ca' }),
};
