const LoiUngDung = require('../utils/loi-ung-dung');
const { taiAnh: upload } = require('../config/multer');

const batBuoc = (...fields) => (req, _res, next) => {
  const errors = fields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '')
    .map((field) => ({ field, message: `${field} la bat buoc` }));
  if (errors.length) throw new LoiUngDung('Du lieu dau vao khong hop le', 422, errors);
  next();
};

const idHopLe = (req, _res, next) => {
  for (const [field, value] of Object.entries(req.params)) {
    if ((field === 'id' || field.endsWith('Id')) && (!/^\d+$/.test(value) || Number(value) < 1)) {
      throw new LoiUngDung(`${field} khong hop le`, 422);
    }
  }
  next();
};

module.exports = { batBuoc, idHopLe, upload };
