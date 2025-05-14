
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from './types';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from './hooks/useAuthState';
import { useLogin } from './hooks/useLogin';
import { useSignup } from './hooks/useSignup';
import { useLogout } from './hooks/useLogout';
import AuthContext from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the auth state hook
  const auth = useAuthState({ 
    isLoading: true,
    user: null,
    isAuthenticated: false,
    userProfile: null,
    isSuperAdmin: false
  });
  
  const [session, setSession] = useState<Session | null>(null);
  const { login } = useLogin();
  const { signup } = useSignup(auth.isSuperAdmin);
  const { logout } = useLogout();

  // Function to refresh user profile data
  const refreshUserProfile = async () => {
    if (!auth.user) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', auth.user.id)
        .single();
        
      if (profileData) {
        auth.setUserProfile(profileData as UserProfile);
        auth.setIsSuperAdmin(profileData.role === 'super_admin');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          if (session?.user) {
            auth.setUser(session.user);
            auth.setIsAuthenticated(true);
            
            // Fetch user profile with setTimeout to prevent deadlocks
            setTimeout(async () => {
              try {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                  
                if (profileData) {
                  auth.setUserProfile(profileData as UserProfile);
                  auth.setIsSuperAdmin(profileData.role === 'super_admin');
                }
              } catch (error) {
                console.error('Error fetching user profile:', error);
              }
            }, 0);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          auth.setUser(null);
          auth.setIsAuthenticated(false);
          auth.setUserProfile(null);
          auth.setIsSuperAdmin(false);
          setSession(null);
        }
        
        auth.setIsLoading(false);
      }
    );

    // Check for session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSession(session);
          auth.setUser(session.user);
          auth.setIsAuthenticated(true);
          
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            auth.setUserProfile(profileData as UserProfile);
            auth.setIsSuperAdmin(profileData.role === 'super_admin');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        auth.setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Provide the complete auth context
  const contextValue: AuthContextType = {
    user: auth.user,
    session,
    userProfile: auth.userProfile,
    isAuthenticated: auth.isAuthenticated,
    isSuperAdmin: auth.isSuperAdmin,
    isLoading: auth.isLoading,
    login,
    signup,
    logout,
    checkUser: auth.checkUser,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
