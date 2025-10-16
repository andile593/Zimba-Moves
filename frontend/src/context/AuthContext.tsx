import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type FC,
} from "react";
import api from "../services/axios";
import toast from "react-hot-toast";
import type { User } from "../types/user";

// ---------- Types ----------
interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void; 
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  loginWithGoogle: () => void;
  signupWithGoogle: () => void;
}


// ---------- Context ----------
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Refresh user when token is available ---
  const refreshUser = useCallback(async (): Promise<User | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get("/me");
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.warn("Session expired:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Login ---
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post("/login", { email, password });
      console.log("Login response:", res.data);
      
      const { token, user: userData } = res.data;
      
      if (!token || !userData) {
        throw new Error("Invalid response format");
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      
      toast.success("Login successful!");
      return res.data;
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Login failed");
      throw err;
    }
  }, []);

  // --- Signup ---
  const signup = useCallback(
    async (data: SignupInput) => {
      try {
        await api.post("/signup", data);
        toast.success("Account created! Please login.");
        
        // Auto-login after signup
        await login(data.email, data.password);
      } catch (err: any) {
        console.error("Signup failed:", err);
        toast.error(err.response?.data?.error || "Signup failed");
        throw err;
      }
    },
    [login]
  );

  // --- Logout ---
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  // --- Google Auth ---
  const loginWithGoogle = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    window.location.href = `${apiUrl}/auth/google`;
  }, []);

  const signupWithGoogle = loginWithGoogle;

  // --- Initial Auth Check ---
  useEffect(() => {
    (async () => {
      // Check for stored user first (for immediate UI update)
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (err) {
          console.error("Error parsing stored user:", err);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      
      // Then refresh from server to ensure data is current
      await refreshUser();
    })();
  }, [refreshUser]);

  // --- Cross-tab Sync ---
  useEffect(() => {
    const handleStorage = async (event: StorageEvent) => {
      if (event.key === "token") {
        const newToken = event.newValue;
        if (!newToken) {
          setUser(null);
          delete api.defaults.headers.common["Authorization"];
        } else {
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          await refreshUser();
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshUser]);

const value: AuthContextType = {
  user,
  setUser,
  loading,
  isAuthenticated: !!user,
  login,
  signup,
  logout,
  refreshUser,
  loginWithGoogle,
  signupWithGoogle,
};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};