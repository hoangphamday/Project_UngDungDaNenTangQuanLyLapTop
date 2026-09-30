# Biến thể laptop

Database đang dùng: chạy `npm run migrate:variants` trong `BE`. Script sao lưu toàn bộ bảng và dữ liệu vào `BE/backups/before-variants-*.json` trước khi đổi schema. Thư mục này được bỏ qua bởi Git vì chứa dữ liệu tài khoản. Chạy lại script sau khi thành công sẽ không thêm dữ liệu lần nữa.

Database mới: import `Laptop_StoreVer3.sql`. File này có schema biến thể và chuyển cấu hình mẫu thành SKU mặc định. File import toàn bộ sẽ xóa database cũ; không dùng nó để cập nhật database đang có dữ liệu.

Để thử nhiều lựa chọn trên Acer Swift Go 14 của bộ dữ liệu mẫu `SEED26`, chạy `npm run seed:demo-variants` trong `BE`. Lệnh này chỉ tác động laptop mẫu `SEED26-L03`, thêm 7 SKU (Bạc/Xám, RAM 16/32 GB, SSD 512/1024 GB) và phiếu nhập mẫu cho các SKU mới. Có thể chạy lại mà không tạo trùng. Với sản phẩm thật, tạo SKU trong Admin → Biến thể laptop và nhập kho theo số lượng thực tế.

- `bien_the_laptop` chứa màu, RAM, SSD, SKU, giá và trạng thái riêng. Không cho trùng SKU hoặc tổ hợp màu/RAM/SSD trong cùng laptop.
- `ton_kho` duy nhất theo kho và biến thể; giỏ hàng duy nhất theo khách hàng và biến thể.
- Phiếu nhập và đơn hàng giữ `laptop_id` để thống kê theo sản phẩm, đồng thời lưu `bien_the_id` để xử lý đúng tồn kho.
- Đơn hàng lưu `cau_hinh` và `don_gia` tại thời điểm mua. Đơn hàng cũ được bổ sung cấu hình từ dữ liệu laptop hiện tại khi migration; không thể khôi phục cấu hình lịch sử chưa từng được lưu.
- Giá/RAM/SSD trong bảng `laptop` là thông tin tóm tắt của biến thể đang bán có giá thấp nhất. Quản lý giá và cấu hình riêng tại mục **Biến thể laptop**.
- Laptop cũ có một biến thể mặc định. Laptop mới cũng tạo một biến thể mặc định từ cấu hình ban đầu. Các biến thể mới có tồn kho bằng 0 cho đến khi hoàn tất phiếu nhập.

## Admin

Mở **Laptop → Biến thể** của một sản phẩm, hoặc mục **Biến thể laptop** trên thanh bên. Thêm SKU, màu, RAM, SSD và giá. Lập phiếu nhập, chọn đúng SKU và kho, rồi hoàn tất để tăng tồn kho. Chọn một biến thể để sửa giá hoặc ngừng bán; cấu hình đã có nhập kho hoặc đơn hàng không được đổi sang cấu hình khác.

## API

- `GET /api/v1/laptops/:id`: gồm `variants` đang bán với tồn kho khả dụng.
- `GET /api/v1/laptops/:id/variants`: danh sách biến thể đang bán.
- `GET/POST /api/v1/admin/variants`, `PUT /api/v1/admin/variants/:id`, `PATCH /api/v1/admin/variants/:id/status`: dành cho ADMIN/STAFF.
- `POST /api/v1/cart/items`: `{ "laptopId": 1, "bienTheId": 1, "soLuong": 1 }`.
- `PUT/DELETE /api/v1/cart/variants/:bienTheId`: sửa/xóa đúng cấu hình. URL cũ theo laptop chỉ dùng được khi giỏ có một dòng duy nhất cho laptop đó.
- Chi tiết phiếu nhập cần `laptopId`, `bienTheId`, `soLuong`, `donGia`.
- `POST /api/v1/orders`: dùng giỏ trên server, hoặc truyền `items: [{ laptopId, bienTheId, soLuong }]` để mua các dòng được chọn. Server lấy giá từ database và giữ tồn kho trong transaction.
- `POST /api/v1/orders/quote`: báo giá/khuyến mãi của các dòng được chọn bằng cùng dữ liệu giá trên server.

## Mobile

Danh mục và trang chi tiết đọc API thực. Chọn màu → RAM → SSD để thay đổi giá và kiểm tra tồn kho. Hai cấu hình của cùng laptop được giữ thành hai dòng giỏ riêng. Giỏ Mobile nằm trong bộ nhớ của phiên ứng dụng; khi thanh toán, các dòng được chọn được gửi lên API đặt hàng. Đăng nhập bằng tài khoản CUSTOMER để đặt hàng; tài khoản ADMIN dùng trong FE Admin.

`EXPO_PUBLIC_API_URL` mặc định là `http://localhost:5000/api/v1`. Điện thoại thật cần IP LAN của máy chạy backend; Android emulator có thể dùng `http://10.0.2.2:5000/api/v1`.

## Kiểm tra

`npm run test:variants` tạo database tạm có tên `codex_variant_test_<timestamp>`, import file SQL mới, thử CRUD, giỏ nhiều cấu hình, nhập kho, giá, giữ kho, hủy/giao đơn, rollback và đặt hàng đồng thời, rồi xóa database tạm. Database làm việc không nhận các đơn hàng thử.
