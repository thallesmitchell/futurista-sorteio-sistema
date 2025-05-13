
import { useLocation, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { 
  Home,
  File,
  Users,
  LayoutDashboard,
  Settings,
  CalendarCheck,
  LogOut,
  DollarSign
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  isCollapsed?: boolean;
};

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isSuperAdmin = user?.userMetadata?.role === "super_admin";

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight", isCollapsed && "hidden")}>
            Admin
          </h2>
          <div className="space-y-1">
            <NavLink to="/dashboard">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <LayoutDashboard className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>Dashboard</span>}
                </Button>
              )}
            </NavLink>
            
            <NavLink to="/finance">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <DollarSign className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>Financeiro</span>}
                </Button>
              )}
            </NavLink>

            <NavLink to="/history">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <CalendarCheck className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>Histórico</span>}
                </Button>
              )}
            </NavLink>

            <NavLink to="/players">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Users className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>Jogadores</span>}
                </Button>
              )}
            </NavLink>
            
            {isSuperAdmin && (
              <NavLink to="/admin">
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Users className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
                    {!isCollapsed && <span>Administradores</span>}
                  </Button>
                )}
              </NavLink>
            )}
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight", isCollapsed && "hidden")}>
            Configurações
          </h2>
          <div className="space-y-1">
            <NavLink to="/profile">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Settings className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>Meu Perfil</span>}
                </Button>
              )}
            </NavLink>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className={cn("mr-2 h-4 w-4", isCollapsed && "mr-0")} />
              {!isCollapsed && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
