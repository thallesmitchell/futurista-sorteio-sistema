
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-futuristic-gradient">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-primary/30 rounded-full filter blur-3xl" />
        <div className="absolute bottom-[30%] right-[10%] w-96 h-96 bg-secondary/30 rounded-full filter blur-3xl" />
      </div>
      
      <div className="z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
