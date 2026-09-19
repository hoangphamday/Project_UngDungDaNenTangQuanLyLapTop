const bcrypt = require('bcrypt');
const { pool } = require('../src/config/database');

const taoTaiKhoanThuNghiem = async () => {
  const matKhau = process.env.TEST_ADMIN_PASSWORD;
  if (!matKhau || matKhau.length < 8) throw new Error('Can dat TEST_ADMIN_PASSWORD co it nhat 8 ky tu');
  const matKhauHash = await bcrypt.hash(matKhau, 12);
  const [result] = await pool.execute(
    `UPDATE tai_khoan
        SET mat_khau_hash = ?, trang_thai = 'ACTIVE'
      WHERE ten_dang_nhap = 'admin' AND vai_tro = 'ADMIN'`,
    [matKhauHash],
  );
  if (result.affectedRows !== 1) throw new Error('Khong tim thay tai khoan admin mau trong database');
  console.log('Da tao bcrypt hash that cho tai khoan admin. Khong hien thi mat khau ra log.');
};

taoTaiKhoanThuNghiem()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
