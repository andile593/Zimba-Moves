import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import type { User, SignupData } from "../types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => void;
  signup: (data: SignupData) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      setLoading(false);
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
      return;
    }

    fetchUser(token)
      .then((fetchedUser) => {
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchUser = async (token: string): Promise<User> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  };

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.details || data.error || data.message || "Login failed";
        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.details || data.error || data.message || "Google login failed";
        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData: SignupData): Promise<User> => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Prioritize details field which contains the user-friendly message
        const errorMessage =
          data.details || data.error || data.message || "Signup failed";
        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("💥 Caught error in signup:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
