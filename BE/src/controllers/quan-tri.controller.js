const api = require('../services/api.service');
const admin = require('../services/admin.service');
const { traDuLieu, traKetQua } = require('./controller-helper');

module.exports = {
  danhSachDonHang: traDuLieu((req) => admin.adminOrders.list(req.query)),
  chiTietDonHang: traDuLieu((req) => api.orders.get(req.user.id, req.params.id, true)),
  doiTrangThaiDonHang: traKetQua((req) => admin.adminOrders.status(req.user.id, req.params.id, req.body)),
  danhSachThanhToan: traDuLieu((req) => admin.payments.admin(req.query)),
  duyetDanhGia: traKetQua((req) => admin.reviews.status(req.params.id, req.body.trangThai)),
  danhSachTaiKhoan: traDuLieu((req) => admin.accounts.list(req.query)),
  chiTietTaiKhoan: traDuLieu((req) => admin.accounts.get(req.params.id)),
  doiTrangThaiTaiKhoan: traKetQua((req) => admin.accounts.status(req.user.id, req.params.id, req.body.trangThai)),
  danhSachNhanVien: traDuLieu((req) => admin.staff.list(req.query)),
  chiTietNhanVien: traDuLieu((req) => admin.staff.get(req.params.id)),
  taoNhanVien: traDuLieu((req) => admin.staff.create(req.body), { statusCode: 201 }),
  capNhatNhanVien: traDuLieu((req) => admin.staff.update(req.params.id, req.body)),
  doiTrangThaiNhanVien: traKetQua((req) => admin.staff.status(req.params.id, req.body.trangThai)),
  dashboard: traDuLieu(() => admin.dashboard.summary()),
  thongKeDoanhThu: traDuLieu((req) => admin.dashboard.revenue(req.query)),
  thongKeSanPham: traDuLieu(() => admin.dashboard.products()),
  thongKeDonHang: traDuLieu(() => admin.dashboard.orders()),
  thongKeTonKho: traDuLieu(() => admin.dashboard.inventory()),
};
