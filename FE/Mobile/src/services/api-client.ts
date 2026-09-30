import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' && !Device.isDevice ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1');

interface RequestOptions extends RequestInit { token?: string }

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? 'Không thể kết nối máy chủ');
  return body as T;
}
