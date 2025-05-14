
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const currentUser = session?.user || null;
      
      setUser(currentUser);
      setSession(session);
      setIsAuthenticated(!!currentUser);
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    
    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      setSession(session);
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, isAuthenticated, isLoading, checkUser, session };
};
