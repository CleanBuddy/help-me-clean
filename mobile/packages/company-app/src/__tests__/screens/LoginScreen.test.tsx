// ---------------------------------------------------------------------------
// Tests for src/screens/LoginScreen.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../screens/LoginScreen';

// ---------------------------------------------------------------------------
// Override useAuth for isolated screen tests
// ---------------------------------------------------------------------------

const mockLoginWithGoogle = jest.fn();
const mockLoginDev = jest.fn();

jest.mock('../../context/AuthContext', () => {
  const actual = jest.requireActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginDev: mockLoginDev,
      logout: jest.fn(),
      isAuthenticated: false,
    }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockLoginWithGoogle.mockResolvedValue(undefined);
  mockLoginDev.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LoginScreen', () => {
  // ---- Branding / title ----------------------------------------------------

  it('renders the app name "HelpMeClean"', () => {
    render(<LoginScreen />);
    expect(screen.getByText('HelpMeClean')).toBeTruthy();
  });

  it('renders the "Company App" subtitle', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Company App')).toBeTruthy();
  });

  // ---- Default Google mode -------------------------------------------------

  it('renders the Google sign-in button by default', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Conecteaza-te cu Google')).toBeTruthy();
  });

  it('renders the dev mode toggle', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Foloseste Dev Mode')).toBeTruthy();
  });

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

  it('shows loading text "Se conecteaza..." while login is in progress', async () => {
    mockLoginWithGoogle.mockImplementation(() => new Promise(() => {}));
    render(<LoginScreen />);

    const button = screen.getByText('Conecteaza-te cu Google');
    fireEvent.press(button);

    await waitFor(() => {
      expect(screen.getByText('Se conecteaza...')).toBeTruthy();
    });
  });

  // ---- Dev mode (toggled) --------------------------------------------------

  it('switches to dev mode and shows email input', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Foloseste Dev Mode'));
    expect(screen.getByPlaceholderText('admin@companie.ro')).toBeTruthy();
  });

  it('shows email label in dev mode', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Foloseste Dev Mode'));
    expect(screen.getByText('Adresa de email (Dev Mode)')).toBeTruthy();
  });

  // ---- Empty email validation ----------------------------------------------

  it('shows an alert when trying to login with empty email in dev mode', async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Foloseste Dev Mode'));

    const loginButton = screen.getByText('Conecteaza-te (Dev)');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Eroare',
        'Te rugam sa introduci adresa de email.',
      );
    });

    expect(mockLoginDev).not.toHaveBeenCalled();
  });

  // ---- Successful dev login ------------------------------------------------

  it('calls loginDev with the entered email', async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Foloseste Dev Mode'));

    const emailInput = screen.getByPlaceholderText('admin@companie.ro');
    fireEvent.changeText(emailInput, 'admin@firma.ro');

    const loginButton = screen.getByText('Conecteaza-te (Dev)');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLoginDev).toHaveBeenCalledWith('admin@firma.ro');
    });
  });

  // ---- Dev login failure ---------------------------------------------------

  it('shows an error alert when dev login throws', async () => {
    mockLoginDev.mockRejectedValue(new Error('Network error'));
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Foloseste Dev Mode'));

    const emailInput = screen.getByPlaceholderText('admin@companie.ro');
    fireEvent.changeText(emailInput, 'bad@email.ro');

    const loginButton = screen.getByText('Conecteaza-te (Dev)');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Eroare',
        'Autentificarea a esuat. Te rugam sa incerci din nou.',
      );
    });
  });
});
