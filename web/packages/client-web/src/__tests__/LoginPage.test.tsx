import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';

// Mock @react-oauth/google
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: (props: { onSuccess: (r: { credential: string }) => void; onError: () => void }) => (
    <button
      data-testid="google-login"
      onClick={() => props.onSuccess({ credential: 'mock-google-token' })}
    >
      Sign in with Google
    </button>
  ),
}));

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    loginWithGoogle: vi.fn(),
    loginDev: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    refetchUser: vi.fn(),
  })),
}));

const mockUseAuth = vi.mocked(useAuth);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  let mockLoginWithGoogle: ReturnType<typeof vi.fn>;
  let mockLoginDev: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginWithGoogle = vi.fn().mockResolvedValue({ role: 'CLIENT' });
    mockLoginDev = vi.fn().mockResolvedValue({ role: 'CLIENT' });
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginDev: mockLoginDev,
      logout: vi.fn(),
      isAuthenticated: false,
      refetchUser: vi.fn(),
    });
  });

  it('renders the page title "Autentificare"', () => {
    renderLoginPage();
    expect(screen.getByText('Autentificare')).toBeInTheDocument();
  });

  // In DEV environment, dev mode is shown by default with the test user picker
  it('shows test user picker grid in dev mode by default', () => {
    renderLoginPage();
    expect(screen.getByText('Clienti')).toBeInTheDocument();
    expect(screen.getByText('Company Admins')).toBeInTheDocument();
    expect(screen.getByText('Cleaneri')).toBeInTheDocument();
    expect(screen.getByText('Admin Global')).toBeInTheDocument();
  });

  it('shows all 11 test users in the picker', () => {
    renderLoginPage();
    expect(screen.getByText('Maria Popescu')).toBeInTheDocument();
    expect(screen.getByText('Ion Ionescu')).toBeInTheDocument();
    expect(screen.getByText('Elena Dumitrescu')).toBeInTheDocument();
    expect(screen.getByText('Alexandru Firma')).toBeInTheDocument();
    expect(screen.getByText('Cristina Business')).toBeInTheDocument();
    expect(screen.getByText('Mihai Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Ana Curatenie')).toBeInTheDocument();
    expect(screen.getByText('Bogdan Muncitor')).toBeInTheDocument();
    expect(screen.getByText('Diana Igienizare')).toBeInTheDocument();
    expect(screen.getByText('Admin Principal')).toBeInTheDocument();
    expect(screen.getByText('Admin Secundar')).toBeInTheDocument();
  });

  it('calls loginDev with email and role when test user card is clicked', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByText('Maria Popescu'));
    expect(mockLoginDev).toHaveBeenCalledWith('maria.client@test.dev', 'CLIENT');
  });

  it('calls loginDev with COMPANY_ADMIN role for company admin card', async () => {
    mockLoginDev.mockResolvedValue({ role: 'COMPANY_ADMIN' });
    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByText('Alexandru Firma'));
    expect(mockLoginDev).toHaveBeenCalledWith('alex.company@test.dev', 'COMPANY_ADMIN');
  });

  it('calls loginDev with GLOBAL_ADMIN role for admin card', async () => {
    mockLoginDev.mockResolvedValue({ role: 'GLOBAL_ADMIN' });
    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByText('Admin Principal'));
    expect(mockLoginDev).toHaveBeenCalledWith('admin@test.dev', 'GLOBAL_ADMIN');
  });

  it('navigates to correct role home after clicking test user', async () => {
    mockLoginDev.mockResolvedValue({ role: 'COMPANY_ADMIN' });
    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByText('Alexandru Firma'));
    expect(mockNavigate).toHaveBeenCalledWith('/firma', { replace: true });
  });

  it('shows manual email input in dev mode', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText('email@exemplu.com')).toBeInTheDocument();
  });

  it('shows error when submitting empty manual email', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    const submitButton = screen.getByRole('button', { name: /conecteaza-te/i });
    await user.click(submitButton);
    expect(
      screen.getByText('Te rugam sa introduci adresa de email.'),
    ).toBeInTheDocument();
    expect(mockLoginDev).not.toHaveBeenCalled();
  });

  it('calls loginDev with CLIENT role on manual email submit', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    const emailInput = screen.getByPlaceholderText('email@exemplu.com');
    await user.type(emailInput, '  test@example.com  ');
    const submitButton = screen.getByRole('button', { name: /conecteaza-te/i });
    await user.click(submitButton);
    expect(mockLoginDev).toHaveBeenCalledWith('test@example.com', 'CLIENT');
  });

  it('switches to Google Auth mode when toggle is clicked', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByText('Foloseste Google Auth'));
    expect(screen.getByTestId('google-login')).toBeInTheDocument();
  });

  it('calls loginWithGoogle when Google button is clicked', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    // Switch to Google Auth
    await user.click(screen.getByText('Foloseste Google Auth'));
    await user.click(screen.getByTestId('google-login'));
    expect(mockLoginWithGoogle).toHaveBeenCalledWith('mock-google-token');
  });

  it('shows error message when loginDev fails', async () => {
    mockLoginDev.mockRejectedValue(new Error('Auth failed'));
    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByText('Maria Popescu'));
    expect(
      await screen.findByText(
        'Autentificarea a esuat. Te rugam sa incerci din nou.',
      ),
    ).toBeInTheDocument();
  });

  it('redirects CLIENT to /cont when already authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@test.com',
        fullName: 'Test',
        role: 'CLIENT',
        status: 'ACTIVE',
      },
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginDev: mockLoginDev,
      logout: vi.fn(),
      isAuthenticated: true,
      refetchUser: vi.fn(),
    });
    renderLoginPage();
    expect(mockNavigate).toHaveBeenCalledWith('/cont', { replace: true });
  });

  it('redirects COMPANY_ADMIN to /firma when already authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '2',
        email: 'admin@firma.ro',
        fullName: 'Admin',
        role: 'COMPANY_ADMIN',
        status: 'ACTIVE',
      },
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginDev: mockLoginDev,
      logout: vi.fn(),
      isAuthenticated: true,
      refetchUser: vi.fn(),
    });
    renderLoginPage();
    expect(mockNavigate).toHaveBeenCalledWith('/firma', { replace: true });
  });

  it('redirects GLOBAL_ADMIN to /admin when already authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '3',
        email: 'admin@helpmeclean.ro',
        fullName: 'Global Admin',
        role: 'GLOBAL_ADMIN',
        status: 'ACTIVE',
      },
      loading: false,
      loginWithGoogle: mockLoginWithGoogle,
      loginDev: mockLoginDev,
      logout: vi.fn(),
      isAuthenticated: true,
      refetchUser: vi.fn(),
    });
    renderLoginPage();
    expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
  });
});
