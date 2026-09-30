import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Pencil,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";
import { Modal } from "../components/common/Modal";
import { EntityForm } from "../components/common/EntityForm";
import { modules } from "../services/modules";
import {
  display,
  errorMessage,
  exportCsv,
  list,
  read,
  transitions,
} from "../services/console";
import type { RecordData } from "../services/console";
import { apiClient } from "../api/client";
import { useAuth } from "../services/auth";
import { formatCurrency } from "../utils/formatters";
export function ManagementPage() {
  const { pathname, search } = useLocation();
  const config = modules[pathname];
  const { user } = useAuth();
  const [rows, setRows] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [form, setForm] = useState(false);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const allowed = !config?.admin || user?.vaiTro === "ADMIN";
  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setError("");
    try {
      setRows(await list(config.endpoint + (pathname === "/bien-the" ? search : "")));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [config, allowed, pathname, search]);
  useEffect(() => {
    void load();
  }, [load]);
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!filter ||
            (filter === "LOW"
              ? Number(r.khaDung) <= Number(r.muc_ton_toi_thieu)
              : String(
                  config.booleanStatus ? Boolean(r.trang_thai) : r.trang_thai,
                ) === filter)) &&
          config.columns.some((c) =>
            display(r[c.key])
              .toLocaleLowerCase("vi")
              .includes(query.toLocaleLowerCase("vi")),
          ),
      ),
    [rows, filter, query, config],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  if (!config) return null;
  if (!allowed)
    return (
      <div className="empty-state">
        <h2>Không có quyền truy cập</h2>
        <p>Chức năng này chỉ dành cho quản trị viên.</p>
        <Link className="button button-primary" to="/">
          Về tổng quan
        </Link>
      </div>
    );
  const statuses = config.statuses || [
    ...new Set(rows.map((r) => String(r.trang_thai || "")).filter(Boolean)),
  ];
  const canEdit = (r: RecordData) =>
    !!config.fields && (pathname !== "/phieu-nhap" || r.trang_thai === "DRAFT");
  async function detail(row: RecordData) {
    setBusy(true);
    setError("");
    try {
      setSelected(
        config.detail
          ? await read<RecordData>(config.endpoint + "/" + row.id)
          : row,
      );
      setPending(null);
      setNote("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function action() {
    if (!selected || !pending) return;
    setBusy(true);
    setError("");
    try {
      const receipt = pathname === "/phieu-nhap";
      await apiClient.request({
        url:
          config.write +
          "/" +
          selected.id +
          (receipt
            ? "/" + pending
            : pathname === "/thong-bao"
              ? "/read"
              : "/status"),
        method: receipt ? "post" : "patch",
        data: receipt
          ? {}
          : {
              trangThai: config.booleanStatus ? pending === "true" : pending,
              ghiChu: note,
            },
      });
      setSelected(null);
      setPending(null);
      setNotice("Đã cập nhật thành công.");
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function render(key: string, value: unknown, money = false) {
    if (key === "trang_thai") {
      const v = config.booleanStatus ? String(Boolean(value)) : String(value);
      return (
        <span
          className={
            "badge badge-" +
            ([
              "ACTIVE",
              "DELIVERED",
              "COMPLETED",
              "PAID",
              "APPROVED",
              "true",
            ].includes(v)
              ? "success"
              : [
                    "CANCELLED",
                    "FAILED",
                    "LOCKED",
                    "OUT_OF_STOCK",
                    "false",
                  ].includes(v)
                ? "danger"
                : ["PENDING", "DRAFT", "PROCESSING"].includes(v)
                  ? "warning"
                  : "info")
          }
        >
          {display(v)}
        </span>
      );
    }
    if (key === "da_doc") return value ? "Đã đọc" : "Chưa đọc";
    if (money)
      return (
        <strong className="money">{formatCurrency(Number(value || 0))}</strong>
      );
    if ((key.endsWith("_at") || key.startsWith("ngay_")) && value)
      return new Date(String(value)).toLocaleString("vi-VN");
    return display(value);
  }
  const next = selected
    ? pathname === "/don-hang"
      ? transitions[String(selected.trang_thai)] || []
      : pathname === "/phieu-nhap"
        ? selected.trang_thai === "DRAFT"
          ? ["complete", "cancel"]
          : []
        : pathname === "/thong-bao"
          ? !selected.da_doc
            ? ["read"]
            : []
          : config.statuses?.filter(
              (s) =>
                s !==
                String(
                  config.booleanStatus
                    ? Boolean(selected.trang_thai)
                    : selected.trang_thai,
                ),
            ) || []
    : [];
  const actionLabel = (s: string) =>
    s === "complete"
      ? "Hoàn tất nhập kho"
      : s === "cancel"
        ? "Hủy phiếu"
        : s === "read"
          ? "Đánh dấu đã đọc"
          : display(s);
  return (
    <>
      <PageHeader
        eyebrow="QUẢN LÝ VẬN HÀNH"
        title={config.title}
        description={config.description}
        action={
          config.fields
            ? "Thêm " + config.title.toLocaleLowerCase("vi")
            : undefined
        }
        onAction={() => {
          setEditing(null);
          setForm(true);
        }}
      />
      {notice && (
        <div className="success-banner" role="status">
          {notice}
          <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => void load()}>Thử lại</button>
        </div>
      )}
      <section className="panel management-panel">
        <div className="module-tabs">
          <strong>
            {config.title} <span>{loading ? "…" : rows.length}</span>
          </strong>
          <small>Cập nhật từ hệ thống</small>
        </div>
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={18} />
            <input
              aria-label="Tìm kiếm"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo thông tin trong bảng…"
            />
          </label>
          <div className="toolbar-actions">
            {(statuses.length > 0 || pathname === "/kho-hang") && (
              <select
                className="select-control"
                aria-label="Lọc trạng thái"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                {pathname === "/kho-hang" ? (
                  <option value="LOW">Dưới mức tồn tối thiểu</option>
                ) : (
                  statuses.map((s) => (
                    <option key={s} value={s}>
                      {display(s)}
                    </option>
                  ))
                )}
              </select>
            )}
            <button
              className="icon-button"
              aria-label="Tải lại"
              disabled={loading}
              onClick={() => void load()}
            >
              <RefreshCw size={17} />
            </button>
            <button
              className="button button-secondary"
              disabled={loading || !!error || !filtered.length}
              onClick={() => exportCsv(config.title, config.columns, filtered)}
            >
              <Download size={16} />
              Xuất CSV
            </button>
          </div>
        </div>
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <h3>Đang tải {config.title.toLocaleLowerCase("vi")}…</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Chưa thể tải dữ liệu</h3>
            <p>Vui lòng thử lại sau khi kết nối máy chủ.</p>
          </div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <Search size={30} />
            <h3>
              {rows.length ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}
            </h3>
            <p>
              {rows.length
                ? "Thử từ khóa khác hoặc bỏ bộ lọc."
                : "Dữ liệu sẽ hiển thị tại đây khi được tạo trong hệ thống."}
            </p>
            {rows.length > 0 && (
              <button
                className="button button-secondary"
                onClick={() => {
                  setQuery("");
                  setFilter("");
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {config.columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    {config.columns.map((c) => (
                      <td key={c.key} title={display(r[c.key])}>
                        {render(c.key, r[c.key], c.money)}
                      </td>
                    ))}
                    <td>
                      <div className="row-actions">
                        {pathname === "/san-pham" && <Link className="table-action" to={`/bien-the?laptopId=${r.id}`}>Biến thể</Link>}
                        <button
                          className="table-action"
                          disabled={busy}
                          aria-label={"Xem bản ghi " + r.id}
                          onClick={() => void detail(r)}
                        >
                          <Eye size={17} />
                        </button>
                        {canEdit(r) && (
                          <button
                            className="table-action"
                            aria-label={"Sửa bản ghi " + r.id}
                            onClick={() => {
                              setEditing(r);
                              setForm(true);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <p>
            {filtered.length
              ? (currentPage - 1) * 10 +
                1 +
                "–" +
                Math.min(currentPage * 10, filtered.length)
              : 0}{" "}
            / <strong>{filtered.length}</strong> bản ghi
          </p>
          <div>
            <button
              aria-label="Trang trước"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Trang {currentPage} / {pages}
            </span>
            <button
              aria-label="Trang sau"
              disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      {pathname === "/kho-hang" && (
        <div className="context-links">
          <Link to="/phieu-nhap">Lập phiếu nhập hàng →</Link>
          <Link to="/danh-sach-kho">Quản lý các kho →</Link>
        </div>
      )}
      {form && (
        <EntityForm
          config={config}
          record={editing}
          onClose={() => setForm(false)}
          onSaved={() => {
            setForm(false);
            setNotice("Đã lưu thông tin thành công.");
            void load();
          }}
        />
      )}
      {selected && (
        <Modal
          title={"Chi tiết · " + config.title}
          description={"Mã tham chiếu #" + selected.id}
          onClose={() => {
            if (!busy) setSelected(null);
          }}
          footer={
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Đóng
            </button>
          }
        >
          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}
          <div className="detail-grid">
            {config.columns.map((c) => (
              <div key={c.key}>
                <span>{c.label}</span>
                <strong>{render(c.key, selected[c.key], c.money)}</strong>
              </div>
            ))}
          </div>
          {pathname === "/don-hang" && (
            <div className="order-context">
              <h3>Thông tin giao nhận</h3>
              <p>
                {selected.phuong_thuc_nhan === "PICKUP"
                  ? "Nhận tại cửa hàng"
                  : [
                      selected.dia_chi_chi_tiet,
                      selected.phuong_xa,
                      selected.quan_huyen,
                      selected.tinh_thanh,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Chưa có thông tin địa chỉ"}
              </p>
              <p>Ghi chú khách hàng: {display(selected.ghi_chu_khach_hang)}</p>
              <p>Ghi chú xử lý: {display(selected.ghi_chu_nhan_vien)}</p>
              <div className="detail-grid">
                <div>
                  <span>Tiền hàng</span>
                  <strong>
                    {formatCurrency(Number(selected.tong_tien_hang || 0))}
                  </strong>
                </div>
                <div>
                  <span>Phí vận chuyển</span>
                  <strong>
                    {formatCurrency(Number(selected.phi_van_chuyen || 0))}
                  </strong>
                </div>
                <div>
                  <span>Giảm giá</span>
                  <strong>
                    {formatCurrency(Number(selected.tien_giam || 0))}
                  </strong>
                </div>
                <div>
                  <span>Phải thanh toán</span>
                  <strong>
                    {formatCurrency(Number(selected.tong_thanh_toan || 0))}
                  </strong>
                </div>
              </div>
            </div>
          )}
          {Array.isArray(selected.items) && (
            <div className="detail-items">
              <h3>Chi tiết sản phẩm</h3>
              {(selected.items as RecordData[]).map((i, index) => (
                <div key={index}>
                  <strong>
                    {String(
                      i.ten_san_pham ||
                        i.tenSanPham ||
                        "Laptop #" + i.laptop_id,
                    )}
                  </strong>
                  <span>
                    {(() => { const raw = i.cau_hinh; const config = typeof raw === "string" ? JSON.parse(raw) : raw as Record<string, unknown> | undefined; return config ? `${config.maSku} · ${config.mauSac} / ${config.ramGb}GB / ${config.ssdGb}GB · ` : i.ma_sku ? `${i.ma_sku} · ${i.mau_sac} / ${i.ram_gb}GB / ${i.ssd_gb}GB · ` : ""; })()}
                    {String(i.so_luong || i.soLuong)} ×{" "}
                    {formatCurrency(Number(i.don_gia || i.donGia || 0))}
                  </span>
                </div>
              ))}
            </div>
          )}
          {next.length > 0 && (
            <div className="workflow">
              <h3>
                {pathname === "/don-hang"
                  ? "Chuyển trạng thái đơn hàng"
                  : "Thao tác"}
              </h3>
              <div className="workflow-actions">
                {next.map((s) => (
                  <button
                    key={s}
                    className={
                      "button " +
                      (pending === s ? "button-primary" : "button-secondary")
                    }
                    disabled={
                      busy ||
                      (pathname === "/tai-khoan" &&
                        String(selected.id) === String(user?.id) &&
                        s !== "ACTIVE")
                    }
                    onClick={() => setPending(s)}
                  >
                    {actionLabel(s)}
                  </button>
                ))}
              </div>
              {pending && (
                <div className="confirm-action">
                  <p>
                    Xác nhận: <strong>{actionLabel(pending)}</strong>?
                  </p>
                  {pending === "complete" && (
                    <p>Số lượng trên phiếu sẽ được cộng vào kho nhận.</p>
                  )}
                  {pathname === "/don-hang" && (
                    <label>
                      Ghi chú xử lý
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                      />
                    </label>
                  )}
                  <button
                    className="button button-primary"
                    disabled={busy}
                    onClick={() => void action()}
                  >
                    {busy ? "Đang xử lý…" : "Xác nhận cập nhật"}
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
