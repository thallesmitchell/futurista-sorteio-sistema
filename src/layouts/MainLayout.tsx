
import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-[70px] md:ml-[240px] p-4 md:p-8 transition-all duration-300">
        <div className={cn("container mx-auto")}>
          {children}
        </div>
      </main>
    </div>
  );
}
