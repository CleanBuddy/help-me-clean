import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../screens/LoginScreen';

// ---------------------------------------------------------------------------
// Override useAuth for isolated screen tests
// ---------------------------------------------------------------------------

const mockLoginWithGoogle = jest.fn();
const mockLoginDev = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginDev: mockLoginDev,
      logout: mockLogout,
      isAuthenticated: false,
    }),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoginWithGoogle.mockResolvedValue(undefined);
    mockLoginDev.mockResolvedValue(undefined);
  });

  // -----------------------------------------------------------------------
  // Rendering (default = Google mode)
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('renders the app branding title "HelpMeClean"', () => {
      render(<LoginScreen />);
      expect(screen.getByText('HelpMeClean')).toBeTruthy();
    });

    it('renders the subtitle "Cleaner App"', () => {
      render(<LoginScreen />);
      expect(screen.getByText('Cleaner App')).toBeTruthy();
    });

    it('renders the Google sign-in button by default', () => {
      render(<LoginScreen />);
      expect(screen.getByText('Conecteaza-te cu Google')).toBeTruthy();
    });

    it('renders the dev mode toggle', () => {
      render(<LoginScreen />);
      expect(screen.getByText('Foloseste Dev Mode')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Google Sign-In
  // -----------------------------------------------------------------------
  describe('Google sign-in', () => {
    it('calls loginWithGoogle when Google button is pressed', async () => {
      render(<LoginScreen />);
      const button = screen.getByText('Conecteaza-te cu Google');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled();
      });
    });

    it('shows an error alert when Google sign-in fails', async () => {
      mockLoginWithGoogle.mockRejectedValue(new Error('Google error'));
      render(<LoginScreen />);

      const button = screen.getByText('Conecteaza-te cu Google');
      fireEvent.press(button);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Eroare',
          'Autentificarea Google a esuat. Te rugam sa incerci din nou.',
        );
      });
    });

    it('shows loading text "Se conecteaza..." while Google login is in progress', async () => {
      mockLoginWithGoogle.mockReturnValue(new Promise(() => {}));
      render(<LoginScreen />);

      const button = screen.getByText('Conecteaza-te cu Google');
      fireEvent.press(button);

      await waitFor(() => {
        expect(screen.getByText('Se conecteaza...')).toBeTruthy();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Dev Mode
  // -----------------------------------------------------------------------
  describe('dev mode', () => {
    it('switches to dev mode and shows email input', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText('Foloseste Dev Mode'));
      expect(screen.getByPlaceholderText('cleaner@helpmeclean.ro')).toBeTruthy();
    });

    it('shows email label "Adresa de email (Dev Mode)" in dev mode', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText('Foloseste Dev Mode'));
      expect(screen.getByText('Adresa de email (Dev Mode)')).toBeTruthy();
    });

    it('allows typing in the email field', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText('Foloseste Dev Mode'));
      const input = screen.getByPlaceholderText('cleaner@helpmeclean.ro');
      fireEvent.changeText(input, 'test@email.com');
      expect(input.props.value).toBe('test@email.com');
    });

    it('calls loginDev with the entered email when button is pressed', async () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText('Foloseste Dev Mode'));

      const input = screen.getByPlaceholderText('cleaner@helpmeclean.ro');
      fireEvent.changeText(input, 'cleaner@test.ro');

      const button = screen.getByText('Conecteaza-te (Dev)');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockLoginDev).toHaveBeenCalledWith('cleaner@test.ro');
      });
    });

    it('shows an alert when trying to login with an empty email', async () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText('Foloseste Dev Mode'));

      const button = screen.getByText('Conecteaza-te (Dev)');
      fireEvent.press(button);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Eroare',
          'Te rugam sa introduci adresa de email.',
        );
      });
    });

    it('shows an error alert when dev login fails', async () => {
      mockLoginDev.mockRejectedValue(new Error('Network error'));
      render(<LoginScreen />);
      fireEvent.press(screen.getByText('Foloseste Dev Mode'));

      const input = screen.getByPlaceholderText('cleaner@helpmeclean.ro');
      fireEvent.changeText(input, 'fail@test.ro');

      const button = screen.getByText('Conecteaza-te (Dev)');
      fireEvent.press(button);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Eroare',
          'Autentificarea a esuat. Te rugam sa incerci din nou.',
        );
      });
    });
  });
});
