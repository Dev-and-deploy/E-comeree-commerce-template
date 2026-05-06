import axios from "axios";

// Server-side (SSR): use internal Docker network URL via API_URL env var
// Browser (CSR): use public URL via NEXT_PUBLIC_API_URL
const isServer = typeof window === "undefined";
const API_URL = isServer
  ? (process.env.API_URL || "http://localhost:4000/api")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export const fetchActiveTheme = () =>
  fetch(`${API_URL}/theme/active`, { next: { revalidate: 600 } }).then((r) => r.json());

export const fetchProducts = (params = "") =>
  fetch(`${API_URL}/products?${params}`, { next: { revalidate: 300 } }).then((r) => r.json());

export const fetchProduct = (slug) =>
  fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 300 } }).then((r) => r.json());

export const fetchCategories = () =>
  fetch(`${API_URL}/products/categories`, { next: { revalidate: 600 } }).then((r) => r.json());
