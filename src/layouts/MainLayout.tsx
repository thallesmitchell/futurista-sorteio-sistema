
import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-[15%] right-[8%] w-80 h-80 rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute top-[40%] right-[20%] w-40 h-40 rounded-full bg-primary/3 blur-2xl"></div>
      </div>
      
      <Sidebar />
      
      <main className="flex-1 ml-[70px] md:ml-[240px] p-4 md:p-6 lg:p-8 transition-all duration-300 z-10 relative">
        <div className={cn("container mx-auto")}>
          <div className="mb-6 flex items-center">
            <img 
              src="/lovable-uploads/b7f54603-ff4e-4280-8c96-a36a94acf7c6.png" 
              alt="Pix Acumulado" 
              className="h-12 md:h-16 mr-2"
            />
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}
