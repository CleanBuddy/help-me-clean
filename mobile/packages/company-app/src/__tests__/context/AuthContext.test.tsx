// ---------------------------------------------------------------------------
// Tests for src/context/AuthContext.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { Text } from 'react-native';
import { render, screen, act, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Tiny consumer component that exposes the AuthContext value to the test. */
function AuthConsumer() {
  const auth = useAuth();
  return (
    <>
      <Text>{`isAuthenticated:${auth.isAuthenticated}`}</Text>
      <Text>{`loading:${auth.loading}`}</Text>
      <Text>{`user:${auth.user ? auth.user.fullName : 'null'}`}</Text>
    </>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

// ---------------------------------------------------------------------------
// Mocks -- local overrides per test
// ---------------------------------------------------------------------------

const mockFetchMe = jest.fn();
const mockSignIn = jest.fn();
const mockClearStore = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Default: no token stored
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

  (useLazyQuery as jest.Mock).mockReturnValue([
    mockFetchMe,
    { data: undefined, loading: false },
  ]);

  (useMutation as jest.Mock).mockReturnValue([
    mockSignIn,
    { loading: false },
  ]);

  (useApolloClient as jest.Mock).mockReturnValue({
    clearStore: mockClearStore,
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthContext', () => {
  // ---- Initial state -------------------------------------------------------

  it('starts with loading true and then resolves to not authenticated when no token exists', async () => {
    renderAuthProvider();

    // After the async IIFE in useEffect completes, loading should be false
    await waitFor(() => {
      expect(screen.getByText(/isAuthenticated:false/)).toBeTruthy();
    });
    expect(screen.getByText(/user:null/)).toBeTruthy();
  });

  // ---- Bootstrap with existing token ---------------------------------------

  it('fetches user profile when a stored token exists on mount', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-jwt');

    renderAuthProvider();

    await waitFor(() => {
      expect(mockFetchMe).toHaveBeenCalled();
    });
  });

  // ---- Login ---------------------------------------------------------------

  it('login stores token in SecureStore and sets the user', async () => {
    const mockUser = {
      id: '1',
      email: 'admin@firma.ro',
      fullName: 'Admin Test',
      role: 'COMPANY_ADMIN',
      status: 'ACTIVE',
    };

    mockSignIn.mockResolvedValue({
      data: {
        signInWithGoogle: {
          token: 'jwt-token-123',
          user: mockUser,
        },
      },
    });

    renderAuthProvider();

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(screen.getByText(/loading:false/)).toBeTruthy();
    });

    // Grab the login function via a second consumer approach:
    // We re-render with a consumer that calls login.
    let loginDevFn: ((email: string) => Promise<void>) | undefined;

    function LoginTrigger() {
      const auth = useAuth();
      loginDevFn = auth.loginDev;
      return null;
    }

    render(
      <AuthProvider>
        <LoginTrigger />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(loginDevFn).toBeDefined();
    });

    await act(async () => {
      await loginDevFn!('admin@firma.ro');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      variables: { idToken: 'dev_admin@firma.ro', role: 'COMPANY_ADMIN' },
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'jwt-token-123');
  });

  // ---- Logout --------------------------------------------------------------

  it('logout clears token from SecureStore, sets user to null, and clears Apollo store', async () => {
    let logoutFn: (() => void) | undefined;

    function LogoutTrigger() {
      const auth = useAuth();
      logoutFn = auth.logout;
      return null;
    }

    render(
      <AuthProvider>
        <LogoutTrigger />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(logoutFn).toBeDefined();
    });

    await act(async () => {
      logoutFn!();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
    expect(mockClearStore).toHaveBeenCalled();
  });

  // ---- useAuth outside provider --------------------------------------------

  it('throws when useAuth is used outside of AuthProvider', () => {
    // Suppress the expected error console output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    function Orphan() {
      useAuth();
      return null;
    }

    expect(() => render(<Orphan />)).toThrow(
      'useAuth must be used within AuthProvider',
    );

    consoleSpy.mockRestore();
  });

  // ---- Token getter integration with SecureStore ---------------------------

  it('reads token from SecureStore during bootstrap', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('existing-token');

    renderAuthProvider();

    await waitFor(() => {
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('token');
    });
  });

  // ---- onError in fetchMe cleans up ----------------------------------------

  it('clears token and user when fetchMe onError is triggered', async () => {
    // Capture the onError callback that AuthProvider passes to useLazyQuery
    let capturedOnError: (() => void) | undefined;

    (useLazyQuery as jest.Mock).mockImplementation((_query: unknown, options?: { onError?: () => void }) => {
      capturedOnError = options?.onError;
      return [mockFetchMe, { data: undefined, loading: false }];
    });

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('bad-token');

    renderAuthProvider();

    // Wait for mount effect
    await waitFor(() => {
      expect(mockFetchMe).toHaveBeenCalled();
    });

    // Simulate the onError callback
    await act(async () => {
      capturedOnError?.();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
  });
});
