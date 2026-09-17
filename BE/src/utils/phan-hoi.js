const thanhCong = (res, { statusCode = 200, message = 'Thanh cong', data = null } = {}) =>
  res.status(statusCode).json({ success: true, message, data });

const danhSachPhanTrang = (res, items, { page, limit, total }) =>
  res.status(200).json({
    success: true,
    data: { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });

module.exports = { thanhCong, danhSachPhanTrang };
