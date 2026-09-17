const app = require('./app');
const env = require('./config/env');
const { pool, kiemTraKetNoi } = require('./config/database');

let server;
const khoiDong = async () => {
  await kiemTraKetNoi();
  server = app.listen(env.port, () => console.log(`May chu dang chay tai http://localhost:${env.port}/api/v1`));
};

const dungAnToan = async (tinHieu) => {
  console.log(`Nhan ${tinHieu}, dang dung may chu...`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', () => dungAnToan('SIGINT'));
process.on('SIGTERM', () => dungAnToan('SIGTERM'));
process.on('unhandledRejection', (error) => {
  console.error('[LOI] Promise khong duoc xu ly:', error.message);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

khoiDong().catch((error) => {
  console.error(`Khong the khoi dong may chu: ${error.message}`);
  process.exit(1);
});
