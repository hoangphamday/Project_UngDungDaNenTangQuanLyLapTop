const { pool } = require('../config/database');

const db = (connection) => connection || pool;

const timTaiKhoanDangNhap = async (dinhDanh, connection, khoa = false) => {
  const cauKhoa = khoa ? ' FOR UPDATE' : '';
  const cotDinhDanh = dinhDanh.includes('@')
    ? 'tk.email'
    : /^0\d{9}$/.test(dinhDanh) ? 'tk.so_dien_thoai' : 'tk.ten_dang_nhap';
  const [rows] = await db(connection).execute(
    `SELECT tk.id, tk.ten_dang_nhap, tk.mat_khau_hash, tk.email,
            tk.so_dien_thoai, tk.trang_thai, tk.vai_tro AS ten_vai_tro
       FROM tai_khoan tk
      WHERE ${cotDinhDanh} = ?
      LIMIT 1${cauKhoa}`,
    [dinhDanh],
  );
  return rows[0] || null;
};

const timTaiKhoanTheoId = async (id, connection, khoa = false) => {
  const cauKhoa = khoa ? ' FOR UPDATE' : '';
  const [rows] = await db(connection).execute(
    `SELECT tk.id, tk.ten_dang_nhap, tk.email, tk.so_dien_thoai,
            tk.trang_thai, tk.lan_dang_nhap_cuoi, tk.created_at,
            tk.vai_tro AS ten_vai_tro,
            kh.id AS khach_hang_id, kh.ho_ten AS ho_ten_khach_hang,
            nv.id AS nhan_vien_id, nv.ho_ten AS ho_ten_nhan_vien, nv.ma_nhan_vien
       FROM tai_khoan tk
       LEFT JOIN khach_hang kh ON kh.tai_khoan_id = tk.id
       LEFT JOIN nhan_vien nv ON nv.tai_khoan_id = tk.id
      WHERE tk.id = ? LIMIT 1${cauKhoa}`,
    [id],
  );
  return rows[0] || null;
};

const taoTaiKhoan = async (duLieu, connection) => {
  const [result] = await db(connection).execute(
    `INSERT INTO tai_khoan
       (vai_tro, ten_dang_nhap, mat_khau_hash, email, so_dien_thoai)
     VALUES (?, ?, ?, ?, ?)`,
    [duLieu.vaiTro, duLieu.tenDangNhap, duLieu.matKhauHash, duLieu.email, duLieu.soDienThoai],
  );
  return result.insertId;
};

const taoKhachHang = (taiKhoanId, duLieu, connection) => db(connection).execute(
  'INSERT INTO khach_hang (tai_khoan_id, ho_ten, ngay_sinh, gioi_tinh) VALUES (?, ?, ?, ?)',
  [taiKhoanId, duLieu.hoTen, duLieu.ngaySinh || null, duLieu.gioiTinh || 'OTHER'],
);

const capNhatLanDangNhap = (id, connection) =>
  db(connection).execute('UPDATE tai_khoan SET lan_dang_nhap_cuoi = NOW() WHERE id = ?', [id]);

const luuRefreshToken = (duLieu, connection) => db(connection).execute(
  `INSERT INTO refresh_token
     (tai_khoan_id, token_hash, device_id, device_name, expires_at)
   VALUES (?, ?, ?, ?, ?)`,
  [duLieu.taiKhoanId, duLieu.tokenHash, duLieu.deviceId || null, duLieu.deviceName || null, duLieu.expiresAt],
);

const timRefreshTokenDeKhoa = async (tokenHash, connection) => {
  const [rows] = await db(connection).execute(
    `SELECT id, tai_khoan_id, device_id, device_name, expires_at, is_revoked
       FROM refresh_token WHERE token_hash = ? LIMIT 1 FOR UPDATE`, [tokenHash],
  );
  return rows[0] || null;
};

const thuHoiRefreshToken = (id, connection) => db(connection).execute(
  'UPDATE refresh_token SET is_revoked = TRUE, revoked_at = NOW() WHERE id = ? AND is_revoked = FALSE', [id],
);

const thuHoiTatCaRefreshToken = (taiKhoanId, connection) => db(connection).execute(
  `UPDATE refresh_token SET is_revoked = TRUE, revoked_at = NOW()
    WHERE tai_khoan_id = ? AND is_revoked = FALSE`, [taiKhoanId],
);

const huyOtpCu = (soDienThoai, mucDich, connection) => db(connection).execute(
  `UPDATE otp_xac_thuc SET da_su_dung = TRUE
    WHERE so_dien_thoai = ? AND muc_dich = ? AND da_su_dung = FALSE`, [soDienThoai, mucDich],
);

const taoOtp = async (duLieu, connection) => {
  const [result] = await db(connection).execute(
    `INSERT INTO otp_xac_thuc (so_dien_thoai, ma_otp, muc_dich, expires_at)
     VALUES (?, ?, ?, ?)`,
    [duLieu.soDienThoai, duLieu.maOtpHash, duLieu.mucDich, duLieu.expiresAt],
  );
  return result.insertId;
};

const timOtpDeKhoa = async ({ otpId, soDienThoai, mucDich }, connection) => {
  const dieuKienId = otpId ? 'id = ? AND ' : '';
  const params = otpId ? [otpId, soDienThoai, mucDich] : [soDienThoai, mucDich];
  const [rows] = await db(connection).execute(
    `SELECT id, so_dien_thoai, ma_otp, muc_dich, so_lan_thu, da_su_dung, expires_at
       FROM otp_xac_thuc
      WHERE ${dieuKienId}so_dien_thoai = ? AND muc_dich = ?
      ORDER BY id DESC LIMIT 1 FOR UPDATE`, params,
  );
  return rows[0] || null;
};

const tangSoLanThuOtp = (id, connection) =>
  db(connection).execute('UPDATE otp_xac_thuc SET so_lan_thu = so_lan_thu + 1 WHERE id = ?', [id]);
const danhDauOtpDaDung = (id, connection) =>
  db(connection).execute('UPDATE otp_xac_thuc SET da_su_dung = TRUE WHERE id = ?', [id]);
const doiMatKhau = (taiKhoanId, matKhauHash, connection) =>
  db(connection).execute('UPDATE tai_khoan SET mat_khau_hash = ? WHERE id = ?', [matKhauHash, taiKhoanId]);

module.exports = {
  timTaiKhoanDangNhap, timTaiKhoanTheoId, taoTaiKhoan, taoKhachHang,
  capNhatLanDangNhap, luuRefreshToken, timRefreshTokenDeKhoa, thuHoiRefreshToken,
  thuHoiTatCaRefreshToken, huyOtpCu, taoOtp, timOtpDeKhoa, tangSoLanThuOtp,
  danhDauOtpDaDung, doiMatKhau,
};
