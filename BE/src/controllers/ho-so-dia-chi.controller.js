const api = require('../services/api.service');
const LoiUngDung = require('../utils/loi-ung-dung');
const { traDuLieu, traKetQua } = require('./controller-helper');

const layUrlAnh = (req) => req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

module.exports = {
  layHoSo: traDuLieu((req) => api.profile.get(req.user.id)),
  capNhatHoSo: traDuLieu((req) => api.profile.update(req.user.id, req.body)),
  capNhatAvatar: traDuLieu((req) => {
    const url = layUrlAnh(req);
    if (!url) throw new LoiUngDung('Can cung cap avatar hoac imageUrl', 422);
    return api.profile.avatar(req.user.id, url);
  }, { message: 'Da cap nhat avatar' }),
  danhSachDiaChi: traDuLieu((req) => api.addresses.list(req.user.id)),
  taoDiaChi: traDuLieu((req) => api.addresses.create(req.user.id, req.body), { statusCode: 201, message: 'Da tao dia chi' }),
  capNhatDiaChi: traDuLieu((req) => api.addresses.update(req.user.id, req.params.id, req.body)),
  xoaDiaChi: traKetQua((req) => api.addresses.remove(req.user.id, req.params.id), { message: 'Da xoa dia chi' }),
  datDiaChiMacDinh: traKetQua((req) => api.addresses.makeDefault(req.user.id, req.params.id), { message: 'Da dat dia chi mac dinh' }),
};
