
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for handling user signup
 */
export const useSignup = (isSuperAdmin: boolean) => {
  const { toast } = useToast();

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

  return { signup };
};
