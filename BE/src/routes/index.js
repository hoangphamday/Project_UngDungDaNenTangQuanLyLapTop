const router=require('express').Router();
router.use('/auth',require('./xacThuc.routes'));router.use('/auth',require('./otpXacThuc.routes'));
for(const name of ['thietBi','khachHang','diaChi','hangLaptop','danhMuc','laptop','hinhAnhLaptop','gioHang','sanPhamYeuThich','khuyenMai','donHang','danhGia','thongBao','kho','tonKho','nhaCungCap','phieuNhap','taiKhoan','nhanVien','thongKe'])router.use(require(`./${name}.routes`));
router.use(require('./thanhToan.routes').router);
module.exports=router;
