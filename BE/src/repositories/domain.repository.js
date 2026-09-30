const db = require('./co-so-du-lieu.repository');
const taoRepository = (tableName) => Object.freeze({
  tableName,
  timTheoId: (id, connection) => db.mot(`SELECT * FROM ${tableName} WHERE id=?`, [id], connection),
  danhSach: (connection) => db.nhieu(`SELECT * FROM ${tableName} ORDER BY id DESC`, [], connection),
  xoaTheoId: (id, connection) => db.chay(`DELETE FROM ${tableName} WHERE id=?`, [id], connection),
});
module.exports = { taoRepository };
