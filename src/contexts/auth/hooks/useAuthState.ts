
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get user role from profile
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, username, theme_color')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return null;
    }
  }, []);

  // Check if the current user is authenticated
  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user role from profile
        const profileData = await fetchUserRole(user.id);
        
        if (profileData) {
          // Add role and other profile data to user metadata
          const enhancedUser = {
            ...user,
            userMetadata: {
              ...user.user_metadata,
              role: profileData.role,
              username: profileData.username,
              themeColor: profileData.theme_color
            }
          };
          
          setUser(enhancedUser);
          setIsAuthenticated(true);
          
          // Store user in localStorage (for role checks without re-fetching)
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            role: profileData.role,
          }));
        } else {
          setUser(user);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserRole]);

  // Check user on initial load
  useEffect(() => {
    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser]);

  return { user, isAuthenticated, isLoading, checkUser };
};
