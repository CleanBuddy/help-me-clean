import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import ClaimCompanyPage from '@/pages/ClaimCompanyPage';
import { useAuth } from '@/context/AuthContext';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(),
  };
});

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual<typeof import('@apollo/client')>('@apollo/client');
  return {
    ...actual,
    useMutation: vi.fn(),
  };
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ClaimCompanyPage', () => {
  const defaultAuth = {
    user: null,
    loading: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    refetchUser: vi.fn(),
    refreshToken: vi.fn(),
  };

  const mockClaimFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ ...defaultAuth });
    vi.mocked(useMutation).mockReturnValue([mockClaimFn, { loading: false }] as unknown as ReturnType<typeof useMutation>);
    vi.mocked(useParams).mockReturnValue({ token: 'test-token-123' });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/claim-firma/test-token-123']}>
        <ClaimCompanyPage />
      </MemoryRouter>,
    );

  it('shows invalid link message when no token', () => {
    vi.mocked(useParams).mockReturnValue({ token: undefined });
    renderPage();
    expect(screen.getByText('Link invalid')).toBeInTheDocument();
    expect(screen.getByText('Acest link de revendicare nu este valid.')).toBeInTheDocument();
  });

  it('shows Google Sign-In when not authenticated', () => {
    renderPage();
    expect(screen.getByText('Revendica firma')).toBeInTheDocument();
    expect(screen.getByTestId('google-login')).toBeInTheDocument();
  });

  it('shows loading when authenticated and claiming', () => {
    mockClaimFn.mockReturnValue(new Promise(() => {})); // never resolves — keeps loading
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', fullName: 'Admin', role: 'COMPANY_ADMIN', status: 'ACTIVE' },
    });
    vi.mocked(useMutation).mockReturnValue([mockClaimFn, { loading: false }] as unknown as ReturnType<typeof useMutation>);
    renderPage();
    expect(screen.getByText('Se asociaza firma cu contul tau...')).toBeInTheDocument();
    expect(mockClaimFn).toHaveBeenCalledWith({ variables: { claimToken: 'test-token-123' } });
  });

  it('shows success after claiming', async () => {
    mockClaimFn.mockResolvedValueOnce({
      data: {
        claimCompany: { id: '1', companyName: 'Test SRL', status: 'PENDING_REVIEW' },
      },
    });
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', fullName: 'Admin', role: 'COMPANY_ADMIN', status: 'ACTIVE' },
    });
    vi.mocked(useMutation).mockReturnValue([mockClaimFn, { loading: false }] as unknown as ReturnType<typeof useMutation>);
    renderPage();
    expect(await screen.findByText('Firma a fost asociata!')).toBeInTheDocument();
    expect(screen.getByText(/contul tau a fost asociat cu firma/i)).toBeInTheDocument();
  });

  it('shows error for invalid token', async () => {
    mockClaimFn.mockRejectedValueOnce(new Error('Invalid token'));
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', fullName: 'Admin', role: 'COMPANY_ADMIN', status: 'ACTIVE' },
    });
    vi.mocked(useMutation).mockReturnValue([mockClaimFn, { loading: false }] as unknown as ReturnType<typeof useMutation>);
    renderPage();
    expect(await screen.findByText('Link-ul este invalid sau firma a fost deja revendicata.')).toBeInTheDocument();
  });

  it('shows "Mergi la autentificare" button when no token', () => {
    vi.mocked(useParams).mockReturnValue({ token: undefined });
    renderPage();
    expect(screen.getByRole('button', { name: /mergi la autentificare/i })).toBeInTheDocument();
  });
});
