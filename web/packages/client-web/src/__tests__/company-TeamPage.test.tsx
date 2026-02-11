import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import TeamPage from '@/pages/company/TeamPage';
import { MY_CLEANERS } from '@/graphql/operations';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useLazyQuery: vi.fn(),
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultCleaner = {
  id: 'cl1',
  userId: 'u1',
  fullName: 'Ana Popa',
  email: 'ana@test.com',
  phone: '0711111111',
  avatarUrl: null,
  status: 'ACTIVE',
  isCompanyAdmin: false,
  inviteToken: null,
  ratingAvg: 4.5,
  totalJobsCompleted: 10,
  availability: [],
  createdAt: '2025-01-01',
};

function mockQueries(overrides?: { cleaners?: unknown[]; loading?: boolean }) {
  vi.mocked(useQuery).mockImplementation((query: unknown) => {
    if (query === MY_CLEANERS) {
      return {
        data: overrides?.cleaners !== undefined
          ? { myCleaners: overrides.cleaners }
          : { myCleaners: [] },
        loading: overrides?.loading ?? false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useQuery>;
    }
    return { data: null, loading: false, refetch: vi.fn() } as unknown as ReturnType<typeof useQuery>;
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMutation).mockReturnValue([vi.fn(), { loading: false }] as unknown as ReturnType<typeof useMutation>);
    vi.mocked(useLazyQuery).mockReturnValue([
      vi.fn(),
      { data: null, loading: false, called: false },
    ] as unknown as ReturnType<typeof useLazyQuery>);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <TeamPage />
      </MemoryRouter>,
    );

  it('shows page title "Echipa mea"', () => {
    mockQueries();
    renderPage();
    expect(screen.getByText('Echipa mea')).toBeInTheDocument();
  });

  it('shows "Invita cleaner" button', () => {
    mockQueries();
    renderPage();
    expect(screen.getByText('Invita cleaner')).toBeInTheDocument();
  });

  it('shows empty state when no cleaners', () => {
    mockQueries();
    renderPage();
    expect(screen.getByText('Niciun cleaner')).toBeInTheDocument();
    expect(screen.getByText(/nu ai adaugat inca niciun cleaner/i)).toBeInTheDocument();
  });

  it('shows cleaner cards with name, status badge, and rating', () => {
    mockQueries({ cleaners: [defaultCleaner] });
    renderPage();
    expect(screen.getByText('Ana Popa')).toBeInTheDocument();
    // Status badge "Activ" and status button "Activ" both appear
    const activElements = screen.getAllByText('Activ');
    expect(activElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('shows status change buttons for active cleaners', () => {
    mockQueries({ cleaners: [defaultCleaner] });
    renderPage();
    expect(screen.getByText('Schimba status')).toBeInTheDocument();
    expect(screen.getByText('Inactiv')).toBeInTheDocument();
    expect(screen.getByText('Suspendat')).toBeInTheDocument();
  });

  it('shows deactivate button for active cleaner', () => {
    mockQueries({ cleaners: [defaultCleaner] });
    renderPage();
    expect(screen.getByText('Dezactiveaza')).toBeInTheDocument();
  });

  it('shows invite modal when button clicked', async () => {
    const user = userEvent.setup();
    mockQueries();
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
    mockQueries();
    renderPage();
    const buttons = screen.getAllByText(/invita/i);
    await user.click(buttons[0]);
    expect(screen.getByLabelText(/nume complet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresa de email/i)).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    mockQueries({ loading: true });
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows details toggle button for cleaner', () => {
    mockQueries({ cleaners: [defaultCleaner] });
    renderPage();
    expect(screen.getByText('Detalii')).toBeInTheDocument();
  });
});
