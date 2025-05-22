
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for handling user login with improved session management
 */
export const useLogin = () => {
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login for:', email);
    try {
      // Clean up any previous auth state thoroughly
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage as well if it exists
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // Attempt to sign out globally first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global sign out failed, continuing with login', err);
        // Continue with login regardless of global sign out success
      }
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Falha no login",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      console.log('Login successful:', data.user?.email);
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo!`,
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Erro durante o login",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  return { login };
};
