# LapZone Admin

## Chạy giao diện

```powershell
cd FE/Admin
npm install
npm run dev
```

Backend cần chạy cùng database đã cấu hình trong `BE/.env`. URL API mặc định là `http://localhost:3000/api/v1`; có thể đổi qua `VITE_API_BASE_URL` trong `FE/Admin/.env.local`.

Đăng nhập bằng tài khoản ADMIN hoặc STAFF. Không có mật khẩu mặc định trong giao diện. STAFF không được vào màn hình tài khoản và nhân viên; backend kiểm tra quyền trên từng yêu cầu.

## Nghiệp vụ

- Tổng quan lấy doanh thu từ đơn đã giao, có bộ chọn khoảng ngày cho biểu đồ.
- Laptop, hãng, danh mục, nhà cung cấp, kho, nhân viên: biểu mẫu tương ứng và dữ liệu API thật.
- Đơn hàng: chi tiết sản phẩm, giao nhận, tổng tiền và chỉ những bước chuyển trạng thái backend cho phép.
- Phiếu nhập: tạo/sửa nháp, thêm các dòng hàng, hoàn tất để cộng tồn, hoặc hủy. Phiếu đã hoàn tất không thể sửa.
- Tồn kho: theo dõi số lượng, đã đặt, khả dụng và lọc dưới ngưỡng; không chỉnh tồn trực tiếp.
- Khuyến mãi: phạm vi toàn bộ/sản phẩm/danh mục/hãng, thời gian và giới hạn phần trăm.
- Thanh toán chỉ phục vụ tra cứu; cập nhật theo webhook hoặc khi giao hàng COD.
- Đánh giá có duyệt/ẩn; thông báo hỗ trợ đánh dấu đã đọc.
- Tìm kiếm, lọc và xuất CSV áp dụng trên danh sách được tải; phân trang giao diện 10 dòng. Danh sách lớn hiện tải lần lượt các trang API 100 dòng trước khi lọc.

Không tự thay thế bằng dữ liệu mẫu khi API gặp lỗi. Các API đọc bổ sung nằm trong `BE/src/routes/admin-console.routes.js` và được bảo vệ bằng quyền quản trị/nhân viên.

## Kiểm tra

```powershell
cd FE/Admin
npm run build
npm run lint
cd ../../BE
npm run check
npm test
```

Các thao tác ghi đã được kiểm tra trên trình duyệt với API giả lập, không ghi dữ liệu thử vào database người dùng. Truy vấn đọc nghiệp vụ được kiểm tra trên database local.
