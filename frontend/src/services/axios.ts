import axios from "axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: false,
});

function isTokenExpired(token: string): boolean {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    // Add 30 second buffer to prevent edge cases
    return decoded.exp < now + 30;
  } catch (err) {
    console.error("Invalid token format:", err);
    return true;
  }
}

// Track if we're already handling logout to prevent multiple redirects
let isHandlingLogout = false;

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Always get fresh token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.warn("Token expired — forcing logout.");
        handleLogout();
        return Promise.reject(new Error("Session expired"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // List of public endpoints that don't require auth
    const publicEndpoints = [
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      url?.includes(endpoint)
    );

    // If 401 and not a public endpoint and not already logging out
    if (status === 401 && !isPublicEndpoint && !isHandlingLogout) {
      console.warn("Unauthorized (401) — clearing session");
      handleLogout();
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  if (isHandlingLogout) return;

  isHandlingLogout = true;

  // Clear auth data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];

  // Show toast notification
  toast.error("Session expired. Please log in again.");

  // Redirect to login if not already there
  if (!window.location.pathname.includes("/login")) {
    setTimeout(() => {
      window.location.href = "/login";
      isHandlingLogout = false;
    }, 500);
  } else {
    isHandlingLogout = false;
  }
}

// Export helper to manually update token (optional)
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
