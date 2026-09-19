const app = require('../src/app');
const { pool } = require('../src/config/database');
const { taoAccessToken } = require('../src/utils/bao-mat');

const chay = async () => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
       FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'`,
  );
  if (rows[0].total !== 25) throw new Error(`Schema co ${rows[0].total} bang, can dung 25 bang`);

  const server = app.listen(0);
  try {
    const token = taoAccessToken({ id: 1, ten_vai_tro: 'ADMIN' });
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (response.status !== 200 || body.data?.vaiTro !== 'ADMIN') {
      throw new Error(`GET /auth/me that bai: HTTP ${response.status}`);
    }
    console.log('Tich hop MySQL + GET /auth/me thanh cong; schema du 25 bang.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

chay()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
