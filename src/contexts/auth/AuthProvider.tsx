
import { ReactNode } from 'react';
import AuthContext from './AuthContext';
import { useAuthState } from './hooks/useAuthState';
import { useLogin } from './hooks/useLogin';
import { useSignup } from './hooks/useSignup';
import { useLogout } from './hooks/useLogout';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    checkUser 
  } = useAuthState();
  
  const { login } = useLogin();
  const { signup } = useSignup();
  const { logout } = useLogout();

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user,
      isLoading,
      checkUser,
      login, 
      signup, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
