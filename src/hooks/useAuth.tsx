import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, signIn, signOut, onAuthChange } from '../services/supabase';

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: { nome?: string };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user as AuthUser | null);
      setLoading(false);
    });

    const unsubscribe = onAuthChange((user) => {
      setUser(user as AuthUser | null);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if ('data' in result && result.data?.user) {
      setUser(result.data.user as AuthUser);
    }
    return result;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}