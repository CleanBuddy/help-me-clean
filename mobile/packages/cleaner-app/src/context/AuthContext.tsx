import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useApolloClient, useMutation, useLazyQuery } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';
import { ME, SIGN_IN_WITH_GOOGLE } from '@helpmeclean-mobile/shared';
import { signInWithGoogle, signOutGoogle } from '../services/googleAuth';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginDev: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const apolloClient = useApolloClient();

  const [fetchMe] = useLazyQuery(ME, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setUser(data.me);
      setLoading(false);
    },
    onError: async () => {
      await SecureStore.deleteItemAsync('token');
      setUser(null);
      setLoading(false);
    },
  });

  const [signIn] = useMutation(SIGN_IN_WITH_GOOGLE);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        fetchMe();
      } else {
        setLoading(false);
      }
    })();
  }, [fetchMe]);

  const loginWithGoogle = useCallback(async () => {
    const idToken = await signInWithGoogle();
    const { data } = await signIn({
      variables: { idToken, role: 'CLEANER' },
    });
    const { token, user: authUser } = data.signInWithGoogle;
    await SecureStore.setItemAsync('token', token);
    setUser(authUser);
  }, [signIn]);

  const loginDev = useCallback(
    async (email: string) => {
      const { data } = await signIn({
        variables: { idToken: `dev_${email}`, role: 'CLEANER' },
      });
      const { token, user: authUser } = data.signInWithGoogle;
      await SecureStore.setItemAsync('token', token);
      setUser(authUser);
    },
    [signIn],
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
    await apolloClient.clearStore();
    await signOutGoogle();
  }, [apolloClient]);

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGoogle, loginDev, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
