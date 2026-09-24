const crypto = require('node:crypto');
const env = require('../config/env');
const LoiUngDung = require('../utils/loi-ung-dung');

const guiQuaEsms = async (config, soDienThoai, maOtp, fetchImpl = fetch) => {
  if (!config.apiKey || !config.secretKey || !config.brandname) {
    throw new LoiUngDung('Dich vu SMS chua duoc cau hinh', 503);
  }
  if (!config.contentTemplate.includes('{OTP}')) {
    throw new LoiUngDung('Mau noi dung SMS thieu bien {OTP}', 500);
  }

  let response;
  try {
    response = await fetchImpl(config.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ApiKey: config.apiKey,
        SecretKey: config.secretKey,
        Phone: soDienThoai,
        Content: config.contentTemplate.replaceAll('{OTP}', maOtp),
        Brandname: config.brandname,
        SmsType: config.smsType,
        IsUnicode: config.isUnicode,
        Sandbox: config.sandbox ? '1' : '0',
        RequestId: crypto.randomUUID(),
      }),
      signal: AbortSignal.timeout(env.sms.timeoutMs),
    });
  } catch (_) {
    throw new LoiUngDung('Khong the ket noi dich vu SMS', 502);
  }

  let result;
  try {
    result = await response.json();
  } catch (_) {
    throw new LoiUngDung('Dich vu SMS tra ve du lieu khong hop le', 502);
  }
  if (!response.ok || String(result.CodeResult) !== '100') {
    const error = new LoiUngDung('Dich vu SMS tu choi yeu cau', 502);
    error.providerCode = result.CodeResult ? String(result.CodeResult) : `HTTP_${response.status}`;
    throw error;
  }
  return { provider: 'ESMS', messageId: result.SMSID || null };
};

const guiOtp = async (soDienThoai, maOtp) => {
  if (env.sms.provider === 'NONE') {
    if (env.laProduction) throw new LoiUngDung('Dich vu SMS chua duoc cau hinh', 503);
    return { provider: 'NONE', skipped: true };
  }
  return guiQuaEsms(env.sms.esms, soDienThoai, maOtp);
};

module.exports = { guiOtp, guiQuaEsms };
