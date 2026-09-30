const LoiUngDung = require('../utils/loi-ung-dung');

const choPhep = (...vaiTroChoPhep) => {
  const middleware = (req, _res, next) => {
    if (!req.user || !vaiTroChoPhep.includes(req.user.role)) {
      throw new LoiUngDung('Ban khong co quyen thuc hien thao tac nay', 403);
    }
    return next();
  };
  // Metadata chi dung de audit/test ma tran phan quyen, khong tin du lieu tu request.
  middleware.vaiTroChoPhep = Object.freeze([...vaiTroChoPhep]);
  return middleware;
};

module.exports = { choPhep };
