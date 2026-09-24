const env = require('../config/env');
const LoiUngDung = require('../utils/loi-ung-dung');

const khongTimThay = (req, _res, next) =>
  next(new LoiUngDung(`Khong tim thay endpoint ${req.method} ${req.originalUrl}`, 404));

const xuLyLoi = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Loi may chu noi bo';
  const errors = error.errors || [];
  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Du lieu da ton tai';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 422;
    message = 'Du lieu tham chieu khong ton tai';
  } else if (['ER_DATA_TOO_LONG', 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD', 'ER_WARN_DATA_OUT_OF_RANGE', 'ER_BAD_NULL_ERROR', 'ER_CHECK_CONSTRAINT_VIOLATED'].includes(error.code)) {
    statusCode = 422;
    message = 'Du lieu dau vao khong hop le';
  }
  if (statusCode >= 500) {
    // Khong log request body de tranh lo mat khau/token/OTP.
    console.error(`[LOI] ${error.name}: ${error.message}`);
    if (env.laProduction) message = 'Loi may chu noi bo';
  }
  const body = { success: false, message, errors };
  if (!env.laProduction && statusCode >= 500) body.stack = error.stack;
  return res.status(statusCode).json(body);
};

module.exports = { khongTimThay, xuLyLoi };
