import { apiRequest } from './api-client';

export interface LoginPayload { dinhDanh: string; matKhau: string; thietBi?: { deviceId?: string; deviceName?: string } }
export interface RegisterPayload { tenDangNhap: string; matKhau: string; email: string; soDienThoai: string; hoTen: string }

export const authService = {
  login: (payload: LoginPayload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: RegisterPayload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (soDienThoai: string) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ soDienThoai }) }),
  verifyOtp: (soDienThoai: string, maOtp: string) => apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ soDienThoai, maOtp }) }),
};
