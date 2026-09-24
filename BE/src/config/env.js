const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const laySoNguyen = (ten, giaTriMacDinh) => {
  const giaTri = Number.parseInt(process.env[ten] || String(giaTriMacDinh), 10);
  if (!Number.isInteger(giaTri) || giaTri <= 0) throw new Error(`${ten} phai la so nguyen duong`);
  return giaTri;
};

const moiTruong = process.env.NODE_ENV || 'development';
const accessSecret = process.env.JWT_ACCESS_SECRET || '';
const refreshSecret = process.env.JWT_REFRESH_SECRET || '';
const otpSecret = process.env.OTP_HASH_SECRET || '';
const smsProvider = (process.env.SMS_PROVIDER || 'NONE').toUpperCase();

if (moiTruong === 'production' && [accessSecret, refreshSecret, otpSecret].some((secret) => secret.length < 32)) {
  throw new Error('Cac JWT/OTP secret trong production phai co it nhat 32 ky tu');
}
if (!['NONE', 'ESMS'].includes(smsProvider)) throw new Error('SMS_PROVIDER chi ho tro NONE hoac ESMS');
if (moiTruong === 'production' && (smsProvider !== 'ESMS'
  || !process.env.ESMS_API_KEY || !process.env.ESMS_SECRET_KEY || !process.env.ESMS_BRANDNAME)) {
  throw new Error('Production phai cau hinh day du SMS_PROVIDER=ESMS va thong tin eSMS');
}

module.exports = Object.freeze({
  port: laySoNguyen('PORT', 3000),
  nodeEnv: moiTruong,
  laProduction: moiTruong === 'production',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: laySoNguyen('DB_PORT', 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'laptop_store',
    connectionLimit: laySoNguyen('DB_CONNECTION_LIMIT', 10),
  },
  jwt: {
    accessSecret: accessSecret || 'development-access-secret-change-me',
    refreshSecret: refreshSecret || 'development-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  otp: {
    secret: otpSecret || 'development-otp-secret-change-me',
    expiresMinutes: laySoNguyen('OTP_EXPIRES_MINUTES', 5),
    maxAttempts: laySoNguyen('OTP_MAX_ATTEMPTS', 5),
    exposeInDevelopment: process.env.OTP_EXPOSE_IN_DEVELOPMENT === 'true',
  },
  sms: {
    provider: smsProvider,
    timeoutMs: laySoNguyen('SMS_TIMEOUT_MS', 10_000),
    esms: {
      url: process.env.ESMS_API_URL || 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/',
      apiKey: process.env.ESMS_API_KEY || '',
      secretKey: process.env.ESMS_SECRET_KEY || '',
      brandname: process.env.ESMS_BRANDNAME || '',
      smsType: process.env.ESMS_SMS_TYPE || '2',
      isUnicode: process.env.ESMS_IS_UNICODE || '0',
      sandbox: process.env.ESMS_SANDBOX === 'true',
      contentTemplate: process.env.ESMS_OTP_CONTENT || '{OTP} la ma xac minh dat lai mat khau Laptop Store cua ban',
    },
  },
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((item) => item.trim()),
  trustProxy: process.env.TRUST_PROXY === 'true',
  expoPushUrl: process.env.EXPO_PUSH_URL || 'https://exp.host/--/api/v2/push/send',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
});
