const { chay } = require('../repositories/co-so-du-lieu.repository');
const chayJob = () => chay(`UPDATE khuyen_mai SET trang_thai='EXPIRED' WHERE trang_thai='ACTIVE' AND ngay_ket_thuc<NOW()`);
module.exports = { chayJob };
