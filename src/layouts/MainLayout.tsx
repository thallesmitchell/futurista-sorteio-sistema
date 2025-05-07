
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Toaster } from "@/components/ui/sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Não renderizar nada até verificar autenticação
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-background/90">
      <Sidebar />
      <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-auto w-full max-w-full">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
