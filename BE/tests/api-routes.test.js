const test=require('node:test');
const assert=require('node:assert/strict');
const auth=require('../src/routes/xacThuc.routes');
const otp=require('../src/routes/otpXacThuc.routes');
const {webhookRouter:webhook}=require('../src/routes/thanhToan.routes');
const routeNames=['thietBi','khachHang','diaChi','hangLaptop','danhMuc','laptop','hinhAnhLaptop','gioHang','sanPhamYeuThich','khuyenMai','donHang','danhGia','thongBao','kho','tonKho','nhaCungCap','phieuNhap','taiKhoan','nhanVien','thongKe'];
const apiRouters=[...routeNames.map((name)=>require(`../src/routes/${name}.routes`)),require('../src/routes/thanhToan.routes').router];

const routes=(router,prefix)=>router.stack.filter(x=>x.route).map(x=>`${Object.keys(x.route.methods)[0].toUpperCase()} ${prefix}${x.route.path}`);
const actual=new Set([...routes(auth,'/api/v1/auth'),...routes(otp,'/api/v1/auth'),...apiRouters.flatMap((router)=>routes(router,'/api/v1')),...routes(webhook,'/api/v1/payments')]);
const expected=`
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/verify-otp
POST /api/v1/auth/reset-password
POST /api/v1/auth/logout-all
GET /api/v1/auth/me
POST /api/v1/devices
GET /api/v1/devices
DELETE /api/v1/devices/:id
GET /api/v1/profile
PUT /api/v1/profile
PUT /api/v1/profile/avatar
GET /api/v1/addresses
POST /api/v1/addresses
PUT /api/v1/addresses/:id
DELETE /api/v1/addresses/:id
PATCH /api/v1/addresses/:id/default
GET /api/v1/laptops
GET /api/v1/laptops/:id
GET /api/v1/laptops/slug/:slug
GET /api/v1/brands
GET /api/v1/brands/:id
POST /api/v1/brands
PUT /api/v1/brands/:id
PATCH /api/v1/brands/:id/status
GET /api/v1/categories
GET /api/v1/categories/tree
GET /api/v1/categories/:id
POST /api/v1/categories
PUT /api/v1/categories/:id
PATCH /api/v1/categories/:id/status
POST /api/v1/admin/laptops
PUT /api/v1/admin/laptops/:id
PATCH /api/v1/admin/laptops/:id/status
POST /api/v1/admin/laptops/:id/images
DELETE /api/v1/admin/laptops/:id/images/:imageId
GET /api/v1/wishlist
POST /api/v1/wishlist/:laptopId
DELETE /api/v1/wishlist/:laptopId
GET /api/v1/cart
POST /api/v1/cart/items
PUT /api/v1/cart/items/:laptopId
DELETE /api/v1/cart/items/:laptopId
DELETE /api/v1/cart
GET /api/v1/promotions/available
POST /api/v1/promotions/validate
GET /api/v1/admin/promotions
POST /api/v1/admin/promotions
PUT /api/v1/admin/promotions/:id
PATCH /api/v1/admin/promotions/:id/status
POST /api/v1/orders
GET /api/v1/orders
GET /api/v1/orders/:id
PATCH /api/v1/orders/:id/cancel
GET /api/v1/admin/orders
GET /api/v1/admin/orders/:id
PATCH /api/v1/admin/orders/:id/status
GET /api/v1/admin/warehouses
POST /api/v1/admin/warehouses
PUT /api/v1/admin/warehouses/:id
GET /api/v1/admin/inventory
GET /api/v1/admin/inventory/:laptopId
GET /api/v1/admin/inventory/low-stock
GET /api/v1/admin/suppliers
GET /api/v1/admin/suppliers/:id
POST /api/v1/admin/suppliers
PUT /api/v1/admin/suppliers/:id
PATCH /api/v1/admin/suppliers/:id/status
GET /api/v1/admin/import-receipts
GET /api/v1/admin/import-receipts/:id
POST /api/v1/admin/import-receipts
PUT /api/v1/admin/import-receipts/:id
POST /api/v1/admin/import-receipts/:id/complete
POST /api/v1/admin/import-receipts/:id/cancel
GET /api/v1/orders/:orderId/payments
POST /api/v1/orders/:orderId/payments/retry
GET /api/v1/admin/payments
POST /api/v1/payments/:provider/webhook
GET /api/v1/laptops/:id/reviews
POST /api/v1/laptops/:id/reviews
PUT /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
PATCH /api/v1/admin/reviews/:id/status
GET /api/v1/notifications
GET /api/v1/notifications/unread-count
PATCH /api/v1/notifications/:id/read
PATCH /api/v1/notifications/read-all
GET /api/v1/admin/accounts
GET /api/v1/admin/accounts/:id
PATCH /api/v1/admin/accounts/:id/status
GET /api/v1/admin/staff
GET /api/v1/admin/staff/:id
POST /api/v1/admin/staff
PUT /api/v1/admin/staff/:id
PATCH /api/v1/admin/staff/:id/status
GET /api/v1/admin/dashboard
GET /api/v1/admin/statistics/revenue
GET /api/v1/admin/statistics/products
GET /api/v1/admin/statistics/orders
GET /api/v1/admin/statistics/inventory`.trim().split('\n');

test('ma tran REST API co du 103 endpoint, khong thua thieu',()=>{
  assert.equal(expected.length,103);
  assert.equal(actual.size,103);
  for(const endpoint of expected)assert.ok(actual.has(endpoint),`Thieu ${endpoint}`);
});

test('Swagger sinh tai lieu cho du 103 operation',()=>{
  const express=require('express');const {spec,ganSwagger}=require('../src/config/swagger');ganSwagger(express());
  const total=Object.values(spec.paths).reduce((sum,path)=>sum+Object.keys(path).length,0);
  assert.equal(total,103);
});
