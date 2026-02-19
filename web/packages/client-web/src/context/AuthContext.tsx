import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useApolloClient, type NormalizedCacheObject } from '@apollo/client';
import type { ApolloClient } from '@apollo/client';
import { authService, type AuthUser, type AuthState } from '@/services/AuthService';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  requestEmailOtp: (email: string, role?: string) => Promise<{ success: boolean; devCode?: string }>;
  loginWithEmailOtp: (email: string, code: string, role?: string) => Promise<AuthUser>;
  logout: () => void;
  isAuthenticated: boolean;
  refetchUser: () => void;
  refreshToken: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  // Lazy initializer reads current singleton state — safe after StrictMode remount.
  const [state, setState] = useState<AuthState>(() => authService.getState());

  useEffect(() => {
    authService.initialize(client as ApolloClient<NormalizedCacheObject>);
    // Re-read state in case it changed during the StrictMode unmount/remount gap.
    setState(authService.getState());
    // Subscribe and return the unsubscribe function as cleanup.
    return authService.subscribe(setState);
  }, [client]);

  const loginWithGoogle = useCallback(
    (idToken: string) => authService.loginWithGoogle(idToken),
    [],
  );
  const requestEmailOtp = useCallback(
    (email: string, role?: string) => authService.requestEmailOtp(email, role),
    [],
  );
  const loginWithEmailOtp = useCallback(
    (email: string, code: string, role?: string) => authService.loginWithEmailOtp(email, code, role),
    [],
  );
  const logout = useCallback(() => authService.logout(), []);
  const refetchUser = useCallback(() => authService.refetchUser(), []);
  const refreshToken = useCallback(() => authService.refreshToken(), []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        loginWithGoogle,
        requestEmailOtp,
        loginWithEmailOtp,
        logout,
        isAuthenticated: !!state.user,
        refetchUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
