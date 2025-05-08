
import { ReactNode } from 'react';
import AuthContext from './AuthContext';
import { useAuthState } from './hooks/useAuthState';
import { useLogin } from './hooks/useLogin';
import { useSignup } from './hooks/useSignup';
import { useLogout } from './hooks/useLogout';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    user, 
    session, 
    isAuthenticated, 
    userProfile, 
    isSuperAdmin, 
    refreshUserProfile 
  } = useAuthState();
  
  const { login } = useLogin();
  const { signup } = useSignup(isSuperAdmin);
  const { logout } = useLogout();

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session, 
      login, 
      signup, 
      logout, 
      userProfile, 
      isSuperAdmin,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
