const swaggerUi = require('swagger-ui-express');

const spec = {
  openapi: '3.0.3',
  info: { title: 'Laptop Store API', version: '1.0.0', description: 'REST API quan ly cua hang laptop' },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      ApiResponse: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: {} } },
    },
  },
  paths: {},
};

const themRoutes = (router, prefix) => {
  for (const layer of router.stack.filter((item) => item.route)) {
    const method = Object.keys(layer.route.methods)[0];
    const rawPath = `${prefix}${layer.route.path}`;
    const path = rawPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    const params = [...rawPath.matchAll(/:([A-Za-z0-9_]+)/g)].map((match) => ({ name: match[1], in: 'path', required: true, schema: { type: 'integer' } }));
    const authenticated = layer.route.stack.some((item) => item.handle.name === 'xacThuc');
    spec.paths[path] ||= {};
    spec.paths[path][method] = {
      tags: [rawPath.split('/').filter(Boolean)[0] || 'api'],
      operationId: `${method}_${rawPath.replace(/[^A-Za-z0-9]+/g, '_')}`,
      parameters: params,
      ...(authenticated ? { security: [{ bearerAuth: [] }] } : {}),
      responses: { 200: { description: 'Thanh cong' }, 401: { description: 'Chua xac thuc' }, 422: { description: 'Du lieu khong hop le' } },
    };
  }
};

const taoTaiLieu = () => {
  spec.paths = {};
  themRoutes(require('../routes/xacThuc.routes'), '/auth');
  themRoutes(require('../routes/otpXacThuc.routes'), '/auth');
  const names = ['thietBi','khachHang','diaChi','hangLaptop','danhMuc','laptop','hinhAnhLaptop','gioHang','sanPhamYeuThich','khuyenMai','donHang','danhGia','thongBao','kho','tonKho','nhaCungCap','phieuNhap','taiKhoan','nhanVien','thongKe'];
  for (const name of names) themRoutes(require(`../routes/${name}.routes`), '');
  const paymentRoutes = require('../routes/thanhToan.routes');
  themRoutes(paymentRoutes.router, '');
  themRoutes(paymentRoutes.webhookRouter, '/payments');
};

const ganSwagger = (app) => {
  taoTaiLieu();
  app.get('/api-docs.json', (_req, res) => res.json(spec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
};

module.exports = { spec, ganSwagger };
