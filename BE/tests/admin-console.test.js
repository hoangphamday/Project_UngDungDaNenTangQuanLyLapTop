const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
require('express-async-errors');
const router = require('../src/routes/admin-console.routes');
const { manager } = require('../src/routes/middleware');

test('all administrative console reads enforce authentication and manager role', () => {
  const routes = router.stack.filter(layer => layer.route);
  assert.equal(routes.length, 6);
  for (const { route } of routes) {
    assert.equal(route.methods.get, true);
    assert.deepEqual(route.stack[1].handle.vaiTroChoPhep, manager[1].vaiTroChoPhep);
    assert.throws(() => route.stack[1].handle({ user: { role: 'CUSTOMER' } }, {}, () => {}), { statusCode: 403 });
    for (const role of ['ADMIN', 'STAFF']) {
      let allowed = false;
      route.stack[1].handle({ user: { role } }, {}, () => { allowed = true; });
      assert.equal(allowed, true);
    }
  }
});

test('administrative console does not expose data without a session', async () => {
  const app = express();
  app.use(router);
  app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ message: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    for (const path of ['/admin/laptops', '/admin/categories', '/admin/brands', '/admin/reviews', '/admin/customers', '/admin/promotions/1']) {
      const response = await fetch('http://127.0.0.1:' + server.address().port + path);
      assert.equal(response.status, 401, path);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
