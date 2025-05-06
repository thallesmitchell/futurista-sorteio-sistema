
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Trophy, LogOut, Menu, X, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const NavItem = ({ icon: Icon, label, to }: { icon: any; label: string; to: string }) => {
    const isActive = location.pathname === to;

    return (
      <Link to={to} onClick={() => setIsMobileOpen(false)}>
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200",
            isActive 
              ? "bg-primary/20 text-primary" 
              : "hover:bg-primary/10 text-foreground/80 hover:text-foreground"
          )}
        >
          <Icon size={20} strokeWidth={2} />
          {!isCollapsed && <span className="font-medium">{label}</span>}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button - visible on small screens */}
      <div className="fixed top-4 left-4 z-50 block md:hidden">
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-background/80 backdrop-blur-sm border-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen bg-card/90 backdrop-blur-md border-r border-border z-50 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-[70px]" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end p-2 md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMobileMenu}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo area */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SorteioFutura
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <ChevronRight className={cn("h-5 w-5 transition-all", isCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <NavItem icon={Home} label="Dashboard" to="/dashboard" />
          <NavItem icon={Trophy} label="Histórico" to="/history" />
        </div>

        {/* Footer with logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-muted-foreground", isCollapsed && "justify-center")}
            onClick={logout}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>
    </>
  );
}
