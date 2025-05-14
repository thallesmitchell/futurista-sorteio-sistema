
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  isSuperAdmin: boolean;
}

type AuthStateHook = AuthState & {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsSuperAdmin: (value: boolean) => void;
  checkUser: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  userProfile: null,
  isSuperAdmin: false
};

export const useAuthState = (initialValues?: Partial<AuthState>): AuthStateHook => {
  const [user, setUser] = useState<User | null>(initialValues?.user ?? null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialValues?.isAuthenticated ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(initialValues?.isLoading ?? true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialValues?.userProfile ?? null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(initialValues?.isSuperAdmin ?? false);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user || null;
      
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      
      if (currentUser) {
        // Fetch user profile from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        if (profileData) {
          setUserProfile(profileData as UserProfile);
          setIsSuperAdmin(profileData.role === 'super_admin');
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    userProfile,
    isSuperAdmin,
    setUser,
    setIsAuthenticated,
    setIsLoading,
    setUserProfile,
    setIsSuperAdmin,
    checkUser
  };
};
