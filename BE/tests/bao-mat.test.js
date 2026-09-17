const test = require('node:test');
const assert = require('node:assert/strict');
const { bamOtp, bamToken, soSanhAnToan } = require('../src/utils/bao-mat');

test('bam OTP on dinh, khong luu ma ro va vua VARCHAR(10)', () => {
  const hash = bamOtp('0900000001', '123456', 'RESET_PASSWORD');
  assert.equal(hash.length, 10);
  assert.notEqual(hash, '123456');
  assert.equal(hash, bamOtp('0900000001', '123456', 'RESET_PASSWORD'));
});

test('bam token SHA-256 va so sanh constant-time', () => {
  assert.equal(bamToken('token-bi-mat').length, 64);
  assert.equal(soSanhAnToan('abc', 'abc'), true);
  assert.equal(soSanhAnToan('abc', 'abd'), false);
});
