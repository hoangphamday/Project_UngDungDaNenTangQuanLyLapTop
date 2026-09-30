const bcrypt = require('bcrypt');
const bamMatKhau = (value) => bcrypt.hash(value, 12);
const soSanhMatKhau = (value, hash) => bcrypt.compare(value, hash);
module.exports = { bamMatKhau, soSanhMatKhau };
