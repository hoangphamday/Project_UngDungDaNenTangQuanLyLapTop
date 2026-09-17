const LoiUngDung = require('../utils/loi-ung-dung');

const choPhep = (...vaiTroChoPhep) => (req, _res, next) => {
  if (!req.user || !vaiTroChoPhep.includes(req.user.role)) {
    throw new LoiUngDung('Ban khong co quyen thuc hien thao tac nay', 403);
  }
  return next();
};

module.exports = { choPhep };
