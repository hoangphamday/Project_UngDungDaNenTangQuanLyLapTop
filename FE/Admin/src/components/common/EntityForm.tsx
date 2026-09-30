import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiClient } from "../../api/client";
import { display, errorMessage, list, read } from "../../services/console";
import type { RecordData } from "../../services/console";
import type { Module } from "../../services/modules";
import { Modal } from "./Modal";
import { formatCurrency } from "../../utils/formatters";
const snake = (key: string) =>
  key.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
const sources: Record<string, string> = {
  brands: "/admin/brands",
  categories: "/admin/categories",
  warehouses: "/admin/warehouses",
  suppliers: "/admin/suppliers",
  laptops: "/admin/laptops",
  variants: "/admin/variants",
};
export function EntityForm({
  config,
  record,
  onClose,
  onSaved,
}: {
  config: Module;
  record: RecordData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<Record<string, RecordData[]>>({});
  const [items, setItems] = useState<
    { laptopId: string; bienTheId: string; soLuong: number; donGia: number }[]
  >([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isImport = config.endpoint === "/admin/import-receipts";
  const isPromo = config.endpoint === "/admin/promotions";
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const needed = [
          ...new Set([
            ...(config.fields || [])
              .map((f) => f.source)
              .filter((s): s is string => !!s),
            ...(isImport ? ["variants"] : isPromo ? ["laptops"] : []),
          ]),
        ];
        const [data, lookups] = await Promise.all([
          record && config.detail
            ? read<RecordData>(config.endpoint + "/" + record.id)
            : Promise.resolve(record),
          Promise.all(
            needed.map(async (key) => [key, await list(sources[key])] as const),
          ),
        ]);
        if (!active) return;
        setOptions(Object.fromEntries(lookups));
        const initial: Record<string, string> = {};
        for (const field of config.fields || []) {
          const raw = data?.[snake(field.key)];
          if (raw != null) {
            if (field.type === "datetime-local" || field.type === "date") {
              const date = new Date(String(raw));
              initial[field.key] = Number.isNaN(date.getTime())
                ? ""
                : new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, field.type === "date" ? 10 : 16);
            } else initial[field.key] = String(raw);
          } else initial[field.key] = field.options?.[0] || "";
        }
        if (!record && config.endpoint === "/admin/variants") initial.laptopId = new URLSearchParams(window.location.search).get("laptopId") || "";
        setValues(initial);
        if (isImport)
          setItems(
            data?.items
              ? (data.items as RecordData[]).map((i) => ({
                  laptopId: String(i.laptop_id),
                  bienTheId: String(i.bien_the_id),
                  soLuong: Number(i.so_luong),
                  donGia: Number(i.don_gia),
                }))
              : [{ laptopId: "", bienTheId: "", soLuong: 1, donGia: 0 }],
          );
        if (isPromo && data?.laptopIds)
          setProductIds((data.laptopIds as number[]).map(String));
      } catch (e) {
        if (active) setError(errorMessage(e));
      } finally {
        if (active) setLoading(false);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, [config, record, isImport, isPromo]);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = {};
      for (const field of config.fields || []) {
        if (record && field.createOnly) continue;
        const value = values[field.key];
        if (value !== "")
          body[field.key] =
            field.type === "number" || field.source
              ? Number(value)
              : field.type === "datetime-local"
                ? new Date(value).toISOString()
                : value;
        else if (
          record &&
          [
            "giaKhuyenMai",
            "parentId",
            "logoUrl",
            "anhDaiDien",
            "slug",
            "ramGb",
            "ssdGb",
            "manHinhInch",
            "tanSoQuetHz",
          ].includes(field.key)
        )
          body[field.key] = null;
        else if (record && (field.type === "text" || field.type === "textarea"))
          body[field.key] = value;
      }
      if (
        body.giaKhuyenMai != null &&
        Number(body.giaKhuyenMai) > Number(body.giaBan)
      )
        throw new Error("Giá khuyến mãi không được lớn hơn giá bán.");
      if (body.parentId && Number(body.parentId) === Number(record?.id))
        throw new Error("Danh mục không thể là cha của chính nó.");
      if (isImport) {
        if (!items.length) throw new Error("Thêm ít nhất một sản phẩm.");
        if (new Set(items.map((i) => i.bienTheId)).size !== items.length)
          throw new Error("Sản phẩm bị trùng trong phiếu nhập.");
        body.items = items.map((i) => ({ ...i, laptopId: Number(i.laptopId), bienTheId: Number(i.bienTheId) }));
      }
      if (isPromo) {
        if (new Date(values.ngayKetThuc) <= new Date(values.ngayBatDau))
          throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu.");
        if (values.loaiGiam === "PERCENT" && Number(values.giaTriGiam) > 100)
          throw new Error("Phần trăm giảm không vượt quá 100%.");
        if (values.phamViApDung === "CATEGORY" && !values.danhMucId)
          throw new Error("Chọn danh mục áp dụng.");
        if (values.phamViApDung === "BRAND" && !values.hangLaptopId)
          throw new Error("Chọn hãng áp dụng.");
        if (values.phamViApDung === "PRODUCT" && !productIds.length)
          throw new Error("Chọn ít nhất một sản phẩm áp dụng.");
        body.laptopIds =
          values.phamViApDung === "PRODUCT" ? productIds.map(Number) : [];
        body.danhMucId =
          values.phamViApDung === "CATEGORY" ? Number(values.danhMucId) : null;
        body.hangLaptopId =
          values.phamViApDung === "BRAND" ? Number(values.hangLaptopId) : null;
      }
      await apiClient.request({
        url: config.write + (record ? "/" + record.id : ""),
        method: record ? "put" : "post",
        data: body,
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={(record ? "Chỉnh sửa · " : "Thêm mới · ") + config.title}
      description="Các trường có dấu * là bắt buộc."
      onClose={() => {
        if (!busy) onClose();
      }}
      footer={
        <>
          <button
            className="button button-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="button button-primary"
            disabled={busy || loading || !Object.keys(values).length}
            form="entity-form"
            type="submit"
          >
            {busy ? "Đang lưu…" : "Lưu thông tin"}
          </button>
        </>
      }
    >
      {loading ? (
        <p>Đang tải biểu mẫu…</p>
      ) : (
        <form id="entity-form" className="form-grid" onSubmit={save}>
          {error && (
            <div className="error-banner full" role="alert">
              {error}
            </div>
          )}
          {config.fields
            ?.filter((f) => !(record && f.createOnly))
            .filter(
              (f) =>
                f.key !== "danhMucId" ||
                !isPromo ||
                values.phamViApDung === "CATEGORY",
            )
            .filter(
              (f) =>
                f.key !== "hangLaptopId" ||
                !isPromo ||
                values.phamViApDung === "BRAND",
            )
            .map((f) => (
              <label
                key={f.key}
                className={f.type === "textarea" ? "full" : ""}
              >
                <span>
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {f.type === "select" ? (
                  <select
                    aria-label={f.label + (f.required ? " *" : "")}
                    required={f.required}
                    value={values[f.key] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.value })
                    }
                  >
                    <option value="">Chọn {f.label.toLowerCase()}</option>
                    {f.options?.map((v) => (
                      <option key={v} value={v}>
                        {display(v)}
                      </option>
                    ))}
                    {f.source &&
                      options[f.source]
                        ?.filter(
                          (o) =>
                            f.key !== "parentId" ||
                            String(o.id) !== String(record?.id),
                        )
                        .map((o) => (
                          <option key={o.id} value={String(o.id)}>
                            {String(
                              o.ten_hang ||
                                o.ten_danh_muc ||
                                o.ten_kho ||
                                o.ten_ncc ||
                                o.ten_san_pham,
                            )}
                          </option>
                        ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={values[f.key] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    type={f.type}
                    required={f.required}
                    min={
                      f.type === "number"
                        ? ["ramGb", "ssdGb"].includes(f.key)
                          ? 1
                          : 0
                        : undefined
                    }
                    step={
                      f.type === "number"
                        ? [
                            "manHinhInch",
                            "giaBan",
                            "giaNhap",
                            "giaKhuyenMai",
                            "giaTriGiam",
                            "luong",
                            "giamToiDa",
                            "donHangToiThieu",
                          ].includes(f.key)
                          ? "0.01"
                          : "1"
                        : undefined
                    }
                    pattern={f.type === "tel" ? "0[0-9]{9}" : undefined}
                    value={values[f.key] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.value })
                    }
                  />
                )}
              </label>
            ))}
          {isPromo && values.phamViApDung === "PRODUCT" && (
            <fieldset className="full product-options">
              <legend>Sản phẩm áp dụng *</legend>
              {options.laptops?.map((p) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={productIds.includes(String(p.id))}
                    onChange={(e) =>
                      setProductIds(
                        e.target.checked
                          ? [...productIds, String(p.id)]
                          : productIds.filter((id) => id !== String(p.id)),
                      )
                    }
                  />
                  {String(p.ten_san_pham)}
                </label>
              ))}
            </fieldset>
          )}
          {isImport && (
            <section className="full receipt-items">
              <div className="section-heading">
                <h3>Chi tiết hàng nhập</h3>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() =>
                    setItems([
                      ...items,
                      { laptopId: "", bienTheId: "", soLuong: 1, donGia: 0 },
                    ])
                  }
                >
                  <Plus size={16} />
                  Thêm dòng
                </button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="receipt-line">
                  <label>
                    <span>Sản phẩm *</span>
                    <select
                      required
                      value={item.bienTheId}
                      onChange={(e) =>
                        setItems(
                          items.map((i, n) =>
                            n === index
                              ? { ...i, bienTheId: e.target.value, laptopId: String(options.variants?.find(v => String(v.id) === e.target.value)?.laptop_id || ""), donGia: Number(options.variants?.find(v => String(v.id) === e.target.value)?.gia_nhap || 0) }
                              : i,
                          ),
                        )
                      }
                    >
                      <option value="">Chọn biến thể laptop</option>
                      {options.variants?.filter(p => p.trang_thai !== "INACTIVE").map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {`${p.ten_san_pham} · ${p.ma_sku} · ${p.mau_sac} / ${p.ram_gb}GB / ${p.ssd_gb}GB`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Số lượng *</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={item.soLuong}
                      onChange={(e) =>
                        setItems(
                          items.map((i, n) =>
                            n === index
                              ? { ...i, soLuong: Number(e.target.value) }
                              : i,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>Đơn giá (đ) *</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.donGia}
                      onChange={(e) =>
                        setItems(
                          items.map((i, n) =>
                            n === index
                              ? { ...i, donGia: Number(e.target.value) }
                              : i,
                          ),
                        )
                      }
                    />
                  </label>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Xóa dòng"
                    onClick={() =>
                      setItems(items.filter((_, n) => n !== index))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <p className="receipt-total">
                Tổng giá trị:{" "}
                <strong>
                  {formatCurrency(
                    items.reduce((sum, i) => sum + i.soLuong * i.donGia, 0),
                  )}
                </strong>
              </p>
            </section>
          )}
        </form>
      )}
    </Modal>
  );
}
