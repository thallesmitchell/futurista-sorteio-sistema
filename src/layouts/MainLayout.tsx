
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Toaster } from "@/components/ui/sonner";
import { MobileNavBar } from '@/components/mobile/MobileNavBar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-background/90">
      {!isMobile && <Sidebar />}
      <main className={cn(
        "flex-1 table-container",
        isMobile ? "p-2 pb-20" : "p-2 sm:p-4 md:p-6 lg:p-8"
      )}>
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      {isMobile && <MobileNavBar />}
      <Toaster />
    </div>
  );
}

// Import cn function
import { cn } from '@/lib/utils';
