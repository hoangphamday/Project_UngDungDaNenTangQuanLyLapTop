import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiClient } from "../api/client";
import { errorMessage, read } from "./console";
interface User {
  id: number;
  tenDangNhap: string;
  hoTen?: string;
  email: string;
  vaiTro: string;
}
const Context = createContext<{
  user: User | null;
  loading: boolean;
  error: string;
  login: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
}>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("admin_access_token")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    read<User>("/auth/me")
      .then((u) => {
        if (active) {
          if (!["ADMIN", "STAFF"].includes(u.vaiTro))
            throw new Error("Tài khoản không có quyền quản trị.");
          setUser(u);
        }
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
  }, [attempt]);
  async function login(dinhDanh: string, matKhau: string) {
    const {
      data: { data },
    } = await apiClient.post("/auth/login", { dinhDanh, matKhau });
    if (!["ADMIN", "STAFF"].includes(data.taiKhoan.vaiTro)) {
      await apiClient.post("/auth/logout", { refreshToken: data.refreshToken });
      throw new Error("Tài khoản không có quyền truy cập trang quản trị.");
    }
    localStorage.setItem("admin_access_token", data.accessToken);
    localStorage.setItem("admin_refresh_token", data.refreshToken);
    setUser(data.taiKhoan);
    setError("");
  }
  async function logout() {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (refreshToken) await apiClient.post("/auth/logout", { refreshToken });
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    setUser(null);
    setError("");
  }
  return (
    <Context.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        retry: () => setAttempt((n) => n + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
