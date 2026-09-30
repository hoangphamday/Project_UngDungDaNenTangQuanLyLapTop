import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
import { ManagementPage } from "../pages/ManagementPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProfilePage } from "../pages/ProfilePage";
import { LoginPage } from "../pages/LoginPage";
import { AuthProvider, useAuth } from "../services/auth";
import { navigationItems } from "./navigation";
function Protected() {
  const { user, loading, error, retry, logout } = useAuth();
  if (loading)
    return <div className="empty-state">Đang xác thực phiên đăng nhập…</div>;
  if (error)
    return (
      <div className="empty-state">
        <h2>Không thể xác thực phiên</h2>
        <p role="alert">{error}</p>
        <button className="button button-secondary" onClick={retry}>
          Thử lại
        </button>{" "}
        <button
          className="button button-primary"
          onClick={() => {
            void logout().catch(() => {
              localStorage.removeItem("admin_access_token");
              localStorage.removeItem("admin_refresh_token");
              window.location.assign("/dang-nhap");
            });
          }}
        >
          Đăng nhập lại
        </button>
      </div>
    );
  return user ? <Outlet /> : <Navigate to="/dang-nhap" replace />;
}
export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route element={<Protected />}>
            <Route element={<AdminLayout />}>
              <Route
                index
                element={
                  <Suspense
                    fallback={
                      <div className="empty-state">Đang tải tổng quan…</div>
                    }
                  >
                    <DashboardPage />
                  </Suspense>
                }
              />
              {navigationItems
                .filter((i) => i.path !== "/")
                .map((i) => (
                  <Route
                    key={i.path}
                    path={i.path}
                    element={<ManagementPage key={i.path} />}
                  />
                ))}
              <Route path="/ho-so" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
