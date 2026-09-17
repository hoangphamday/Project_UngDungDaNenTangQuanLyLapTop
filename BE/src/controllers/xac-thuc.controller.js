const dichVu = require('../services/xac-thuc.service');
const { thanhCong } = require('../utils/phan-hoi');

const dangKy = async (req, res) =>
  thanhCong(res, { statusCode: 201, message: 'Dang ky thanh cong', data: await dichVu.dangKy(req.body) });
const dangNhap = async (req, res) =>
  thanhCong(res, { message: 'Dang nhap thanh cong', data: await dichVu.dangNhap(req.body) });
const lamMoiToken = async (req, res) =>
  thanhCong(res, { message: 'Lam moi token thanh cong', data: await dichVu.lamMoiToken(req.body.refreshToken) });

const dangXuat = async (req, res) => {
  await dichVu.dangXuat(req.body.refreshToken);
  return thanhCong(res, { message: 'Dang xuat thanh cong' });
};

const dangXuatTatCa = async (req, res) => {
  await dichVu.dangXuatTatCa(req.user.id);
  return thanhCong(res, { message: 'Da dang xuat tren tat ca thiet bi' });
};

const quenMatKhau = async (req, res) => {
  const duLieuPhatTrien = await dichVu.quenMatKhau(req.body.soDienThoai);
  return thanhCong(res, {
    message: 'Neu tai khoan hop le, ma OTP se duoc gui den so dien thoai', data: duLieuPhatTrien,
  });
};

const xacMinhOtp = async (req, res) => thanhCong(res, {
  message: 'Xac minh OTP thanh cong',
  data: await dichVu.xacMinhOtp(req.body.soDienThoai, req.body.maOtp),
});

const datLaiMatKhau = async (req, res) => {
  await dichVu.datLaiMatKhau(req.body.resetToken, req.body.matKhauMoi);
  return thanhCong(res, { message: 'Dat lai mat khau thanh cong' });
};

const thongTinCuaToi = async (req, res) =>
  thanhCong(res, { data: await dichVu.layThongTinCaNhan(req.user.id) });

module.exports = {
  dangKy, dangNhap, lamMoiToken, dangXuat, dangXuatTatCa,
  quenMatKhau, xacMinhOtp, datLaiMatKhau, thongTinCuaToi,
};
