
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoginPage from './LoginPage';

const Index = () => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index page loaded', { isAuthenticated, isSuperAdmin });
    if (isAuthenticated) {
      // Redirect super admins to their dashboard
      if (isSuperAdmin) {
        console.log('Redirecting super admin to /super-admin');
        navigate('/super-admin');
      } else {
        // Regular admins go to the regular dashboard
        console.log('Redirecting regular admin to /dashboard');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  // Show login page if not authenticated
  return <LoginPage />;
};

export default Index;
