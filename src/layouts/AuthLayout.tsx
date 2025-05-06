
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-primary/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-[30%] right-[10%] w-96 h-96 bg-accent/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-[40%] right-[30%] w-48 h-48 bg-primary/10 rounded-full filter blur-2xl"></div>
      </div>
      
      {/* Logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <img 
          src="/lovable-uploads/b7f54603-ff4e-4280-8c96-a36a94acf7c6.png" 
          alt="Pix Acumulado" 
          className="h-20 animate-glow"
        />
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="pix-card backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
