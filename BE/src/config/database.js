const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: env.database.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4',
  decimalNumbers: true,
  timezone: 'Z',
});

const kiemTraKetNoi = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};

const trongGiaoDich = async (xuLy) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const ketQua = await xuLy(connection);
    await connection.commit();
    return ketQua;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, kiemTraKetNoi, trongGiaoDich };
