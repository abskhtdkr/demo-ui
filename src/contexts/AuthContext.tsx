import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserSession } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    const storedSession = localStorage.getItem('auth_session');

    if (storedUser && storedToken && storedSession) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setSession(JSON.parse(storedSession));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { user: authUser, token: authToken, session: userSession } = data;

      setUser(authUser);
      setToken(authToken);
      setSession(userSession);

      localStorage.setItem('auth_user', JSON.stringify(authUser));
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_session', JSON.stringify(userSession));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setSession(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_session');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        token
      }}
    >
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
