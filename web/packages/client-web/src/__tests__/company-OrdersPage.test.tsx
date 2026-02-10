import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrdersPage from '@/pages/company/OrdersPage';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseQuery = vi.fn();

vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    );

  it('shows page title "Comenzi"', () => {
    mockUseQuery.mockReturnValue({
      data: { companyBookings: { edges: [], totalCount: 0, pageInfo: { hasNextPage: false } } },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Comenzi')).toBeInTheDocument();
  });

  it('shows filter tabs', () => {
    mockUseQuery.mockReturnValue({
      data: { companyBookings: { edges: [], totalCount: 0, pageInfo: { hasNextPage: false } } },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Toate')).toBeInTheDocument();
    expect(screen.getByText('In asteptare')).toBeInTheDocument();
    expect(screen.getByText('Confirmate')).toBeInTheDocument();
    expect(screen.getByText('In desfasurare')).toBeInTheDocument();
    expect(screen.getByText('Finalizate')).toBeInTheDocument();
    expect(screen.getByText('Anulate')).toBeInTheDocument();
  });

  it('shows empty state message when no bookings', () => {
    mockUseQuery.mockReturnValue({
      data: { companyBookings: { edges: [], totalCount: 0, pageInfo: { hasNextPage: false } } },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Nicio comanda')).toBeInTheDocument();
    expect(screen.getByText(/nu exista comenzi pentru filtrul selectat/i)).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
    });
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows booking cards with reference code, service name, and status badge', () => {
    mockUseQuery.mockReturnValue({
      data: {
        companyBookings: {
          edges: [
            {
              id: 'b1',
              referenceCode: 'ABC123',
              serviceType: 'STANDARD',
              serviceName: 'Curatenie generala',
              scheduledDate: '2025-03-15',
              scheduledStartTime: '10:00',
              estimatedTotal: '150',
              status: 'PENDING',
              client: { id: 'c1', fullName: 'Maria Ionescu', phone: '0700000000' },
              cleaner: null,
              address: { streetAddress: 'Str. Test 1', city: 'Bucuresti', county: 'Bucuresti' },
            },
          ],
          totalCount: 1,
          pageInfo: { hasNextPage: false },
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('#ABC123')).toBeInTheDocument();
    expect(screen.getByText(/curatenie generala/i)).toBeInTheDocument();
    // "In asteptare" appears both as a tab button and a status badge - verify both exist
    const inAsteptareElements = screen.getAllByText('In asteptare');
    expect(inAsteptareElements.length).toBeGreaterThanOrEqual(2);
  });

  it('shows total count', () => {
    mockUseQuery.mockReturnValue({
      data: {
        companyBookings: {
          edges: [
            {
              id: 'b1',
              referenceCode: 'ABC123',
              serviceType: 'STANDARD',
              serviceName: 'Curatenie generala',
              scheduledDate: '2025-03-15',
              scheduledStartTime: '10:00',
              estimatedTotal: '150',
              status: 'CONFIRMED',
              client: { id: 'c1', fullName: 'Maria Ionescu', phone: '0700000000' },
              cleaner: { id: 'cl1', fullName: 'Ana Popa' },
              address: { streetAddress: 'Str. Test 1', city: 'Bucuresti', county: 'Bucuresti' },
            },
          ],
          totalCount: 1,
          pageInfo: { hasNextPage: false },
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('1 comenzi gasite')).toBeInTheDocument();
  });
});
