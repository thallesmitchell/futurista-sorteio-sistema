
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for handling user login
 */
export const useLogin = () => {
  const { toast } = useToast();

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

  return { login };
};
