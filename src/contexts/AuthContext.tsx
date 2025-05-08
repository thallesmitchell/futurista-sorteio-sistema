import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string | null;
  role: 'super_admin' | 'admin';
  theme_color: string | null;
  logo_url: string | null;
  default_game_name: string | null;
  site_name: string | null;
  logo_width: number | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, role?: 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isSuperAdmin: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        // Ensure we cast the data as UserProfile with all the required properties
        const profile: UserProfile = {
          id: data.id,
          username: data.username,
          role: data.role as 'super_admin' | 'admin',
          theme_color: data.theme_color,
          logo_url: data.logo_url,
          default_game_name: data.default_game_name,
          site_name: data.site_name,
          logo_width: data.logo_width
        };
        
        setUserProfile(profile);
        setIsSuperAdmin(profile.role === 'super_admin');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  // Função para atualizar o perfil do usuário
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    // Primeiro configurar o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
      
      if (currentSession?.user) {
        setTimeout(() => {
          fetchUserProfile(currentSession.user.id);
        }, 0);
      } else {
        setUserProfile(null);
        setIsSuperAdmin(false);
      }
    });

    // Depois verificar a sessão atual
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Falha no login",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro durante o login",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  const signup = async (email: string, password: string, username: string, role: 'admin' = 'admin'): Promise<boolean> => {
    // Only super admins can create new users
    if (!isSuperAdmin) {
      toast({
        title: "Permissão negada",
        description: "Apenas super administradores podem criar novos usuários",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role
          }
        }
      });

      if (error) {
        toast({
          title: "Falha no cadastro",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Cadastro realizado com sucesso",
        description: "A conta de administrador foi criada.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro durante o cadastro",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  // Fixed logout function with clean-up and force refresh
  const logout = async () => {
    try {
      // Clean up auth state in storage
      const cleanupAuthState = () => {
        // Remove standard auth tokens
        localStorage.removeItem('supabase.auth.token');
        // Remove all Supabase auth keys from localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        // Remove from sessionStorage if in use
        Object.keys(sessionStorage || {}).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      };
      
      // Clean up first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.error("Error during sign out:", signOutError);
        // Continue even if this fails
      }
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema"
      });
      
      // Force navigation and page reload for a clean state
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Erro durante o logout",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session, 
      login, 
      signup, 
      logout, 
      userProfile, 
      isSuperAdmin,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
