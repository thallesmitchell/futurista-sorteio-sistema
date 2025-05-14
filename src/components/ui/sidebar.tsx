
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  History,
  Settings,
  LogOut,
  ChevronRight,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isSuperAdmin } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user name from metadata
  const userName = user?.user_metadata?.name || 'Usuário';
  const userRole = isSuperAdmin ? 'Super Admin' : 'Admin';

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Jogadores',
      path: '/players',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Histórico',
      path: '/history',
      icon: <History className="h-5 w-5" />,
    },
    {
      name: 'Financeiro',
      path: '/finance',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      name: 'Configurações',
      path: '/profile',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Add super admin route if user is super admin
  if (isSuperAdmin) {
    navItems.push({
      name: 'Super Admin',
      path: '/admin',
      icon: <ShieldCheck className="h-5 w-5" />,
    });
  }

  return (
    <div className="flex flex-col h-screen border-r border-border bg-card">
      {/* Logo and name */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-medium">{userName}</h2>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive ? "font-medium" : "",
                  )}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="p-6">
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
}
