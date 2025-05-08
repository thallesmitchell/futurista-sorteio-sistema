
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create the context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
