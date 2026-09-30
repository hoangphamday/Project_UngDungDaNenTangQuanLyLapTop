const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const env = require('../config/env');
const { trongGiaoDich } = require('../config/database');
const { VAI_TRO } = require('../constants/vai-tro');
const repo = require('../repositories/xac-thuc.repository');
const { guiOtp } = require('./sms.service');
const LoiUngDung = require('../utils/loi-ung-dung');
const {
  bamToken, bamOtp, soSanhAnToan, taoAccessToken, taoRefreshToken,
  taoResetToken, xacMinhToken, ngayHetHanToken,
} = require('../utils/bao-mat');

const thongTinCongKhai = (taiKhoan) => ({
  id: taiKhoan.id,
  tenDangNhap: taiKhoan.ten_dang_nhap,
  email: taiKhoan.email,
  soDienThoai: taiKhoan.so_dien_thoai,
  vaiTro: taiKhoan.ten_vai_tro,
});

const taoCapToken = async (taiKhoan, thietBi, connection) => {
  const accessToken = taoAccessToken(taiKhoan);
  const refreshToken = taoRefreshToken(taiKhoan);
  await repo.luuRefreshToken({
    taiKhoanId: taiKhoan.id,
    tokenHash: bamToken(refreshToken),
    deviceId: thietBi?.deviceId,
    deviceName: thietBi?.deviceName,
    expiresAt: ngayHetHanToken(refreshToken),
  }, connection);
  return { accessToken, refreshToken };
};

const dangKy = (duLieu) => trongGiaoDich(async (connection) => {
  const matKhauHash = await bcrypt.hash(duLieu.matKhau, 12);
  const taiKhoanId = await repo.taoTaiKhoan({
    vaiTro: VAI_TRO.CUSTOMER,
    tenDangNhap: duLieu.tenDangNhap,
    matKhauHash,
    email: duLieu.email,
    soDienThoai: duLieu.soDienThoai,
  }, connection);
  await repo.taoKhachHang(taiKhoanId, duLieu, connection);
  const taiKhoan = {
    id: taiKhoanId,
    ten_dang_nhap: duLieu.tenDangNhap,
    email: duLieu.email,
    so_dien_thoai: duLieu.soDienThoai,
    ten_vai_tro: VAI_TRO.CUSTOMER,
  };
  const tokens = await taoCapToken(taiKhoan, duLieu.thietBi, connection);
  return { taiKhoan: thongTinCongKhai(taiKhoan), ...tokens };
});

const dangNhap = (duLieu) => trongGiaoDich(async (connection) => {
  const taiKhoan = await repo.timTaiKhoanDangNhap(duLieu.dinhDanh, connection, true);
  const hopLe = taiKhoan && (await bcrypt.compare(duLieu.matKhau, taiKhoan.mat_khau_hash));
  if (!hopLe) throw new LoiUngDung('Thong tin dang nhap khong chinh xac', 401);
  if (taiKhoan.trang_thai !== 'ACTIVE') throw new LoiUngDung('Tai khoan khong o trang thai hoat dong', 403);

  await repo.capNhatLanDangNhap(taiKhoan.id, connection);
  const tokens = await taoCapToken(taiKhoan, duLieu.thietBi, connection);
  return { taiKhoan: thongTinCongKhai(taiKhoan), ...tokens };
});

const lamMoiToken = (refreshToken) => trongGiaoDich(async (connection) => {
  let payload;
  try {
    payload = xacMinhToken(refreshToken, env.jwt.refreshSecret, 'refresh');
  } catch (_) {
    throw new LoiUngDung('Refresh token khong hop le hoac da het han', 401);
  }

  const tokenDaLuu = await repo.timRefreshTokenDeKhoa(bamToken(refreshToken), connection);
  if (!tokenDaLuu || tokenDaLuu.is_revoked || new Date(tokenDaLuu.expires_at) <= new Date()) {
    throw new LoiUngDung('Refresh token da het hieu luc', 401);
  }
  if (String(tokenDaLuu.tai_khoan_id) !== String(payload.sub)) throw new LoiUngDung('Refresh token khong hop le', 401);

  const taiKhoan = await repo.timTaiKhoanTheoId(payload.sub, connection, true);
  if (!taiKhoan || taiKhoan.trang_thai !== 'ACTIVE') throw new LoiUngDung('Tai khoan khong o trang thai hoat dong', 403);

  await repo.thuHoiRefreshToken(tokenDaLuu.id, connection);
  return taoCapToken(taiKhoan, { deviceId: tokenDaLuu.device_id, deviceName: tokenDaLuu.device_name }, connection);
});

const dangXuat = (refreshToken) => trongGiaoDich(async (connection) => {
  const tokenDaLuu = await repo.timRefreshTokenDeKhoa(bamToken(refreshToken), connection);
  if (tokenDaLuu && !tokenDaLuu.is_revoked) await repo.thuHoiRefreshToken(tokenDaLuu.id, connection);
});

const dangXuatTatCa = (taiKhoanId) => repo.thuHoiTatCaRefreshToken(taiKhoanId);

const quenMatKhau = async (soDienThoai) => {
  const taiKhoan = await repo.timTaiKhoanDangNhap(soDienThoai);
  if (!taiKhoan || taiKhoan.so_dien_thoai !== soDienThoai || taiKhoan.trang_thai !== 'ACTIVE') return {};

  const maOtp = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const otpId = await trongGiaoDich(async (connection) => {
    await repo.huyOtpCu(soDienThoai, 'RESET_PASSWORD', connection);
    return repo.taoOtp({
      soDienThoai,
      maOtpHash: bamOtp(soDienThoai, maOtp, 'RESET_PASSWORD'),
      mucDich: 'RESET_PASSWORD',
      expiresAt: new Date(Date.now() + env.otp.expiresMinutes * 60_000),
    }, connection);
  });
  try {
    await guiOtp(soDienThoai, maOtp);
  } catch (error) {
    await repo.danhDauOtpDaDung(otpId);
    // Khong log OTP, credentials hay so dien thoai.
    console.error(`[SMS] Gui OTP that bai (${error.providerCode || error.statusCode || 'UNKNOWN'})`);
    // Giu response giong tai khoan khong ton tai de tranh ro ri account enumeration.
    return {};
  }
  return env.nodeEnv === 'development' && env.otp.exposeInDevelopment ? { developmentOtp: maOtp } : {};
};

const xacMinhOtp = async (soDienThoai, maOtp) => {
  const ketQua = await trongGiaoDich(async (connection) => {
    const otp = await repo.timOtpDeKhoa({ soDienThoai, mucDich: 'RESET_PASSWORD' }, connection);
    if (!otp || otp.da_su_dung || new Date(otp.expires_at) <= new Date()) {
      return { loi: new LoiUngDung('OTP khong hop le hoac da het han', 422) };
    }
    if (otp.so_lan_thu >= env.otp.maxAttempts) {
      return { loi: new LoiUngDung('OTP da vuot qua so lan thu', 429) };
    }

    const hopLe = soSanhAnToan(otp.ma_otp, bamOtp(soDienThoai, maOtp, 'RESET_PASSWORD'));
    if (!hopLe) {
      await repo.tangSoLanThuOtp(otp.id, connection);
      return { loi: new LoiUngDung('OTP khong chinh xac', 422) };
    }

    const taiKhoan = await repo.timTaiKhoanDangNhap(soDienThoai, connection, true);
    if (!taiKhoan || taiKhoan.trang_thai !== 'ACTIVE') {
      return { loi: new LoiUngDung('Tai khoan khong hop le', 422) };
    }
    return { resetToken: taoResetToken(taiKhoan.id, otp.id, soDienThoai) };
  });
  if (ketQua.loi) throw ketQua.loi;
  return ketQua;
};

const datLaiMatKhau = (resetToken, matKhauMoi) => trongGiaoDich(async (connection) => {
  let payload;
  try {
    payload = xacMinhToken(resetToken, env.jwt.accessSecret, 'password_reset');
  } catch (_) {
    throw new LoiUngDung('Reset token khong hop le hoac da het han', 401);
  }

  const otp = await repo.timOtpDeKhoa({
    otpId: payload.otpId, soDienThoai: payload.phone, mucDich: 'RESET_PASSWORD',
  }, connection);
  if (!otp || otp.da_su_dung || new Date(otp.expires_at) <= new Date()) {
    throw new LoiUngDung('Yeu cau dat lai mat khau da het hieu luc', 409);
  }

  const taiKhoan = await repo.timTaiKhoanTheoId(payload.sub, connection, true);
  if (!taiKhoan || taiKhoan.so_dien_thoai !== payload.phone) throw new LoiUngDung('Reset token khong hop le', 401);
  await repo.danhDauOtpDaDung(otp.id, connection);
  await repo.doiMatKhau(taiKhoan.id, await bcrypt.hash(matKhauMoi, 12), connection);
  await repo.thuHoiTatCaRefreshToken(taiKhoan.id, connection);
});

const layThongTinCaNhan = async (taiKhoanId) => {
  const taiKhoan = await repo.timTaiKhoanTheoId(taiKhoanId);
  if (!taiKhoan) throw new LoiUngDung('Khong tim thay tai khoan', 404);
  return {
    ...thongTinCongKhai(taiKhoan),
    trangThai: taiKhoan.trang_thai,
    hoTen: taiKhoan.ho_ten_khach_hang || taiKhoan.ho_ten_nhan_vien || null,
    khachHangId: taiKhoan.khach_hang_id || null,
    nhanVienId: taiKhoan.nhan_vien_id || null,
    maNhanVien: taiKhoan.ma_nhan_vien || null,
    lanDangNhapCuoi: taiKhoan.lan_dang_nhap_cuoi,
    ngayTao: taiKhoan.created_at,
  };
};

module.exports = {
  dangKy, dangNhap, lamMoiToken, dangXuat, dangXuatTatCa,
  quenMatKhau, xacMinhOtp, datLaiMatKhau, layThongTinCaNhan,
};
