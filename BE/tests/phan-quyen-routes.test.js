const test = require('node:test');
const assert = require('node:assert/strict');
const routeNames=['thietBi','khachHang','diaChi','hangLaptop','danhMuc','laptop','hinhAnhLaptop','gioHang','sanPhamYeuThich','khuyenMai','donHang','danhGia','thongBao','kho','tonKho','nhaCungCap','phieuNhap','taiKhoan','nhanVien','thongKe'];
const routers=[...routeNames.map((name)=>require(`../src/routes/${name}.routes`)),require('../src/routes/thanhToan.routes').router];

const entries = routers.flatMap((router)=>router.stack.filter((layer) => layer.route).map((layer) => ({
  endpoint: `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`,
  handlers: layer.route.stack.map((item) => item.handle),
})));
const publicEndpoints = new Set([
  'GET /laptops', 'GET /laptops/slug/:slug', 'GET /laptops/:id', 'GET /laptops/:id/reviews',
  'GET /brands', 'GET /brands/:id', 'GET /categories', 'GET /categories/tree', 'GET /categories/:id',
]);
const loggedInEndpoints = new Set([
  'POST /devices', 'GET /devices', 'DELETE /devices/:id', 'GET /notifications',
  'GET /notifications/unread-count', 'PATCH /notifications/:id/read', 'PATCH /notifications/read-all',
]);
const adminOnlyPrefixes = ['/admin/accounts', '/admin/staff'];

const rolesOf = (entry) => entry.handlers.find((handler) => handler.vaiTroChoPhep)?.vaiTroChoPhep || [];
const hasAuth = (entry) => entry.handlers.some((handler) => handler.name === 'xacThuc');

test('tat ca route co dung lop xac thuc va nhom quyen', () => {
  assert.equal(entries.length, 93);
  for (const entry of entries) {
    if (publicEndpoints.has(entry.endpoint)) {
      assert.equal(hasAuth(entry), false, `${entry.endpoint} phai cong khai`);
      continue;
    }
    assert.equal(hasAuth(entry), true, `${entry.endpoint} thieu xac thuc`);
    if (loggedInEndpoints.has(entry.endpoint)) {
      assert.deepEqual(rolesOf(entry), [], `${entry.endpoint} phai chap nhan moi role ACTIVE`);
    } else if (adminOnlyPrefixes.some((prefix) => entry.endpoint.split(' ')[1].startsWith(prefix))) {
      assert.deepEqual(rolesOf(entry), ['ADMIN'], `${entry.endpoint} phai chi danh cho ADMIN`);
    } else if (entry.endpoint.includes('/admin/') || /^(POST|PUT|PATCH) \/(brands|categories)/.test(entry.endpoint)) {
      assert.deepEqual(rolesOf(entry), ['ADMIN', 'STAFF'], `${entry.endpoint} phai danh cho ADMIN, STAFF`);
    } else {
      assert.deepEqual(rolesOf(entry), ['CUSTOMER'], `${entry.endpoint} phai danh cho CUSTOMER`);
    }
  }
});
