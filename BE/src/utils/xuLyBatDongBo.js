const xuLyBatDongBo = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
module.exports = xuLyBatDongBo;
