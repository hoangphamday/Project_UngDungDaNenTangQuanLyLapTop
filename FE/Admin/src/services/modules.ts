export interface Field {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  source?: string;
  options?: string[];
  createOnly?: boolean;
}
export interface Module {
  title: string;
  description: string;
  endpoint: string;
  write?: string;
  fields?: Field[];
  columns: { key: string; label: string; money?: boolean }[];
  statuses?: string[];
  booleanStatus?: boolean;
  admin?: boolean;
  detail?: boolean;
}
const f = (
  key: string,
  label: string,
  type = "text",
  required = false,
  source?: string,
): Field => ({ key, label, type, required, source });
const c = (key: string, label: string, money = false) => ({
  key,
  label,
  money,
});
export const modules: Record<string, Module> = {
  "/bien-the": {
    title: "Biến thể laptop",
    description: "Mỗi SKU là một cấu hình màu sắc, RAM và SSD với giá và tồn kho riêng. Nhập hàng qua phiếu nhập để tăng tồn kho.",
    endpoint: "/admin/variants",
    write: "/admin/variants",
    statuses: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"],
    columns: [c("ten_san_pham", "Laptop"), c("ma_sku", "SKU"), c("mau_sac", "Màu sắc"), c("ram_gb", "RAM (GB)"), c("ssd_gb", "SSD (GB)"), c("gia_ban", "Giá bán", true), c("gia_khuyen_mai", "Giá khuyến mãi", true), c("tonKho", "Khả dụng"), c("trang_thai", "Trạng thái")],
    fields: [
      {...f("laptopId", "Laptop", "select", true, "laptops"), createOnly: true},
      f("maSku", "Mã SKU", "text", true), f("mauSac", "Màu sắc", "text", true),
      f("ramGb", "RAM (GB)", "number", true), f("ssdGb", "SSD (GB)", "number", true),
      f("giaNhap", "Giá nhập (đ)", "number", true), f("giaBan", "Giá bán (đ)", "number", true),
      f("giaKhuyenMai", "Giá khuyến mãi (đ)", "number"), f("anhDaiDien", "URL ảnh biến thể", "url"),
    ],
  },
  "/san-pham": {
    title: "Laptop",
    description:
      "Quản lý danh mục sản phẩm, cấu hình, giá bán và trạng thái kinh doanh.",
    endpoint: "/admin/laptops",
    write: "/admin/laptops",
    statuses: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"],
    columns: [
      c("ma_san_pham", "Mã sản phẩm"),
      c("ten_san_pham", "Sản phẩm"),
      c("cpu", "Bộ xử lý"),
      c("ram_gb", "RAM (GB)"),
      c("gia_ban", "Giá bán", true),
      c("trang_thai", "Trạng thái"),
    ],
    fields: [
      {...f("mauSac", "Màu biến thể mặc định", "text", true), createOnly: true},
      f("maSanPham", "Mã sản phẩm", "text", true),
      f("tenSanPham", "Tên sản phẩm", "text", true),
      f("hangLaptopId", "Hãng", "select", true, "brands"),
      f("danhMucId", "Danh mục", "select", true, "categories"),
      {...f("giaNhap", "Giá nhập (đ)", "number", true), createOnly: true},
      {...f("giaBan", "Giá bán (đ)", "number", true), createOnly: true},
      {...f("giaKhuyenMai", "Giá khuyến mãi (đ)", "number"), createOnly: true},
      f("baoHanhThang", "Bảo hành (tháng)", "number"),
      f("cpu", "CPU"),
      f("gpu", "GPU"),
      {...f("ramGb", "RAM mặc định (GB)", "number", true), createOnly: true},
      {...f("ssdGb", "SSD mặc định (GB)", "number", true), createOnly: true},
      f("manHinhInch", "Màn hình (inch)", "number"),
      f("tanSoQuetHz", "Tần số quét (Hz)", "number"),
      f("slug", "Đường dẫn sản phẩm"),
      f("anhDaiDien", "URL ảnh đại diện", "url"),
      f("moTa", "Mô tả", "textarea"),
    ],
  },
  "/don-hang": {
    title: "Đơn hàng",
    description: "Theo dõi đơn hàng và xử lý theo từng bước giao nhận.",
    endpoint: "/admin/orders",
    write: "/admin/orders",
    detail: true,
    columns: [
      c("ma_don_hang", "Mã đơn"),
      c("nguoi_nhan", "Người nhận"),
      c("so_dien_thoai", "Điện thoại"),
      c("tong_thanh_toan", "Tổng thanh toán", true),
      c("trang_thai", "Trạng thái"),
      c("ngay_dat", "Ngày đặt"),
    ],
  },
  "/thanh-toan": {
    title: "Thanh toán",
    description:
      "Đối soát giao dịch. Trạng thái được cập nhật bởi cổng thanh toán hoặc khi giao đơn COD.",
    endpoint: "/admin/payments",
    columns: [
      c("id", "Mã giao dịch"),
      c("don_hang_id", "Đơn hàng"),
      c("phuong_thuc", "Phương thức"),
      c("so_tien", "Số tiền", true),
      c("trang_thai", "Trạng thái"),
      c("ma_giao_dich", "Mã đối soát"),
    ],
  },
  "/danh-gia": {
    title: "Đánh giá",
    description: "Kiểm duyệt nội dung đánh giá từ khách hàng đã mua sản phẩm.",
    endpoint: "/admin/reviews",
    write: "/admin/reviews",
    statuses: ["PENDING", "APPROVED", "HIDDEN"],
    columns: [
      c("id", "ID"),
      c("laptop_id", "Laptop"),
      c("khach_hang_id", "Khách hàng"),
      c("so_sao", "Số sao"),
      c("noi_dung", "Nội dung"),
      c("trang_thai", "Trạng thái"),
    ],
  },
  "/danh-muc": {
    title: "Danh mục",
    description: "Tổ chức sản phẩm theo nhu cầu sử dụng và danh mục cha.",
    endpoint: "/admin/categories",
    write: "/categories",
    booleanStatus: true,
    statuses: ["true", "false"],
    columns: [
      c("id", "ID"),
      c("ten_danh_muc", "Tên danh mục"),
      c("parent_id", "Danh mục cha"),
      c("thu_tu", "Thứ tự"),
      c("trang_thai", "Trạng thái"),
    ],
    fields: [
      f("tenDanhMuc", "Tên danh mục", "text", true),
      f("parentId", "Danh mục cha", "select", false, "categories"),
      f("thuTu", "Thứ tự", "number"),
      f("moTa", "Mô tả", "textarea"),
    ],
  },
  "/hang-laptop": {
    title: "Hãng laptop",
    description: "Quản lý thương hiệu và thông tin hiển thị trong danh mục.",
    endpoint: "/admin/brands",
    write: "/brands",
    booleanStatus: true,
    statuses: ["true", "false"],
    columns: [
      c("id", "ID"),
      c("ten_hang", "Tên hãng"),
      c("mo_ta", "Mô tả"),
      c("trang_thai", "Trạng thái"),
    ],
    fields: [
      f("tenHang", "Tên hãng", "text", true),
      f("logoUrl", "URL logo", "url"),
      f("moTa", "Mô tả", "textarea"),
    ],
  },
  "/kho-hang": {
    title: "Tồn kho",
    description:
      "Khả dụng = số lượng trong kho − số lượng đã đặt. Nhập hàng qua phiếu nhập để tăng tồn kho.",
    endpoint: "/admin/inventory",
    columns: [
      c("ma_sku", "SKU"), c("mau_sac", "Màu"), c("ram_gb", "RAM (GB)"), c("ssd_gb", "SSD (GB)"),
      c("maSanPham", "Mã sản phẩm"),
      c("tenSanPham", "Sản phẩm"),
      c("tenKho", "Kho"),
      c("so_luong", "Tổng tồn"),
      c("so_luong_da_dat", "Đã đặt"),
      c("khaDung", "Khả dụng"),
      c("muc_ton_toi_thieu", "Tồn tối thiểu"),
    ],
  },
  "/danh-sach-kho": {
    title: "Kho hàng",
    description: "Quản lý các địa điểm lưu trữ và tiếp nhận hàng hóa.",
    endpoint: "/admin/warehouses",
    write: "/admin/warehouses",
    columns: [
      c("ma_kho", "Mã kho"),
      c("ten_kho", "Tên kho"),
      c("dia_chi", "Địa chỉ"),
      c("so_dien_thoai", "Điện thoại"),
    ],
    fields: [
      f("maKho", "Mã kho", "text", true),
      f("tenKho", "Tên kho", "text", true),
      f("diaChi", "Địa chỉ"),
      f("soDienThoai", "Điện thoại", "tel"),
    ],
  },
  "/phieu-nhap": {
    title: "Phiếu nhập",
    description:
      "Lập phiếu nháp, kiểm tra hàng nhận và hoàn tất để cộng số lượng vào kho.",
    endpoint: "/admin/import-receipts",
    write: "/admin/import-receipts",
    detail: true,
    columns: [
      c("ma_phieu", "Mã phiếu"),
      c("nha_cung_cap_id", "Nhà cung cấp"),
      c("kho_id", "Kho nhận"),
      c("tong_tien", "Tổng tiền", true),
      c("trang_thai", "Trạng thái"),
    ],
    fields: [
      f("nhaCungCapId", "Nhà cung cấp", "select", true, "suppliers"),
      f("khoId", "Kho nhận", "select", true, "warehouses"),
      f("ghiChu", "Ghi chú", "textarea"),
    ],
  },
  "/nha-cung-cap": {
    title: "Nhà cung cấp",
    description: "Thông tin đối tác, người liên hệ và trạng thái hợp tác.",
    endpoint: "/admin/suppliers",
    write: "/admin/suppliers",
    booleanStatus: true,
    statuses: ["true", "false"],
    columns: [
      c("ma_ncc", "Mã NCC"),
      c("ten_ncc", "Nhà cung cấp"),
      c("nguoi_lien_he", "Liên hệ"),
      c("so_dien_thoai", "Điện thoại"),
      c("trang_thai", "Trạng thái"),
    ],
    fields: [
      f("maNcc", "Mã nhà cung cấp", "text", true),
      f("tenNcc", "Tên nhà cung cấp", "text", true),
      f("nguoiLienHe", "Người liên hệ"),
      f("soDienThoai", "Điện thoại", "tel"),
      f("email", "Email", "email"),
      f("diaChi", "Địa chỉ"),
    ],
  },
  "/khuyen-mai": {
    title: "Khuyến mãi",
    description: "Thiết lập phạm vi, điều kiện và thời gian áp dụng mã ưu đãi.",
    endpoint: "/admin/promotions",
    write: "/admin/promotions",
    detail: true,
    statuses: ["ACTIVE", "INACTIVE", "EXPIRED"],
    columns: [
      c("ma_khuyen_mai", "Mã ưu đãi"),
      c("ten_khuyen_mai", "Chương trình"),
      c("pham_vi_ap_dung", "Phạm vi"),
      c("gia_tri_giam", "Giá trị giảm"),
      c("ngay_ket_thuc", "Kết thúc"),
      c("trang_thai", "Trạng thái"),
    ],
    fields: [
      f("maKhuyenMai", "Mã khuyến mãi", "text", true),
      f("tenKhuyenMai", "Tên chương trình", "text", true),
      {
        ...f("phamViApDung", "Phạm vi", "select", true),
        options: ["ALL", "PRODUCT", "CATEGORY", "BRAND"],
      },
      {
        ...f("loaiGiam", "Loại giảm", "select", true),
        options: ["PERCENT", "FIXED"],
      },
      f("giaTriGiam", "Giá trị giảm", "number", true),
      f("donHangToiThieu", "Đơn tối thiểu (đ)", "number"),
      f("giamToiDa", "Giảm tối đa (đ)", "number"),
      f("soLuong", "Số lượt sử dụng", "number"),
      f("ngayBatDau", "Bắt đầu", "datetime-local", true),
      f("ngayKetThuc", "Kết thúc", "datetime-local", true),
      f("danhMucId", "Danh mục áp dụng", "select", false, "categories"),
      f("hangLaptopId", "Hãng áp dụng", "select", false, "brands"),
    ],
  },
  "/khach-hang": {
    title: "Khách hàng",
    description: "Tra cứu thông tin liên hệ và điểm tích lũy của khách hàng.",
    endpoint: "/admin/customers",
    columns: [
      c("ho_ten", "Khách hàng"),
      c("email", "Email"),
      c("so_dien_thoai", "Điện thoại"),
      c("diem_tich_luy", "Điểm tích lũy"),
      c("trang_thai", "Trạng thái"),
    ],
  },
  "/nhan-vien": {
    title: "Nhân viên",
    description: "Quản lý hồ sơ nhân viên và tài khoản truy cập hệ thống.",
    endpoint: "/admin/staff",
    write: "/admin/staff",
    admin: true,
    detail: true,
    statuses: ["ACTIVE", "INACTIVE"],
    columns: [
      c("ma_nhan_vien", "Mã nhân viên"),
      c("ho_ten", "Họ tên"),
      c("chuc_vu", "Chức vụ"),
      c("trang_thai", "Trạng thái"),
    ],
    fields: [
      { ...f("tenDangNhap", "Tên đăng nhập", "text", true), createOnly: true },
      {
        ...f(
          "matKhau",
          "Mật khẩu (8 ký tự, chữ hoa, thường và số)",
          "password",
          true,
        ),
        createOnly: true,
      },
      { ...f("maNhanVien", "Mã nhân viên", "text", true), createOnly: true },
      f("hoTen", "Họ tên", "text", true),
      f("email", "Email", "email", true),
      f("soDienThoai", "Điện thoại", "tel"),
      f("chucVu", "Chức vụ"),
      f("luong", "Lương (đ)", "number"),
      f("ngayVaoLam", "Ngày vào làm", "date"),
    ],
  },
  "/tai-khoan": {
    title: "Tài khoản",
    description:
      "Tra cứu vai trò và kiểm soát trạng thái truy cập. Không thể khóa tài khoản đang sử dụng.",
    endpoint: "/admin/accounts",
    write: "/admin/accounts",
    admin: true,
    statuses: ["ACTIVE", "INACTIVE", "LOCKED"],
    columns: [
      c("ten_dang_nhap", "Tên đăng nhập"),
      c("email", "Email"),
      c("vai_tro", "Vai trò"),
      c("trang_thai", "Trạng thái"),
    ],
  },
  "/thong-bao": {
    title: "Thông báo",
    description: "Thông báo dành cho tài khoản đang đăng nhập.",
    endpoint: "/notifications",
    write: "/notifications",
    columns: [
      c("tieu_de", "Tiêu đề"),
      c("noi_dung", "Nội dung"),
      c("da_doc", "Đã đọc"),
      c("created_at", "Thời gian"),
    ],
  },
};
