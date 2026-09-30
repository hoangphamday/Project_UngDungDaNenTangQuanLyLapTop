const api = require('../services/api.service');
const admin = require('../services/admin.service');
const LoiUngDung = require('../utils/loi-ung-dung');
const { traDuLieu, traKetQua } = require('./controller-helper');

const layUrlAnh = (req) => req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

module.exports = {
  taoHang: traDuLieu((req) => api.catalog.create('hang_laptop', req.body), { statusCode: 201 }),
  capNhatHang: traDuLieu((req) => api.catalog.update('hang_laptop', req.params.id, req.body)),
  doiTrangThaiHang: traKetQua((req) => api.catalog.status('hang_laptop', req.params.id, req.body.trangThai)),
  taoDanhMuc: traDuLieu((req) => api.catalog.create('danh_muc', req.body), { statusCode: 201 }),
  capNhatDanhMuc: traDuLieu((req) => api.catalog.update('danh_muc', req.params.id, req.body)),
  doiTrangThaiDanhMuc: traKetQua((req) => api.catalog.status('danh_muc', req.params.id, req.body.trangThai)),
  taoLaptop: traDuLieu((req) => admin.laptops.create(req.body), { statusCode: 201 }),
  capNhatLaptop: traDuLieu((req) => admin.laptops.update(req.params.id, req.body)),
  doiTrangThaiLaptop: traKetQua((req) => admin.laptops.status(req.params.id, req.body.trangThai)),
  themAnhLaptop: traDuLieu((req) => {
    const imageUrl = layUrlAnh(req);
    if (!imageUrl) throw new LoiUngDung('Can tep image hoac imageUrl', 422);
    return admin.laptops.addImage(req.params.id, { ...req.body, imageUrl });
  }, { statusCode: 201 }),
  xoaAnhLaptop: traKetQua((req) => admin.laptops.removeImage(req.params.id, req.params.imageId)),
  danhSachKhuyenMai: traDuLieu((req) => admin.promotions.list(req.query)),
  taoKhuyenMai: traDuLieu((req) => admin.promotions.create(req.body), { statusCode: 201 }),
  capNhatKhuyenMai: traDuLieu((req) => admin.promotions.update(req.params.id, req.body)),
  doiTrangThaiKhuyenMai: traKetQua((req) => admin.promotions.status(req.params.id, req.body.trangThai)),
};
