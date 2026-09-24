const { xacThuc } = require('../middlewares/xacThuc.middleware');
const { choPhep } = require('../middlewares/phanQuyen.middleware');
const { idHopLe } = require('../middlewares/kiemTraDuLieu.middleware');
const taiAnh = require('../middlewares/taiAnh.middleware');
module.exports={xacThuc,idHopLe,taiAnh,customer:[xacThuc,choPhep('CUSTOMER')],manager:[xacThuc,choPhep('ADMIN','STAFF')],onlyAdmin:[xacThuc,choPhep('ADMIN')]};
