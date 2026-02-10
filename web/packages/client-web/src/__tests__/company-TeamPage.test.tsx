import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TeamPage from '@/pages/company/TeamPage';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue([vi.fn(), { loading: false }]);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <TeamPage />
      </MemoryRouter>,
    );

  it('shows page title "Echipa mea"', () => {
    mockUseQuery.mockReturnValue({
      data: { myCleaners: [] },
      loading: false,
      refetch: vi.fn(),
    });
    renderPage();
    expect(screen.getByText('Echipa mea')).toBeInTheDocument();
  });

  it('shows "Invita cleaner" button', () => {
    mockUseQuery.mockReturnValue({
      data: { myCleaners: [] },
      loading: false,
      refetch: vi.fn(),
    });
    renderPage();
    expect(screen.getByText('Invita cleaner')).toBeInTheDocument();
  });

  it('shows empty state when no cleaners', () => {
    mockUseQuery.mockReturnValue({
      data: { myCleaners: [] },
      loading: false,
      refetch: vi.fn(),
    });
    renderPage();
    expect(screen.getByText('Niciun cleaner')).toBeInTheDocument();
    expect(screen.getByText(/nu ai adaugat inca niciun cleaner/i)).toBeInTheDocument();
  });

  it('shows cleaner cards with name, status badge, and rating', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCleaners: [
          {
            id: 'cl1',
            fullName: 'Ana Popa',
            email: 'ana@test.com',
            phone: '0711111111',
            avatarUrl: null,
            status: 'ACTIVE',
            isCompanyAdmin: false,
            ratingAvg: 4.5,
            totalJobsCompleted: 10,
            createdAt: '2025-01-01',
          },
        ],
      },
      loading: false,
      refetch: vi.fn(),
    });
    renderPage();
    expect(screen.getByText('Ana Popa')).toBeInTheDocument();
    expect(screen.getByText('Activ')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('shows invite modal when button clicked', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: { myCleaners: [] },
      loading: false,
      refetch: vi.fn(),
    });
    renderPage();
    // Click the first "Invita" button to open the modal
    const buttons = screen.getAllByText(/invita/i);
    await user.click(buttons[0]);
    // Modal title "Invita cleaner" is now visible along with the button text
    const invitaCleanerElements = screen.getAllByText(/invita cleaner/i);
    expect(invitaCleanerElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Trimite invitatie')).toBeInTheDocument();
  });

  it('invite form has name and email inputs', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: { myCleaners: [] },
      loading: false,
      refetch: vi.fn(),
    });
    renderPage();
    const buttons = screen.getAllByText(/invita/i);
    await user.click(buttons[0]);
    expect(screen.getByLabelText(/nume complet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresa de email/i)).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: vi.fn(),
    });
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
