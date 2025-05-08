
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for handling user logout
 */
export const useLogout = () => {
  const { toast } = useToast();

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

  const logout = async () => {
    try {
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

  return { logout };
};
