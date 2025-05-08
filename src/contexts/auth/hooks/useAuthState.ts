
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types';

/**
 * Hook for managing authentication state
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching user profile for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      if (data) {
        console.log('User profile data received:', data);
        // Ensure we cast the data as UserProfile with all the required properties
        const profile: UserProfile = {
          id: data.id,
          username: data.username,
          role: data.role as 'super_admin' | 'admin',
          theme_color: data.theme_color,
          logo_url: data.logo_url,
          default_game_name: data.default_game_name,
          site_name: data.site_name || null,  // Handle the case where it doesn't exist yet in DB
          logo_width: data.logo_width || null  // Handle the case where it doesn't exist yet in DB
        };
        
        setUserProfile(profile);
        setIsSuperAdmin(profile.role === 'super_admin');
        console.log('Is super admin:', profile.role === 'super_admin');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  // Função para atualizar o perfil do usuário
  const refreshUserProfile = async () => {
    console.log('Refreshing user profile, current user:', user);
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    console.log('Setting up auth state change listener');
    // Primeiro configurar o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
      
      if (currentSession?.user) {
        console.log('User authenticated, fetching profile');
        setTimeout(() => {
          fetchUserProfile(currentSession.user.id);
        }, 0);
      } else {
        console.log('No user session, clearing profile');
        setUserProfile(null);
        setIsSuperAdmin(false);
      }
    });

    // Depois verificar a sessão atual
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Current session check:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
      
      if (currentSession?.user) {
        console.log('Existing user session found, fetching profile');
        fetchUserProfile(currentSession.user.id);
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isAuthenticated,
    userProfile,
    isSuperAdmin,
    fetchUserProfile,
    refreshUserProfile,
  };
};
