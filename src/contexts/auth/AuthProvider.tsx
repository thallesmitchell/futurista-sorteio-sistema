
import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from './types';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from './hooks/useAuthState';

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  session: null,
  checkUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the auth state hook with initial state parameter
  const auth = useAuthState({ 
    isLoading: true,
    user: null,
    isAuthenticated: false
  });
  
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          if (session?.user) {
            auth.setUser(session.user);
            auth.setIsAuthenticated(true);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          auth.setUser(null);
          auth.setIsAuthenticated(false);
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

  // Provide the combined auth state and session
  const contextValue: AuthContextType = {
    ...auth,
    session,
    checkUser: auth.checkUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
