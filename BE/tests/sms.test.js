const test = require('node:test');
const assert = require('node:assert/strict');
const { guiQuaEsms } = require('../src/services/sms.service');

const config = {
  url: 'https://sms.example.test/send', apiKey: 'test-api-key', secretKey: 'test-secret',
  brandname: 'LaptopStore', smsType: '2', isUnicode: '0', sandbox: true,
  contentTemplate: '{OTP} la ma xac minh cua ban',
};

test('gui OTP eSMS dung POST JSON va khong giao viec sinh OTP cho provider', async () => {
  let request;
  const fetchMock = async (url, options) => {
    request = { url, options, body: JSON.parse(options.body) };
    return { ok: true, status: 200, json: async () => ({ CodeResult: '100', SMSID: 'sms-123' }) };
  };
  const result = await guiQuaEsms(config, '0901234567', '654321', fetchMock);
  assert.equal(result.messageId, 'sms-123');
  assert.equal(request.url, config.url);
  assert.equal(request.options.method, 'POST');
  assert.equal(request.body.Phone, '0901234567');
  assert.equal(request.body.Content, '654321 la ma xac minh cua ban');
  assert.equal(request.body.Sandbox, '1');
});

test('tu choi response eSMS khac CodeResult 100', async () => {
  const fetchMock = async () => ({
    ok: true, status: 200, json: async () => ({ CodeResult: '103', ErrorMessage: 'Insufficient balance' }),
  });
  await assert.rejects(
    guiQuaEsms(config, '0901234567', '654321', fetchMock),
    (error) => error.statusCode === 502 && error.providerCode === '103',
  );
});

test('bat buoc template SMS co bien OTP', async () => {
  await assert.rejects(
    guiQuaEsms({ ...config, contentTemplate: 'Ma xac minh cua ban' }, '0901234567', '654321', async () => {}),
    (error) => error.statusCode === 500,
  );
});
