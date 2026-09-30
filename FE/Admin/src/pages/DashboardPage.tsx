import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { display, errorMessage, read } from "../services/console";
import type { RecordData } from "../services/console";
import { formatCurrency } from "../utils/formatters";
export function DashboardPage() {
  const [data, setData] = useState<{
    summary: Record<string, number>;
    revenue: RecordData[];
    low: RecordData[];
    orders: RecordData[];
    best: RecordData[];
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [days, setDays] = useState("30");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const from = new Date();
    from.setDate(from.getDate() - Number(days));
    from.setHours(0, 0, 0, 0);
    Promise.all([
      read<Record<string, number>>("/admin/dashboard"),
      read<RecordData[]>(
        "/admin/statistics/revenue?from=" +
          encodeURIComponent(from.toISOString()) +
          "&to=" +
          encodeURIComponent(new Date().toISOString()),
      ),
      read<RecordData[]>("/admin/inventory/low-stock"),
      read<{ items: RecordData[] }>("/admin/orders?limit=5&page=1"),
      read<RecordData[]>("/admin/statistics/products"),
    ])
      .then(([summary, revenue, low, orders, best]) => {
        if (active)
          setData({ summary, revenue, low, orders: orders.items, best });
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt, days]);
  const stats = [
    {
      label: "Doanh thu đã giao",
      value: formatCurrency(Number(data?.summary.revenue || 0)),
      icon: Wallet,
      note: "Tổng đơn hàng đã giao",
      tone: "purple",
    },
    {
      label: "Tổng đơn hàng",
      value: data?.summary.orders || 0,
      icon: ShoppingBag,
      note: "Tất cả trạng thái",
      tone: "blue",
    },
    {
      label: "Khách hàng",
      value: data?.summary.customers || 0,
      icon: Users,
      note: "Hồ sơ trong hệ thống",
      tone: "green",
    },
    {
      label: "Cần nhập thêm",
      value: data?.summary.lowStock || 0,
      icon: Boxes,
      note: "Sản phẩm / kho dưới ngưỡng",
      tone: "orange",
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">TRUNG TÂM ĐIỀU HÀNH</p>
          <h1 className="page-title">Tổng quan kinh doanh</h1>
          <p className="page-description">
            Theo dõi hoạt động cửa hàng và các công việc cần xử lý.
          </p>
        </div>
        <div className="heading-actions">
          <span className="date-label">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          <button
            className="icon-button"
            disabled={loading}
            aria-label="Tải lại tổng quan"
            onClick={() => setAttempt((n) => n + 1)}
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>
      <section className="workspace-banner">
        <div>
          <span className="banner-tag">LAPZONE OPERATIONS</span>
          <h2>Mọi hoạt động, một góc nhìn.</h2>
          <p>Kiểm tra đơn mới và chủ động bổ sung hàng cho cửa hàng.</p>
        </div>
        <Link to="/don-hang" className="button">
          Xử lý đơn hàng
          <ArrowRight size={17} />
        </Link>
      </section>
      {error ? (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => setAttempt((n) => n + 1)}>Thử lại</button>
        </div>
      ) : loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p>Đang tải dữ liệu tổng quan…</p>
        </div>
      ) : (
        data && (
          <>
            <div className="stats-grid">
              {stats.map((s) => (
                <article className={"overview-stat " + s.tone} key={s.label}>
                  <div>
                    <span>{s.label}</span>
                    <s.icon size={20} />
                  </div>
                  <strong>{s.value}</strong>
                  <small>{s.note}</small>
                </article>
              ))}
            </div>
            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Doanh thu theo ngày</h2>
                    <p className="panel-subtitle">
                      Ghi nhận theo ngày hoàn thành đơn hàng
                    </p>
                  </div>
                  <select
                    aria-label="Khoảng thời gian doanh thu"
                    className="select-control"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  >
                    <option value="7">7 ngày qua</option>
                    <option value="30">30 ngày qua</option>
                    <option value="90">90 ngày qua</option>
                  </select>
                </div>
                <div className="revenue-total">
                  {formatCurrency(
                    data.revenue.reduce((s, r) => s + Number(r.doanhThu), 0),
                  )}
                  <span>trong kỳ đã chọn</span>
                </div>
                {data.revenue.length ? (
                  <div className="live-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.revenue.map((r) => ({
                          ...r,
                          doanhThu: Number(r.doanhThu),
                          label: new Date(String(r.ngay)).toLocaleDateString(
                            "vi-VN",
                            { day: "2-digit", month: "2-digit" },
                          ),
                        }))}
                      >
                        <defs>
                          <linearGradient
                            id="revenueFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#6965db"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="100%"
                              stopColor="#6965db"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#edf0f5" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => Number(v) / 1000000 + "tr"}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(v) => [
                            formatCurrency(Number(v)),
                            "Doanh thu",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="doanhThu"
                          stroke="#6965db"
                          strokeWidth={3}
                          fill="url(#revenueFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Chưa có doanh thu trong khoảng thời gian này.</p>
                  </div>
                )}
              </section>
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Cảnh báo tồn kho</h2>
                    <p className="panel-subtitle">
                      Ưu tiên bổ sung các sản phẩm sau
                    </p>
                  </div>
                  <span className="badge badge-warning">{data.low.length}</span>
                </div>
                <div className="live-list">
                  {data.low.slice(0, 5).map((r) => (
                    <div key={r.id}>
                      <span className="entity-image">
                        <Package size={21} />
                      </span>
                      <div>
                        <strong>{String(r.tenSanPham)}</strong>
                        <small>{String(r.tenKho)}</small>
                      </div>
                      <b className="stock-warning">
                        {String(r.khaDung)}
                        <small>khả dụng</small>
                      </b>
                    </div>
                  ))}
                  {!data.low.length && (
                    <p className="list-empty">
                      Không có sản phẩm dưới ngưỡng tồn kho.
                    </p>
                  )}
                </div>
                <Link to="/kho-hang" className="panel-link">
                  Kiểm tra tồn kho <ArrowRight size={14} />
                </Link>
              </section>
            </div>
            <div className="dashboard-bottom">
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Đơn hàng gần đây</h2>
                    <p className="panel-subtitle">
                      5 đơn mới nhất trong hệ thống
                    </p>
                  </div>
                  <Link className="panel-action" to="/don-hang">
                    Xem tất cả <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Người nhận</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <Link to="/don-hang" className="link-value">
                              {String(o.ma_don_hang)}
                            </Link>
                          </td>
                          <td>{String(o.nguoi_nhan || "Nhận tại cửa hàng")}</td>
                          <td>{formatCurrency(Number(o.tong_thanh_toan))}</td>
                          <td>
                            <span className="badge badge-info">
                              {display(o.trang_thai)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data.orders.length && (
                    <p className="list-empty">Chưa có đơn hàng.</p>
                  )}
                </div>
              </section>
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Sản phẩm bán chạy</h2>
                    <p className="panel-subtitle">Theo số lượng đã giao</p>
                  </div>
                </div>
                <div className="live-list">
                  {data.best.slice(0, 5).map((p, i) => (
                    <div key={p.id}>
                      <span className="ranking">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <strong>{String(p.ten_san_pham)}</strong>
                        <small>{formatCurrency(Number(p.doanhThu))}</small>
                      </div>
                      <b>
                        {String(p.daBan)}
                        <small>đã bán</small>
                      </b>
                    </div>
                  ))}
                  {!data.best.length && (
                    <p className="list-empty">Chưa có sản phẩm đã giao.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )
      )}
      <div className="quick-links">
        <Link to="/san-pham">
          <Package size={20} />
          <div>
            <strong>Danh mục sản phẩm</strong>
            <span>Cập nhật cấu hình và giá bán</span>
          </div>
          <ArrowRight size={17} />
        </Link>
        <Link to="/phieu-nhap">
          <Boxes size={20} />
          <div>
            <strong>Nhập hàng vào kho</strong>
            <span>Tạo và xử lý phiếu nhập</span>
          </div>
          <ArrowRight size={17} />
        </Link>
      </div>
    </>
  );
}
