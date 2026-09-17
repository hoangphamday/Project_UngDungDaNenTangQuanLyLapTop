# Phân tích cơ sở dữ liệu và kế hoạch API

Tài liệu này đối chiếu trực tiếp với `../LapTop_Store.sql` (MySQL 8.0+, 27 bảng). Không có bảng hay cột giả định nào được thêm vào mã nguồn Phase 1.

## 1. Mapping 27 bảng sang module

| # | Bảng | Module chính | Quan hệ/nghiệp vụ |
|---:|---|---|---|
| 1 | `vai_tro` | xác thực, phân quyền | Role `ADMIN`, `STAFF`, `CUSTOMER` |
| 2 | `tai_khoan` | xác thực, tài khoản | Chủ tài khoản; trạng thái đăng nhập |
| 3 | `refresh_token` | xác thực | Hash token, nhiều thiết bị, thu hồi |
| 4 | `thiet_bi` | thiết bị, Expo push | Token push theo tài khoản |
| 5 | `otp_xac_thuc` | xác thực | OTP theo số điện thoại và mục đích |
| 6 | `khach_hang` | hồ sơ, checkout | Hồ sơ customer, điểm tích lũy |
| 7 | `nhan_vien` | nhân viên, đơn/nhập hàng | Hồ sơ staff và người xử lý |
| 8 | `hang_laptop` | hãng | Hãng của laptop, scope voucher |
| 9 | `danh_muc` | danh mục | Cây cha-con, scope voucher |
| 10 | `laptop` | sản phẩm | Giá, trạng thái, filter, thông số |
| 11 | `hinh_anh_laptop` | ảnh sản phẩm | Nhiều ảnh, ảnh chính, thứ tự |
| 12 | `kho` | kho | Điểm lưu kho |
| 13 | `ton_kho` | tồn kho | `available = so_luong - so_luong_da_dat` |
| 14 | `nha_cung_cap` | nhà cung cấp | Đầu vào phiếu nhập |
| 15 | `phieu_nhap` | nhập hàng | Luồng DRAFT/COMPLETED/CANCELLED |
| 16 | `chi_tiet_phieu_nhap` | nhập hàng | Dòng hàng và thành tiền generated |
| 17 | `dia_chi` | địa chỉ | Địa chỉ thuộc khách hàng |
| 18 | `chi_tiet_gio_hang` | giỏ hàng | Giỏ trực tiếp, không có bảng cha |
| 19 | `khuyen_mai` | khuyến mãi | Rule ALL/PRODUCT/CATEGORY/BRAND |
| 20 | `chi_tiet_khuyen_mai` | khuyến mãi | Laptop thuộc scope PRODUCT |
| 21 | `don_hang` | đơn hàng | Tổng tiền, trạng thái, nhân viên |
| 22 | `chi_tiet_don_hang` | đơn hàng | Snapshot tên, đơn giá, số lượng |
| 23 | `thanh_toan` | thanh toán | Nhiều lần thử trên một đơn |
| 24 | `danh_gia` | đánh giá | Gắn customer/laptop/order |
| 25 | `san_pham_yeu_thich` | yêu thích | Unique customer-laptop |
| 26 | `banner_quang_cao` | banner | Loại, lịch hiệu lực, thứ tự |
| 27 | `thong_bao` | thông báo | In-app notification theo tài khoản |

## 2. Ma trận REST API dự kiến

Mọi đường dẫn có prefix `/api/v1`. “Đã đăng nhập” chấp nhận mọi role đang ACTIVE.

| Nhóm | Endpoint | Role |
|---|---|---|
| Xác thực | `POST /auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/logout`, `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password` | Công khai |
| Xác thực | `POST /auth/logout-all`, `GET /auth/me` | Đã đăng nhập |
| Thiết bị | `POST /devices`, `GET /devices`, `DELETE /devices/:id` | Đã đăng nhập |
| Hồ sơ | `GET /profile`, `PUT /profile`, `PUT /profile/avatar` | Customer |
| Địa chỉ | `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `DELETE /addresses/:id`, `PATCH /addresses/:id/default` | Customer |
| Laptop | `GET /laptops`, `GET /laptops/:id`, `GET /laptops/slug/:slug` | Công khai |
| Hãng | `GET /brands`, `GET /brands/:id` | Công khai |
| Hãng | `POST /brands`, `PUT /brands/:id`, `PATCH /brands/:id/status` | Admin, Staff |
| Danh mục | `GET /categories`, `GET /categories/tree`, `GET /categories/:id` | Công khai |
| Danh mục | `POST /categories`, `PUT /categories/:id`, `PATCH /categories/:id/status` | Admin, Staff |
| Laptop quản trị | `POST /admin/laptops`, `PUT /admin/laptops/:id`, `PATCH /admin/laptops/:id/status`, `POST /admin/laptops/:id/images`, `DELETE /admin/laptops/:id/images/:imageId` | Admin, Staff |
| Yêu thích | `GET /wishlist`, `POST /wishlist/:laptopId`, `DELETE /wishlist/:laptopId` | Customer |
| Giỏ hàng | `GET /cart`, `POST /cart/items`, `PUT /cart/items/:laptopId`, `DELETE /cart/items/:laptopId`, `DELETE /cart` | Customer |
| Khuyến mãi | `GET /promotions/available`, `POST /promotions/validate` | Customer |
| Khuyến mãi quản trị | `GET /admin/promotions`, `POST /admin/promotions`, `PUT /admin/promotions/:id`, `PATCH /admin/promotions/:id/status` | Admin, Staff |
| Đơn hàng | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel` | Customer |
| Đơn quản trị | `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status` | Admin, Staff |
| Kho | `GET /admin/warehouses`, `POST /admin/warehouses`, `PUT /admin/warehouses/:id`, `GET /admin/inventory`, `GET /admin/inventory/:laptopId`, `GET /admin/inventory/low-stock` | Admin, Staff |
| Nhà cung cấp | `GET /admin/suppliers`, `GET /admin/suppliers/:id`, `POST /admin/suppliers`, `PUT /admin/suppliers/:id`, `PATCH /admin/suppliers/:id/status` | Admin, Staff |
| Phiếu nhập | `GET /admin/import-receipts`, `GET /admin/import-receipts/:id`, `POST /admin/import-receipts`, `PUT /admin/import-receipts/:id`, `POST /admin/import-receipts/:id/complete`, `POST /admin/import-receipts/:id/cancel` | Admin, Staff |
| Thanh toán | `GET /orders/:orderId/payments`, `POST /orders/:orderId/payments/retry` | Customer sở hữu đơn |
| Thanh toán | `GET /admin/payments` | Admin, Staff |
| Webhook | `POST /payments/:provider/webhook` | Provider, xác minh chữ ký |
| Đánh giá | `GET /laptops/:id/reviews` | Công khai |
| Đánh giá | `POST /laptops/:id/reviews`, `PUT /reviews/:id`, `DELETE /reviews/:id` | Customer sở hữu |
| Đánh giá quản trị | `PATCH /admin/reviews/:id/status` | Admin, Staff |
| Banner | `GET /banners` | Công khai |
| Banner quản trị | `GET /admin/banners`, `POST /admin/banners`, `PUT /admin/banners/:id`, `DELETE /admin/banners/:id`, `PATCH /admin/banners/:id/status` | Admin, Staff |
| Thông báo | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` | Đã đăng nhập, chỉ dữ liệu sở hữu |
| Tài khoản | `GET /admin/accounts`, `GET /admin/accounts/:id`, `PATCH /admin/accounts/:id/status` | Admin |
| Nhân viên | `GET /admin/staff`, `GET /admin/staff/:id`, `POST /admin/staff`, `PUT /admin/staff/:id`, `PATCH /admin/staff/:id/status` | Admin |
| Dashboard | `GET /admin/dashboard`, `GET /admin/statistics/revenue`, `GET /admin/statistics/products`, `GET /admin/statistics/orders`, `GET /admin/statistics/inventory` | Admin, Staff |

## 3. Rủi ro nghiệp vụ và quyết định thiết kế

### Checkout và tồn kho

- Khóa các dòng `ton_kho` theo thứ tự ổn định bằng `SELECT ... FOR UPDATE` trong cùng transaction; sau khóa mới tính khả dụng.
- Một laptop có thể ở nhiều kho. Cần rule phân bổ (đề xuất kho ACTIVE, ưu tiên `kho.id` tăng dần), tăng `so_luong_da_dat` đúng từng dòng.
- Chi tiết đơn không lưu kho đã reserve. Khi hủy, không biết hoàn reserve về kho nào nếu có nhiều kho. Cần migration bảng phân bổ tồn kho theo dòng đơn trước Phase 4.
- `don_hang.dia_chi_id` không snapshot địa chỉ. Nếu khách sửa địa chỉ, lịch sử đổi theo; nên thêm snapshot địa chỉ của đơn.
- Chi tiết đơn không có giá nhập/discount theo dòng; báo cáo lợi nhuận và phân bổ giảm giá bị hạn chế.

### Voucher

- Khóa `khuyen_mai` trước kiểm tra/tăng `so_luong_da_dung` để không vượt số lượng.
- `so_luong = 0` chưa rõ là hết hay không giới hạn; cần thống nhất rule trước Phase 4.
- Chưa có lịch sử customer dùng voucher, nên chưa hỗ trợ “mỗi khách một lần” và hoàn chính xác. Đề xuất bảng lịch sử riêng.
- CATEGORY/BRAND chỉ giảm trên các dòng đủ điều kiện, không phải toàn đơn.

### Thanh toán

- `ma_giao_dich` unique chống trùng một phần, nhưng thiếu bảng event webhook/provider event id và payload hash để audit/idempotency chắc chắn.
- Thiếu trạng thái `CANCELLED` và expiry/provider cho lần thanh toán; cần rule đóng các lần PENDING cũ.
- Không nhận trạng thái từ frontend. Webhook phải xác minh chữ ký, khóa payment/order và xử lý một lần.
- COD nên `PENDING` khi tạo và `PAID` lúc giao thành công.

### Trạng thái đơn

- Luồng chính: `PENDING -> CONFIRMED -> PROCESSING -> SHIPPING -> DELIVERED`; `RETURNED` chỉ từ `DELIVERED`.
- Thiếu bảng lịch sử trạng thái để audit ai đổi gì; khuyến nghị migration riêng.
- Đề xuất `ngay_giao` khi sang SHIPPING, `ngay_hoan_thanh` khi DELIVERED.
- Cộng điểm khi DELIVERED phải idempotent. Schema thiếu ledger/cờ unique theo đơn nên cần migration giao dịch điểm.

### Giới hạn khác

- `ma_otp VARCHAR(10)` không chứa bcrypt/Argon2. Phase 1 lưu HMAC-SHA256 rút gọn 10 ký tự; khuyến nghị đổi `VARCHAR(255)` và thêm `verified_at`.
- `thiet_bi` thiếu unique `(tai_khoan_id, device_id)`; database chưa đảm bảo upsert theo thiết bị.
- `danh_gia` thiếu unique customer-laptop/order và CHECK sao từ 1 đến 5.
- Seed có password giả `$2b$10$demo...`; chạy script seed Phase 1 trước khi login.

## 4. Cấu trúc backend cuối cùng

```text
BE/
├── src/
│   ├── config/          # env, MySQL pool
│   ├── constants/       # vai trò, trạng thái, rule
│   ├── controllers/     # nhận/trả HTTP
│   ├── services/        # nghiệp vụ và transaction
│   ├── repositories/    # SQL tham số hóa
│   ├── routes/          # endpoint theo module
│   ├── middlewares/     # xác thực, phân quyền, lỗi, upload
│   ├── validators/      # validate request
│   ├── utils/           # response, token, lỗi, logger
│   ├── jobs/            # tác vụ nền khi thực sự cần
│   ├── app.js
│   └── server.js
├── scripts/
├── tests/
├── uploads/
├── .env.example
├── package.json
└── README.md
```

Tên file nghiệp vụ dùng tiếng Việt không dấu và kebab-case để ổn định trên Windows/Linux. Các file khung quy ước `app.js`, `server.js`, `database.js`, `env.js` được giữ theo yêu cầu.
