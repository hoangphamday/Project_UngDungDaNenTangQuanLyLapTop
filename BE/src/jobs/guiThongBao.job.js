const { nhieu } = require('../repositories/co-so-du-lieu.repository');
const { guiThongBao } = require('../integrations/expoPush');

const guiChoTaiKhoan = async (taiKhoanId, payload) => {
  const devices = await nhieu('SELECT expo_push_token FROM thiet_bi WHERE tai_khoan_id=? AND trang_thai=TRUE', [taiKhoanId]);
  return guiThongBao(devices.map((item) => item.expo_push_token), payload);
};
module.exports = { guiChoTaiKhoan };
