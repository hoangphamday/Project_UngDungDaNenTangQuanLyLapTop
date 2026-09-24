const api = require('../services/api.service');
const { traDuLieu, traKetQua } = require('./controller-helper');

module.exports = {
  danhSachYeuThich: traDuLieu((req) => api.wishCart.wishlist(req.user.id)),
  themYeuThich: traKetQua((req) => api.wishCart.wishAdd(req.user.id, req.params.laptopId), { statusCode: 201, message: 'Da them yeu thich' }),
  xoaYeuThich: traKetQua((req) => api.wishCart.wishRemove(req.user.id, req.params.laptopId), { message: 'Da xoa yeu thich' }),
  layGioHang: traDuLieu((req) => api.wishCart.cart(req.user.id)),
  themGioHang: traKetQua((req) => api.wishCart.cartAdd(req.user.id, req.body), { statusCode: 201, message: 'Da them vao gio' }),
  capNhatGioHang: traKetQua((req) => api.wishCart.cartUpdate(req.user.id, req.params.laptopId, req.body.soLuong), { message: 'Da cap nhat gio' }),
  xoaKhoiGio: traKetQua((req) => api.wishCart.cartRemove(req.user.id, req.params.laptopId), { message: 'Da xoa khoi gio' }),
  xoaGioHang: traKetQua((req) => api.wishCart.cartClear(req.user.id), { message: 'Da xoa gio hang' }),
  khuyenMaiKhaDung: traDuLieu(() => api.promotions.available()),
  kiemTraKhuyenMai: traDuLieu((req) => api.promotions.validate(req.user.id, req.body.maKhuyenMai)),
};
