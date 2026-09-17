const boDem = new Map();

const gioiHanTanSuat = ({ windowMs, max, message }) => (req, res, next) => {
  const khoa = `${req.ip}:${req.baseUrl}${req.path}`;
  const hienTai = Date.now();
  const thongTin = boDem.get(khoa);
  if (!thongTin || thongTin.resetAt <= hienTai) {
    boDem.set(khoa, { count: 1, resetAt: hienTai + windowMs });
    return next();
  }
  thongTin.count += 1;
  if (thongTin.count > max) {
    res.set('Retry-After', String(Math.ceil((thongTin.resetAt - hienTai) / 1000)));
    return res.status(429).json({ success: false, message, errors: [] });
  }
  return next();
};

// Tranh Map tang vo han trong tien trinh chay lau.
const boDonDep = setInterval(() => {
  const hienTai = Date.now();
  for (const [khoa, thongTin] of boDem.entries()) {
    if (thongTin.resetAt <= hienTai) boDem.delete(khoa);
  }
}, 10 * 60_000);
boDonDep.unref();

module.exports = { gioiHanTanSuat };
