import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Utility wrapper that provides the AuthProvider to hooks under test.
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

// ---------------------------------------------------------------------------
// Re-type the mocked modules for type-safe assertions.
// ---------------------------------------------------------------------------
const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;
const mockUseLazyQuery = useLazyQuery as jest.Mock;
const mockUseMutation = useMutation as jest.Mock;
const mockUseApolloClient = useApolloClient as jest.Mock;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthContext', () => {
  const mockClearStore = jest.fn();
  const mockFetchMe = jest.fn();
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: no stored token
    mockGetItemAsync.mockResolvedValue(null);

    // useLazyQuery returns [fetchFn, result]
    mockUseLazyQuery.mockReturnValue([
      mockFetchMe,
      { data: undefined, loading: false },
    ]);

    // useMutation returns [mutateFn, result]
    mockUseMutation.mockReturnValue([mockSignIn, { loading: false }]);

    // useApolloClient
    mockUseApolloClient.mockReturnValue({ clearStore: mockClearStore });
  });

  // -----------------------------------------------------------------------
  // 1. Initial state
  // -----------------------------------------------------------------------
  describe('initial state', () => {
    it('starts with user as null and isAuthenticated as false', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('sets loading to true while bootstrapping', () => {
      // Make getItemAsync hang so loading stays true
      mockGetItemAsync.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Loading starts true
      expect(result.current.loading).toBe(true);
    });

    it('does not call fetchMe when there is no stored token', async () => {
      mockGetItemAsync.mockResolvedValue(null);

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockGetItemAsync).toHaveBeenCalledWith('token');
      });

      expect(mockFetchMe).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // 2. Login
  // -----------------------------------------------------------------------
  describe('login', () => {
    it('calls signIn mutation, stores token, and sets user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'cleaner@test.ro',
        fullName: 'Test Cleaner',
        role: 'CLEANER',
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

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loginDev('cleaner@test.ro');
      });

      // Verify mutation was called with correct variables
      expect(mockSignIn).toHaveBeenCalledWith({
        variables: { idToken: 'dev_cleaner@test.ro', role: 'CLEANER' },
      });

      // Verify token stored in SecureStore
      expect(mockSetItemAsync).toHaveBeenCalledWith('token', 'jwt-token-123');

      // Verify user is now set and authenticated
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // 3. Logout
  // -----------------------------------------------------------------------
  describe('logout', () => {
    it('clears token from SecureStore, sets user to null, and clears Apollo cache', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'cleaner@test.ro',
        fullName: 'Test Cleaner',
        role: 'CLEANER',
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

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.loginDev('cleaner@test.ro');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(mockDeleteItemAsync).toHaveBeenCalledWith('token');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockClearStore).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // 4. Token bootstrap (stored token triggers fetchMe)
  // -----------------------------------------------------------------------
  describe('token bootstrap with SecureStore', () => {
    it('calls fetchMe when a stored token exists', async () => {
      mockGetItemAsync.mockResolvedValue('stored-jwt');

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockFetchMe).toHaveBeenCalled();
      });
    });
  });

  // -----------------------------------------------------------------------
  // 5. useAuth outside provider
  // -----------------------------------------------------------------------
  describe('useAuth without provider', () => {
    it('throws an error when used outside AuthProvider', () => {
      // Silence the expected console.error from React about uncaught errors
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');

      spy.mockRestore();
    });
  });
});
