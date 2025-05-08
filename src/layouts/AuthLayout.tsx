
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-[30%] right-[10%] w-96 h-96 bg-accent/10 rounded-full filter blur-3xl"></div>
        <div className="absolute top-[40%] right-[30%] w-48 h-48 bg-primary/5 rounded-full filter blur-2xl"></div>
      </div>
      
      <div className="z-10 w-full max-w-md px-4 sm:px-0">
        <div className={`backdrop-blur-xl bg-card/40 border border-primary/20 rounded-xl shadow-lg ${isMobile ? 'p-5' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
