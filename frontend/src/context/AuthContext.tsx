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
  signup: (data: User) => Promise<void>;  
  providerSignup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => void;
  signupWithGoogle: () => void;
}

// Export the context itself
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props interface
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
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    const { token, user: userData } = res.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const signup = async (data: User) => {
    const res = await api.post('/signup', data);
    const { token, user: userData } = res.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const providerSignup = async (data: SignupData) => {
    const res = await api.post('/signup/provider', data);
    const { token, user: userData } = res.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://lwwx2f-4000.csb.app'}/google`;
  };

  const signupWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://lwwx2f-4000.csb.app'}/google`;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup,
      providerSignup, 
      logout, 
      refreshUser,
      loginWithGoogle,
      signupWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the hook directly from this file
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}