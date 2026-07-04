import axios from "axios";

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://testing2.reshortai.com/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("luxx-admin-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("luxx-admin-token");
      localStorage.removeItem("luxx-admin-user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export default adminApi;
