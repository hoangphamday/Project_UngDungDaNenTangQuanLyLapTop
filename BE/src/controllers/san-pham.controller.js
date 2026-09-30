const api = require('../services/api.service');
const { traDuLieu } = require('./controller-helper');

module.exports = {
  danhSachLaptop: traDuLieu((req) => api.products.list(req.query)),
  chiTietLaptop: traDuLieu((req) => api.products.get('id', req.params.id)),
  chiTietLaptopTheoSlug: traDuLieu((req) => api.products.get('slug', req.params.slug)),
  danhSachHang: traDuLieu(() => api.catalog.list('hang_laptop')),
  chiTietHang: traDuLieu((req) => api.catalog.get('hang_laptop', req.params.id)),
  danhSachDanhMuc: traDuLieu(() => api.catalog.list('danh_muc')),
  cayDanhMuc: traDuLieu(() => api.catalog.tree()),
  chiTietDanhMuc: traDuLieu((req) => api.catalog.get('danh_muc', req.params.id)),
};
