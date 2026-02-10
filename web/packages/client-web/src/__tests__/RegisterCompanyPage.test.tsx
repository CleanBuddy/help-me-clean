import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import RegisterCompanyPage from '@/pages/RegisterCompanyPage';
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

describe('RegisterCompanyPage', () => {
  const defaultAuth = {
    user: null,
    loading: false,
    loginWithGoogle: vi.fn(),
    loginDev: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    refetchUser: vi.fn(),
  };

  let mockApplyFn: ReturnType<typeof vi.fn>;
  let mockClaimFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyFn = vi.fn();
    mockClaimFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ ...defaultAuth });

    // The component calls useMutation twice per render: first APPLY_AS_COMPANY, then CLAIM_COMPANY.
    // We use a counter that resets every 2 calls to handle re-renders correctly.
    let callCount = 0;
    vi.mocked(useMutation).mockImplementation(() => {
      const idx = callCount % 2;
      callCount++;
      if (idx === 0) {
        return [mockApplyFn, { loading: false }] as unknown as ReturnType<typeof useMutation>;
      }
      return [mockClaimFn, { loading: false }] as unknown as ReturnType<typeof useMutation>;
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/inregistrare']}>
        <RegisterCompanyPage />
      </MemoryRouter>,
    );

  it('renders form with required fields', () => {
    renderPage();
    expect(screen.getByText('Inregistreaza-ti firma')).toBeInTheDocument();
    expect(screen.getByLabelText(/nume firma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cui/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email contact/i)).toBeInTheDocument();
  });

  it('shows validation error when submitting without required fields', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /trimite cererea/i }));
    expect(screen.getByText('Te rugam sa completezi campurile obligatorii.')).toBeInTheDocument();
  });

  it('submits form successfully and shows success screen', async () => {
    mockApplyFn.mockResolvedValueOnce({
      data: {
        applyAsCompany: {
          company: { id: '1', companyName: 'Test SRL', status: 'PENDING_REVIEW' },
          claimToken: 'abc123',
        },
      },
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nume firma/i), 'Test SRL');
    await user.type(screen.getByLabelText(/cui/i), 'RO12345678');
    await user.type(screen.getByLabelText(/email contact/i), 'contact@test.ro');
    await user.click(screen.getByRole('button', { name: /trimite cererea/i }));

    expect(mockApplyFn).toHaveBeenCalledWith({
      variables: {
        input: expect.objectContaining({
          companyName: 'Test SRL',
          cui: 'RO12345678',
          contactEmail: 'contact@test.ro',
        }),
      },
    });
    expect(await screen.findByText('Cerere trimisa cu succes!')).toBeInTheDocument();
  });

  it('shows Google Sign-In on success when unauthenticated with claimToken', async () => {
    mockApplyFn.mockResolvedValueOnce({
      data: {
        applyAsCompany: {
          company: { id: '1', companyName: 'Test SRL', status: 'PENDING_REVIEW' },
          claimToken: 'abc123',
        },
      },
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nume firma/i), 'Test SRL');
    await user.type(screen.getByLabelText(/cui/i), 'RO12345678');
    await user.type(screen.getByLabelText(/email contact/i), 'contact@test.ro');
    await user.click(screen.getByRole('button', { name: /trimite cererea/i }));

    expect(await screen.findByTestId('google-login')).toBeInTheDocument();
  });

  it('shows claim URL after unauthenticated submission', async () => {
    mockApplyFn.mockResolvedValueOnce({
      data: {
        applyAsCompany: {
          company: { id: '1', companyName: 'Test SRL', status: 'PENDING_REVIEW' },
          claimToken: 'abc123',
        },
      },
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nume firma/i), 'Test SRL');
    await user.type(screen.getByLabelText(/cui/i), 'RO12345678');
    await user.type(screen.getByLabelText(/email contact/i), 'contact@test.ro');
    await user.click(screen.getByRole('button', { name: /trimite cererea/i }));

    await screen.findByText('Cerere trimisa cu succes!');
    expect(screen.getByText(/salveaza acest link/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/\/claim-firma\/abc123/)).toBeInTheDocument();
  });

  it('authenticated submission without claimToken shows simple success', async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', fullName: 'Admin', role: 'COMPANY_ADMIN', status: 'ACTIVE' },
    });

    mockApplyFn.mockResolvedValueOnce({
      data: {
        applyAsCompany: {
          company: { id: '1', companyName: 'Test SRL', status: 'PENDING_REVIEW' },
          claimToken: null,
        },
      },
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nume firma/i), 'Test SRL');
    await user.type(screen.getByLabelText(/cui/i), 'RO12345678');
    await user.type(screen.getByLabelText(/email contact/i), 'contact@test.ro');
    await user.click(screen.getByRole('button', { name: /trimite cererea/i }));

    expect(await screen.findByText('Cerere trimisa!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mergi la dashboard/i })).toBeInTheDocument();
  });

  it('shows mutation error when apply fails', async () => {
    mockApplyFn.mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nume firma/i), 'Test SRL');
    await user.type(screen.getByLabelText(/cui/i), 'RO12345678');
    await user.type(screen.getByLabelText(/email contact/i), 'contact@test.ro');
    await user.click(screen.getByRole('button', { name: /trimite cererea/i }));

    expect(await screen.findByText('Inregistrarea a esuat. Te rugam sa incerci din nou.')).toBeInTheDocument();
  });
});
