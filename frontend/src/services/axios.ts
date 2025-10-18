import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://9lwj8t-4000.csb.app",
  withCredentials: false,
});

// Request interceptor - add token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors without auto-redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for protected routes, not for public endpoints
    if (error.response?.status === 401) {
      const isPublicEndpoint =
        error.config?.url?.includes("/login") ||
        error.config?.url?.includes("/signup") ||
        (error.config?.url?.includes("/providers") &&
          error.config?.method === "get");

      // Only clear token and redirect if it's not a public endpoint
      if (!isPublicEndpoint && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        // Don't auto-redirect, let the component handle it
      }
    }

    return Promise.reject(error);
  }
);

export default api;
