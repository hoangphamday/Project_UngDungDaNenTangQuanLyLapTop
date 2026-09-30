import { useAuth } from "../services/auth";
import { PageHeader } from "../components/common/PageHeader";
export function ProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader
        eyebrow="Tài khoản"
        title="Hồ sơ cá nhân"
        description="Thông tin tài khoản đang sử dụng để truy cập hệ thống."
      />
      <section className="panel profile-summary">
        <div className="profile-avatar-large">
          {user?.tenDangNhap.slice(0, 2).toUpperCase()}
        </div>
        <h2>{user?.hoTen || user?.tenDangNhap}</h2>
        <p>{user?.email}</p>
        <span className="badge badge-info">
          {user?.vaiTro === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
        </span>
      </section>
    </>
  );
}
