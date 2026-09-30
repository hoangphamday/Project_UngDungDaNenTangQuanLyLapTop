const api = require('../services/api.service');
const LoiUngDung = require('../utils/loi-ung-dung');
const { traDuLieu, traKetQua } = require('./controller-helper');

module.exports = {
  danhSach: traDuLieu((req) => api.reviews.list(req.params.id)),
  tao: traDuLieu((req) => {
    if (req.body.soSao < 1 || req.body.soSao > 5) throw new LoiUngDung('So sao tu 1 den 5', 422);
    return api.reviews.create(req.user.id, req.params.id, req.body);
  }, { statusCode: 201, message: 'Da tao danh gia' }),
  capNhat: traKetQua((req) => api.reviews.update(req.user.id, req.params.id, req.body), { message: 'Da cap nhat danh gia' }),
  xoa: traKetQua((req) => api.reviews.remove(req.user.id, req.params.id), { message: 'Da xoa danh gia' }),
};
