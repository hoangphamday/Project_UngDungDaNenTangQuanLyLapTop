import { isAxiosError } from "axios";
import { apiClient } from "../api/client";
export type RecordData = Record<string, unknown> & { id: string | number };
export async function read<T>(path: string): Promise<T> {
  return (await apiClient.get<{ data: T }>(path)).data.data;
}
export async function list(path: string): Promise<RecordData[]> {
  const rows: RecordData[] = [];
  for (let page = 1; ; page++) {
    const data = await read<
      RecordData[] | { items: RecordData[]; pagination: { totalPages: number } }
    >(path + (path.includes("?") ? "&" : "?") + "limit=100&page=" + page);
    if (Array.isArray(data)) return data;
    rows.push(...data.items);
    if (page >= data.pagination.totalPages) return rows;
  }
}
export function errorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (!error.response)
      return "Không kết nối được máy chủ. Kiểm tra backend và thử lại.";
    if (error.response.status === 401 && error.config?.url?.split("?")[0].endsWith("/auth/login"))
      return "Tên đăng nhập hoặc mật khẩu không chính xác.";
    if (error.response.status === 401)
      return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
    return (
      error.response.data?.errors
        ?.map(
          (e: { field: string; message: string }) => e.field + ": " + e.message,
        )
        .join(" · ") ||
      error.response.data?.message ||
      "Không thể thực hiện yêu cầu."
    );
  }
  return error instanceof Error ? error.message : "Có lỗi xảy ra.";
}
export const labels: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  OUT_OF_STOCK: "Hết hàng",
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang chuẩn bị",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  RETURNED: "Đã trả hàng",
  DRAFT: "Nháp",
  COMPLETED: "Hoàn tất",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
  APPROVED: "Đã duyệt",
  HIDDEN: "Đã ẩn",
  LOCKED: "Đã khóa",
  EXPIRED: "Hết hạn",
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
  ALL: "Toàn bộ",
  PRODUCT: "Sản phẩm",
  CATEGORY: "Danh mục",
  BRAND: "Hãng",
  PERCENT: "Phần trăm",
  FIXED: "Số tiền",
  true: "Đang hoạt động",
  false: "Ngừng hoạt động",
};
export const display = (value: unknown) =>
  value == null ? "—" : labels[String(value)] || String(value);
export function exportCsv(
  name: string,
  columns: { key: string; label: string }[],
  rows: RecordData[],
) {
  const cell = (value: unknown) =>
    '"' +
    String(value ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replace(/"/g, '""') +
    '"';
  const content = [
    columns.map((c) => cell(c.label)).join(","),
    ...rows.map((r) => columns.map((c) => cell(r[c.key])).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}
export const transitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};
