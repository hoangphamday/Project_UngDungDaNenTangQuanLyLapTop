import { useState } from "react";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "../../routes/navigation";
import { useAuth } from "../../services/auth";
import { errorMessage } from "../../services/console";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const title =
    navigationItems.find((i) => i.path === pathname)?.label || "Hồ sơ cá nhân";
  const matches = navigationItems.filter(
    (i) =>
      i.label.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")) &&
      (user?.vaiTro === "ADMIN" ||
        !["/tai-khoan", "/nhan-vien"].includes(i.path)),
  );
  async function signOut() {
    setBusy(true);
    try {
      await logout();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <header className="header">
      <button
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Mở menu"
      >
        <Menu size={20} />
      </button>
      <div className="breadcrumb">
        Không gian làm việc <span>/</span> <strong>{title}</strong>
      </div>
      <div className="header-actions">
        <div className="nav-search">
          <label className="global-search">
            <Search size={17} />
            <input
              aria-label="Tìm chức năng"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm chức năng…"
            />
          </label>
          {query && (
            <div className="dropdown">
              {matches.length ? (
                matches.map((i) => (
                  <Link key={i.path} to={i.path} onClick={() => setQuery("")}>
                    {i.label}
                  </Link>
                ))
              ) : (
                <p>Không tìm thấy chức năng.</p>
              )}
            </div>
          )}
        </div>
        <Link to="/thong-bao" className="icon-button" aria-label="Thông báo">
          <Bell size={18} />
        </Link>
        <Link to="/ho-so" className="header-user">
          <div className="avatar">
            {user?.tenDangNhap.slice(0, 2).toUpperCase()}
          </div>
          <div className="header-user-copy">
            <strong>{user?.hoTen || user?.tenDangNhap}</strong>
            <span>
              {user?.vaiTro === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
            </span>
          </div>
        </Link>
        <button
          className="icon-button"
          disabled={busy}
          title="Đăng xuất"
          aria-label="Đăng xuất"
          onClick={() => void signOut()}
        >
          <LogOut size={17} />
        </button>
      </div>
      {error && (
        <button className="toast" onClick={() => setError("")}>
          {error}
        </button>
      )}
    </header>
  );
}
