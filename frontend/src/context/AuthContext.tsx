import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  providerStatus?: string | null;  // Added
  providerId?: string | null;      // Added
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('AuthProvider initializing...', { hasToken: !!token, hasSavedUser: !!savedUser });
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('User data loaded:', userData);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('No token or user found in localStorage');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    const { token, user: userData } = res.data;
    
    console.log('Login successful:', userData);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const signup = async (data: SignupData) => {
    console.log('Signup data being sent:', data);
    const res = await api.post('/signup', data);
    const { token, user: userData } = res.data;
    
    console.log('Signup successful:', userData);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data...');
      const res = await api.get('/me');
      console.log('User refreshed:', res.data);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/google`;
  };

  const signupWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/google`;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup,
      logout, 
      refreshUser,
      loginWithGoogle,
      signupWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}