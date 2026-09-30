import { apiClient } from '../api/client'

// Lớp tích hợp được chuẩn bị sẵn; chỉ gọi khi backend cung cấp endpoint tương ứng.
export const adminService = {
  get<T>(path: string) { return apiClient.get<T>(path) },
  post<T, B>(path: string, body: B) { return apiClient.post<T>(path, body) },
  patch<T, B>(path: string, body: B) { return apiClient.patch<T>(path, body) },
}
