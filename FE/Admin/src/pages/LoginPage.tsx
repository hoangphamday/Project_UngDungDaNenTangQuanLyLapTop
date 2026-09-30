import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowRight, LaptopMinimal, ShieldCheck } from "lucide-react";
import { useAuth } from "../services/auth";
import { errorMessage } from "../services/console";
export function LoginPage() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (auth.user) return <Navigate to="/" replace />;
  return (
    <div className="login-shell">
      <section className="login-intro">
        <div className="login-brand">
          <LaptopMinimal /> LapZone<span>ADMIN</span>
        </div>
        <div>
          <p className="eyebrow">KHÔNG GIAN QUẢN TRỊ</p>
          <h1>
            Vận hành cửa hàng.
            <br />
            Trong tầm kiểm soát.
          </h1>
          <p>
            Sản phẩm, đơn hàng và kho hàng — một không gian làm việc thống nhất
            cho đội ngũ của bạn.
          </p>
        </div>
        <span>
          <ShieldCheck size={18} /> Dành cho quản trị viên và nhân viên LapZone
        </span>
      </section>
      <section className="login-form">
        <p className="eyebrow">CHÀO MỪNG TRỞ LẠI</p>
        <h2>Đăng nhập quản trị</h2>
        <p>Sử dụng tài khoản được cấp để tiếp tục.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setBusy(true);
            setError("");
            try {
              await auth.login(
                String(form.get("name")),
                String(form.get("password")),
              );
            } catch (err) {
              setError(errorMessage(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Tên đăng nhập hoặc email
            <input
              name="name"
              autoComplete="username"
              required
              autoFocus
              placeholder="Nhập tài khoản của bạn"
            />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Nhập mật khẩu"
            />
          </label>
          {(error || auth.error) && (
            <div className="error-banner" role="alert">
              {error || auth.error}
            </div>
          )}
          <button
            disabled={busy}
            className="button button-primary"
            type="submit"
          >
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            <ArrowRight size={18} />
          </button>
        </form>
        <small>Liên hệ quản trị viên nếu bạn chưa có tài khoản.</small>
      </section>
    </div>
  );
}
