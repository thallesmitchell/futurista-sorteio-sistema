
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for handling user login
 */
export const useLogin = () => {
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login for:', email);
    try {
      // Clean up any previous auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
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
