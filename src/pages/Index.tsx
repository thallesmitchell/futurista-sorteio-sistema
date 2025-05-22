
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoginPage from './LoginPage';

const Index = () => {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after the auth state is loaded
    if (!isLoading) {
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
    }
  }, [isAuthenticated, isSuperAdmin, navigate, isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  return <LoginPage />;
};

export default Index;
