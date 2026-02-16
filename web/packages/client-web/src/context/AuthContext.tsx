import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useApolloClient, useMutation, useLazyQuery } from '@apollo/client';
import { ME, SIGN_IN_WITH_GOOGLE, LOGOUT } from '@/graphql/operations';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (idToken: string) => Promise<User>;
  loginDev: (email: string, role?: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  refetchUser: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  const [fetchMe] = useLazyQuery(ME, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setUser(data.me);
      setLoading(false);
    },
    onError: () => {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    },
  });

  const [signIn] = useMutation(SIGN_IN_WITH_GOOGLE);
  const [logoutMutation] = useMutation(LOGOUT);

  // On mount, always try to fetch user (cookie is sent automatically)
  // This works for both new cookie-based auth and legacy localStorage tokens
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<User> => {
      const { data } = await signIn({
        variables: { idToken, role: 'CLIENT' },
      });
      const { user: authUser } = data.signInWithGoogle;
      // Token is now set as httpOnly cookie by backend (Phase 2 security)
      // No need to store in localStorage
      setUser(authUser);
      return authUser;
    },
    [signIn],
  );

  const loginDev = useCallback(
    async (email: string, role: string = 'CLIENT'): Promise<User> => {
      const { data } = await signIn({
        variables: { idToken: `dev_${email}`, role },
      });
      const { user: authUser } = data.signInWithGoogle;
      // Token is now set as httpOnly cookie by backend (Phase 2 security)
      // No need to store in localStorage
      setUser(authUser);
      return authUser;
    },
    [signIn],
  );

  const logout = useCallback(async () => {
    try {
      // Call logout mutation to clear httpOnly cookie on server
      await logoutMutation();
    } catch (error) {
      console.error('Logout mutation failed:', error);
      // Continue with client-side cleanup even if mutation fails
    }

    // Clean up legacy localStorage token (for users with old tokens)
    localStorage.removeItem('token');

    // Clear local state
    setUser(null);
    client.clearStore();
  }, [client, logoutMutation]);

  const refetchUser = useCallback(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginDev,
        logout,
        isAuthenticated: !!user,
        refetchUser,
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
