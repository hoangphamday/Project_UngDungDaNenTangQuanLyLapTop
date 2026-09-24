const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const validator = require('../src/validators/api.validator');

const withServer = async (configure, run) => {
  const app = express();
  app.use(express.json());
  configure(app);
  const server = app.listen(0);
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('validator tu choi device va so luong gio hang khong hop le', async () => {
  await withServer((app) => {
    app.post('/device', validator.device, (_req, res) => res.sendStatus(204));
    app.post('/quantity', validator.quantity, (_req, res) => res.sendStatus(204));
  }, async (baseUrl) => {
    const headers = { 'content-type': 'application/json' };
    const device = await fetch(`${baseUrl}/device`, { method: 'POST', headers, body: JSON.stringify({ expoPushToken: 'ngan', platform: 'WINDOWS' }) });
    const quantity = await fetch(`${baseUrl}/quantity`, { method: 'POST', headers, body: JSON.stringify({ soLuong: 0 }) });
    assert.equal(device.status, 422);
    assert.equal(quantity.status, 422);
  });
});

test('validator chuan hoa boolean status', async () => {
  await withServer((app) => {
    app.patch('/status', validator.booleanStatus, (req, res) => res.json({ value: req.body.trangThai }));
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/status`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ trangThai: false }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).value, false);
  });
});
