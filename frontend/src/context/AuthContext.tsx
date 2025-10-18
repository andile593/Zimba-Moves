import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import toast from "react-hot-toast";

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  providerStatus?: string | null;
  providerId?: string | null;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  providerData?: {
    idNumber: string;
    address: string;
    city: string;
    region?: string;
    postalCode?: string;
    country?: string;
    includeHelpers?: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => void;
  signupWithGoogle: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Normalize user and role to uppercase
const normalizeUser = (user: any): User => ({
  ...user,
  role: user.role?.toUpperCase?.(),
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const userData = normalizeUser(JSON.parse(savedUser));
        setUser(userData);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        console.log("Token changed in localStorage:", e.oldValue, "→", e.newValue);
      }
      if (e.key === "user") {
        console.log("User changed in localStorage:", e.oldValue, "→", e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    const { token, user: rawUser } = res.data;
    const userData = normalizeUser(rawUser);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const signup = async (data: SignupData) => {
    const res = await api.post("/signup", data);
    const { token, user: rawUser } = res.data;
    const userData = normalizeUser(rawUser);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/me");
      const refreshed = normalizeUser(res.data);
      setUser(refreshed);
      localStorage.setItem("user", JSON.stringify(refreshed));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/google`;
  };

  const signupWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/google`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        loginWithGoogle,
        signupWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
