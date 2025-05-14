
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create the context with a default value that matches the full interface
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  checkUser: async () => {},
  refreshUserProfile: async () => {}
});

export default AuthContext;
