const admin = require('../services/admin.service');
const { traDuLieu, traKetQua } = require('./controller-helper');

module.exports = {
  danhSachKho: traDuLieu(() => admin.warehouses.list()),
  taoKho: traDuLieu((req) => admin.warehouses.create(req.body), { statusCode: 201 }),
  capNhatKho: traDuLieu((req) => admin.warehouses.update(req.params.id, req.body)),
  tonKho: traDuLieu((req) => admin.warehouses.inventory(req.query)),
  tonKhoLaptop: traDuLieu((req) => admin.warehouses.inventoryOne(req.params.laptopId)),
  tonKhoThap: traDuLieu(() => admin.warehouses.low()),
  danhSachNhaCungCap: traDuLieu((req) => admin.suppliers.list(req.query)),
  chiTietNhaCungCap: traDuLieu((req) => admin.suppliers.get(req.params.id)),
  taoNhaCungCap: traDuLieu((req) => admin.suppliers.create(req.body), { statusCode: 201 }),
  capNhatNhaCungCap: traDuLieu((req) => admin.suppliers.update(req.params.id, req.body)),
  doiTrangThaiNhaCungCap: traKetQua((req) => admin.suppliers.status(req.params.id, req.body.trangThai)),
  danhSachPhieuNhap: traDuLieu((req) => admin.imports.list(req.query)),
  chiTietPhieuNhap: traDuLieu((req) => admin.imports.get(req.params.id)),
  taoPhieuNhap: traDuLieu((req) => admin.imports.create(req.user.id, req.body), { statusCode: 201 }),
  capNhatPhieuNhap: traDuLieu((req) => admin.imports.update(req.params.id, req.body)),
  hoanTatPhieuNhap: traKetQua((req) => admin.imports.complete(req.params.id)),
  huyPhieuNhap: traKetQua((req) => admin.imports.cancel(req.params.id)),
};
