
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, AuthContextType } from './types';
import { useAuthState } from './hooks/useAuthState';
import AuthContext from './AuthContext';
import { useLogin } from './hooks/useLogin';
import { useLogout } from './hooks/useLogout';
import { useSignup } from './hooks/useSignup';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Use the auth state hook to manage authentication state
  const authState = useAuthState();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { signup } = useSignup();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);

  // Get user profile and check if super admin
  const refreshUserProfile = async () => {
    if (!authState.user) {
      setUserProfile(null);
      setIsSuperAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authState.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data as UserProfile);
      setIsSuperAdmin(data?.role === 'super_admin');
    } catch (error) {
      console.error('Error in refreshUserProfile:', error);
    }
  };

  // Effect to update session and check user profile when auth state changes
  useEffect(() => {
    if (authState.user) {
      setSession(authState.user.session || null);
      refreshUserProfile();
    } else {
      setUserProfile(null);
      setIsSuperAdmin(false);
      setSession(null);
    }
  }, [authState.user]);

  // Provide the complete auth context to children
  const authContext: AuthContextType = {
    ...authState,
    userProfile,
    isSuperAdmin,
    session,
    login,
    logout,
    signup,
    refreshUserProfile
  };
  
  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
