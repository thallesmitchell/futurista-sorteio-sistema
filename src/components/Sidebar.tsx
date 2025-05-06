
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CalendarDays,
  CircleUser,
  History,
  LayoutDashboard,
  List,
  LogOut,
  Trophy,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const { user, logout, isSuperAdmin, userProfile } = useAuth();
  const { logoUrl } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={cn(
        "border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen flex flex-col",
        className
      )}
    >
      {/* Logo */}
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-center">
        {logoUrl ? (
          <NavLink to="/dashboard">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-10 w-auto max-w-[180px]" 
            />
          </NavLink>
        ) : (
          <NavLink to="/dashboard">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SorteioFutura
            </span>
          </NavLink>
        )}
      </div>

      {/* Sidebar content */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <div className="mb-2 px-3">
            <h3 className="text-xs font-medium text-muted-foreground">Menu</h3>
          </div>

          <div className="space-y-1">
            <Button
              variant={isActive("/dashboard") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <Button
              variant={isActive("/history") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/history")}
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>

            {isSuperAdmin && (
              <Button
                variant={isActive("/super-admin") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/super-admin")}
              >
                <Users className="h-4 w-4 mr-2" />
                Administradores
              </Button>
            )}
            
            <Button
              variant={isActive("/settings") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>

          {/* User section */}
          <div className="mt-10 pt-4 border-t border-border/20">
            <div className="px-3 mb-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                Usuário
              </h3>
            </div>
            <div className="bg-muted/50 rounded-md p-2 mb-2">
              <div className="flex items-center gap-2">
                <CircleUser className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {userProfile?.username || user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userProfile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
