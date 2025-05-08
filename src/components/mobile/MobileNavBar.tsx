
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BarChart, Settings, List, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex flex-col items-center justify-center flex-1 py-2 px-1",
      active ? "text-primary" : "text-muted-foreground"
    )}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export function MobileNavBar() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeRoute, setActiveRoute] = React.useState('/dashboard');
  
  React.useEffect(() => {
    const path = window.location.pathname;
    setActiveRoute(path);
  }, []);
  
  const navigateTo = (route: string) => {
    navigate(route);
    setActiveRoute(route);
  };
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40 rounded-t-xl">
      <div className="flex items-center justify-around">
        <NavItem 
          icon={<Home size={20} />} 
          label="Início" 
          active={activeRoute === '/dashboard'} 
          onClick={() => navigateTo('/dashboard')} 
        />
        <NavItem 
          icon={<List size={20} />} 
          label="Jogos" 
          active={activeRoute.includes('/admin/')} 
          onClick={() => navigateTo('/dashboard')} 
        />
        <NavItem 
          icon={
            <div className="bg-primary text-primary-foreground rounded-full p-3 -mt-6 shadow-lg border-4 border-background">
              <Plus size={24} />
            </div>
          } 
          label="" 
          onClick={() => navigateTo('/dashboard')} 
        />
        <NavItem 
          icon={<BarChart size={20} />} 
          label="Histórico" 
          active={activeRoute === '/history'} 
          onClick={() => navigateTo('/history')} 
        />
        <NavItem 
          icon={<Settings size={20} />} 
          label="Config." 
          active={activeRoute === '/settings'} 
          onClick={() => navigateTo('/settings')} 
        />
      </div>
      <div className="h-safe-bottom bg-background"></div>
    </div>
  );
}
