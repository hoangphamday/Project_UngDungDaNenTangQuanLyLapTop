# Backend cửa hàng laptop

Backend modular monolith dùng Node.js, Express.js và MySQL 8.0+. API prefix: `/api/v1`.

## Cài đặt

Yêu cầu Node.js 20+ và MySQL 8.0+.

1. Import `../LapTop_Store.sql` vào MySQL. File này xóa/tạo lại database `laptop_store`.
2. Chạy `npm install` trong `BE`.
3. Sao chép `.env.example` thành `.env`, điền database và ba secret dài, khác nhau.
4. Seed bcrypt thật cho admin mẫu (PowerShell):

   ```powershell
   $env:TEST_ADMIN_PASSWORD='Admin123!'; npm run seed:test
   ```

5. Chạy `npm run dev`. Server mặc định ở `http://localhost:3000`; health check ở `/health`.

Password trong SQL chỉ là minh họa, không login được trước khi seed. Tài khoản test là `admin`; mật khẩu do người chạy tự đặt qua biến môi trường và không được log.

## Phase 1

Đã có 9 endpoint `/api/v1/auth`: `register`, `login`, `refresh-token`, `logout`, `logout-all`, `forgot-password`, `verify-otp`, `reset-password`, và `GET me`.

Refresh token chỉ lưu dạng SHA-256 hash và được rotate trong transaction. Mỗi lần login tạo session thiết bị riêng. Middleware kiểm tra token và trạng thái tài khoản trong database.

OTP không được log/lưu rõ. Vì schema chỉ có `ma_otp VARCHAR(10)`, backend lưu HMAC rút gọn. Chưa có nhà cung cấp SMS; để test cục bộ có thể đặt `OTP_EXPOSE_IN_DEVELOPMENT=true`, không bật ở production.

## Request mẫu

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"nguyenvanb","matKhau":"Matkhau123","email":"b@example.com","soDienThoai":"0912345678","hoTen":"Nguyen Van B"}'

curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"dinhDanh":"admin","matKhau":"Admin123!","thietBi":{"deviceId":"expo-device-01","deviceName":"Android"}}'

curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Kiểm tra bằng `npm run check`, `npm test` và `npm run test:integration`. Lệnh integration chỉ đọc schema và yêu cầu MySQL đang chạy.

## Kết nối Expo

Điện thoại thật không dùng `localhost`; đặt base URL thành IP LAN, ví dụ `http://192.168.1.10:3000/api/v1`. Android emulator có thể dùng `http://10.0.2.2:3000/api/v1`.

Phân tích đủ 27 bảng, API, rủi ro và cấu trúc đích nằm trong `PHAN_TICH_CO_SO_DU_LIEU_VA_KE_HOACH_API.md`.
