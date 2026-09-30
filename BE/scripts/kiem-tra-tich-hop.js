const app = require('../src/app');
const { pool } = require('../src/config/database');
const { taoAccessToken } = require('../src/utils/bao-mat');

const chay = async () => {
  const [rows] = await pool.query('SHOW TABLES');
  const tables = new Set(rows.map(row => Object.values(row)[0]));
  const models = require('../src/models');
  for (const model of Object.values(models).filter(m => typeof m.getTableName === 'function')) {
    if (!tables.has(model.getTableName())) throw new Error(`Thieu bang ${model.getTableName()}`);
  }

  const server = app.listen(0);
  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const adminToken = taoAccessToken({ id: 1, ten_vai_tro: 'ADMIN' });
    const customerToken = taoAccessToken({ id: 3, ten_vai_tro: 'CUSTOMER' });
    const goi = async (path, token) => {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      return { status: response.status, body: await response.json() };
    };
    const checks = [
      ['/api/v1/auth/me', adminToken, 200, (body) => body.data?.vaiTro === 'ADMIN'],
      ['/api/v1/admin/variants', adminToken, 200, (body) => Array.isArray(body.data)],
      ['/api/v1/laptops/1/variants', null, 200, (body) => Array.isArray(body.data)],
      ['/api/v1/laptops', null, 200, (body) => Array.isArray(body.data?.items)],
      ['/api/v1/categories/tree', null, 200, (body) => Array.isArray(body.data)],
      ['/api/v1/profile', customerToken, 200, (body) => body.data?.id],
      ['/api/v1/admin/dashboard', adminToken, 200, (body) => typeof body.data?.orders === 'number'],
      ['/api/v1/profile', adminToken, 403, () => true],
      ['/api/v1/admin/dashboard', customerToken, 403, () => true],
    ];
    for (const [path, token, expectedStatus, verify] of checks) {
      const result = await goi(path, token);
      if (result.status !== expectedStatus || !verify(result.body)) {
        throw new Error(`${path} that bai: HTTP ${result.status}, mong doi ${expectedStatus}`);
      }
    }
    console.log(`Tich hop MySQL thanh cong: ${checks.length} luong public/Customer/Admin; schema du 26 bang nghiep vu.`);
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
