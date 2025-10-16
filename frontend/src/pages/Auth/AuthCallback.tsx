import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication failed');
        navigate('/login?error=' + error);
        return;
      }

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Store token and user info
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Set authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Refresh user from server to sync state
          await refreshUser();
          
          toast.success('Successfully logged in with Google!');

          // Redirect based on role
          if (user.role === 'PROVIDER') {
            navigate('/provider/dashboard');
          } else {
            navigate('/');
          }
        } catch (err) {
          console.error('Auth callback error:', err);
          toast.error('Authentication failed');
          navigate('/login?error=invalid_response');
        }
      } else {
        navigate('/login?error=missing_credentials');
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}