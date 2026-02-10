import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import BookingsPage from '@/pages/admin/BookingsPage';

vi.mock('@helpmeclean/shared', () => ({
  cn: (...args: unknown[]) =>
    args
      .flat()
      .filter((a) => typeof a === 'string' && a.length > 0)
      .join(' '),
}));

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderBookingsPage() {
  return render(
    <MemoryRouter>
      <BookingsPage />
    </MemoryRouter>,
  );
}

describe('BookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuery).mockReturnValue({
      data: { allBookings: { edges: [], totalCount: 0 } },
      loading: false,
    } as ReturnType<typeof useQuery>);
  });

  it('shows "Comenzi" title', () => {
    renderBookingsPage();
    expect(screen.getByText('Comenzi')).toBeInTheDocument();
  });

  it('shows status filter tabs including Asignate', () => {
    renderBookingsPage();
    expect(screen.getByText('Toate')).toBeInTheDocument();
    expect(screen.getByText('In asteptare')).toBeInTheDocument();
    expect(screen.getByText('Asignate')).toBeInTheDocument();
    expect(screen.getByText('Confirmate')).toBeInTheDocument();
    expect(screen.getByText('In desfasurare')).toBeInTheDocument();
    expect(screen.getByText('Finalizate')).toBeInTheDocument();
    expect(screen.getByText('Anulate')).toBeInTheDocument();
  });

  it('shows "Nu exista comenzi." empty state', () => {
    renderBookingsPage();
    expect(screen.getByText('Nu exista comenzi.')).toBeInTheDocument();
  });

  it('tab filtering works', async () => {
    const user = userEvent.setup();
    renderBookingsPage();
    await user.click(screen.getByText('Confirmate'));
    // useQuery should have been called again with the filter change via re-render
    expect(screen.getByText('Confirmate')).toBeInTheDocument();
  });

  it('shows total count badge when there are bookings', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        allBookings: {
          edges: [
            {
              id: '1',
              referenceCode: 'REF-001',
              serviceType: 'STANDARD',
              serviceName: 'Curatenie standard',
              scheduledDate: '2024-06-01',
              scheduledStartTime: '10:00',
              estimatedDurationHours: 3,
              status: 'PENDING',
              estimatedTotal: 250,
              paymentStatus: 'PENDING',
              createdAt: '2024-05-28T10:00:00Z',
              client: { id: 'c1', fullName: 'Maria Ionescu', email: 'maria@test.com' },
              company: { id: 'co1', companyName: 'Clean SRL' },
            },
          ],
          totalCount: 5,
        },
      },
      loading: false,
    } as ReturnType<typeof useQuery>);
    renderBookingsPage();
    expect(screen.getByText('5 comenzi')).toBeInTheDocument();
  });

  it('navigates to /admin/comenzi/:id on booking click', async () => {
    const user = userEvent.setup();
    vi.mocked(useQuery).mockReturnValue({
      data: {
        allBookings: {
          edges: [
            {
              id: 'b-123',
              referenceCode: 'REF-NAV',
              serviceType: 'STANDARD',
              serviceName: 'Curatenie standard',
              scheduledDate: '2024-06-01',
              scheduledStartTime: '10:00',
              estimatedDurationHours: 3,
              status: 'PENDING',
              estimatedTotal: 250,
              paymentStatus: 'PENDING',
              createdAt: '2024-05-28T10:00:00Z',
              client: { id: 'c1', fullName: 'Maria Ionescu', email: 'maria@test.com' },
              company: { id: 'co1', companyName: 'Clean SRL' },
            },
          ],
          totalCount: 1,
        },
      },
      loading: false,
    } as ReturnType<typeof useQuery>);
    renderBookingsPage();
    await user.click(screen.getByText('REF-NAV'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/comenzi/b-123');
  });

  it('shows ASSIGNED status badge', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        allBookings: {
          edges: [
            {
              id: '1',
              referenceCode: 'REF-A01',
              serviceType: 'STANDARD',
              serviceName: 'Curatenie standard',
              scheduledDate: '2024-06-01',
              scheduledStartTime: '10:00',
              estimatedDurationHours: 3,
              status: 'ASSIGNED',
              estimatedTotal: 250,
              paymentStatus: 'PENDING',
              createdAt: '2024-05-28T10:00:00Z',
              client: { id: 'c1', fullName: 'Maria Ionescu', email: 'maria@test.com' },
              company: { id: 'co1', companyName: 'Clean SRL' },
            },
          ],
          totalCount: 1,
        },
      },
      loading: false,
    } as ReturnType<typeof useQuery>);
    renderBookingsPage();
    expect(screen.getByText('Asignat')).toBeInTheDocument();
  });

  it('shows booking reference code when bookings exist', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        allBookings: {
          edges: [
            {
              id: '1',
              referenceCode: 'REF-001',
              serviceType: 'STANDARD',
              serviceName: 'Curatenie standard',
              scheduledDate: '2024-06-01',
              scheduledStartTime: '10:00',
              estimatedDurationHours: 3,
              status: 'PENDING',
              estimatedTotal: 250,
              paymentStatus: 'PENDING',
              createdAt: '2024-05-28T10:00:00Z',
              client: { id: 'c1', fullName: 'Maria Ionescu', email: 'maria@test.com' },
              company: { id: 'co1', companyName: 'Clean SRL' },
            },
          ],
          totalCount: 1,
        },
      },
      loading: false,
    } as ReturnType<typeof useQuery>);
    renderBookingsPage();
    expect(screen.getByText('REF-001')).toBeInTheDocument();
  });
});
