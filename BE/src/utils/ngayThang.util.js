const laNgayHopLe = (value) => !Number.isNaN(new Date(value).getTime());
const ngayHienTai = () => new Date();
module.exports = { laNgayHopLe, ngayHienTai };
