const { pool } = require('../config/database');
const LoiUngDung = require('../utils/loi-ung-dung');

const ketNoi = (connection) => connection || pool;
const mot = async (sql, params = [], connection) => (await ketNoi(connection).execute(sql, params))[0][0] || null;
const nhieu = async (sql, params = [], connection) => (await ketNoi(connection).execute(sql, params))[0];
const chay = async (sql, params = [], connection) => (await ketNoi(connection).execute(sql, params))[0];

const capNhat = async (table, id, body, mapping, extraWhere = '', extraParams = [], connection) => {
  const entries = Object.entries(mapping).filter(([key]) => body[key] !== undefined);
  if (!entries.length) throw new LoiUngDung('Khong co du lieu can cap nhat', 422);
  const result = await chay(
    `UPDATE ${table} SET ${entries.map(([, column]) => `${column}=?`).join(',')} WHERE id=?${extraWhere}`,
    [...entries.map(([key]) => body[key]), id, ...extraParams],
    connection,
  );
  if (!result.affectedRows) throw new LoiUngDung('Du lieu khong ton tai', 404);
  return result;
};

module.exports = { mot, nhieu, chay, capNhat };
