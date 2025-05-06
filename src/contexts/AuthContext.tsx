
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  user: User | null;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    // Primeiro configurar o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
    });

    // Depois verificar a sessão atual
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
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
        description: `Bem-vindo, ${email}!`,
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

  const signup = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
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
        description: "Sua conta foi criada. Você já pode fazer login.",
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema"
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro durante o logout",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, session, login, signup, logout }}>
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
