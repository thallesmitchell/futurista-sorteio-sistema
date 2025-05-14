
import { ReactNode, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import AuthContext from './AuthContext';
import { useAuthState } from './hooks/useAuthState';
import { useLogin } from './hooks/useLogin';
import { useSignup } from './hooks/useSignup';
import { useLogout } from './hooks/useLogout';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    checkUser 
  } = useAuthState();
  
  const { login } = useLogin();
  const { signup } = useSignup();
  const { logout } = useLogout();

  const refreshUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      setIsSuperAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserProfile(data as UserProfile);
      setIsSuperAdmin(data?.role === 'super_admin');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setIsSuperAdmin(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshUserProfile();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user,
      session,
      userProfile,
      isSuperAdmin,
      isLoading,
      checkUser,
      login, 
      signup, 
      logout,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
