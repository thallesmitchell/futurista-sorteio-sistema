
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string | null;
  role: 'super_admin' | 'admin';
  theme_color: string | null;
  logo_url: string | null;
  default_game_name: string | null;
  site_name: string | null;
  logo_width: number | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, role?: 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}
