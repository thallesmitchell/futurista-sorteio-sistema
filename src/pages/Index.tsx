
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';

const Index = () => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect super admins to their dashboard
      if (isSuperAdmin) {
        navigate('/super-admin');
      } else {
        // Regular admins go to the regular dashboard
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  return <LoginPage />;
};

export default Index;
