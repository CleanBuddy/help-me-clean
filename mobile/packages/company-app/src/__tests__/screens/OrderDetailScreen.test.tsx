// ---------------------------------------------------------------------------
// Tests for src/screens/OrderDetailScreen.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import OrderDetailScreen from '../../screens/OrderDetailScreen';

// ---------------------------------------------------------------------------
// Route mock -- useRoute is globally mocked in setup.ts to return
// { params: { orderId: 'test-order-1' } }
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockBooking = {
  id: 'test-order-1',
  referenceCode: 'HMC-500',
  serviceType: 'GENERAL',
  serviceName: 'Curatenie generala',
  scheduledDate: '2026-05-01',
  scheduledStartTime: '10:00',
  estimatedDurationHours: 3,
  propertyType: 'APARTMENT',
  numRooms: 3,
  numBathrooms: 1,
  areaSqm: 75,
  hasPets: true,
  specialInstructions: 'Atentie la coltul bucatariei',
  hourlyRate: 80,
  estimatedTotal: 240,
  finalTotal: null,
  status: 'PENDING',
  paymentStatus: 'UNPAID',
  client: {
    id: 'c1',
    fullName: 'Vasile Lupu',
    email: 'vasile@test.ro',
    phone: '0722111222',
  },
  company: { id: 'comp1', companyName: 'CleanPro' },
  cleaner: null,
  address: {
    streetAddress: 'Str. Victoriei 22',
    city: 'Iasi',
    county: 'Iasi',
    postalCode: '700100',
    floor: '3',
    apartment: '12',
  },
};

const mockBookingWithCleaner = {
  ...mockBooking,
  status: 'ASSIGNED',
  cleaner: {
    id: 'cl1',
    fullName: 'Diana Munteanu',
    phone: '0733444555',
  },
};

const mockAssignCleaner = jest.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Configure mocks for BOOKING_DETAIL and MY_CLEANERS queries,
 * plus the ASSIGN_CLEANER mutation.
 */
function setupMocks({
  booking = mockBooking as typeof mockBooking | null,
  loading = false,
  cleaners = [] as any[],
  cleanersLoading = false,
}) {
  (useQuery as jest.Mock).mockImplementation((query: string) => {
    if (query === 'BOOKING_DETAIL_QUERY') {
      // BOOKING_DETAIL
      return {
        data: booking ? { booking } : undefined,
        loading,
        error: undefined,
        refetch: jest.fn(),
      };
    }
    // MY_CLEANERS
    return {
      data: cleaners.length > 0 ? { myCleaners: cleaners } : undefined,
      loading: cleanersLoading,
      error: undefined,
      refetch: jest.fn(),
    };
  });

  (useMutation as jest.Mock).mockReturnValue([
    mockAssignCleaner,
    { loading: false },
  ]);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrderDetailScreen', () => {
  // ---- Loading state -------------------------------------------------------

  it('shows an ActivityIndicator while loading', () => {
    setupMocks({ booking: null, loading: true });

    const { toJSON } = render(<OrderDetailScreen />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('ActivityIndicator');
  });

  // ---- Service name and status badge ---------------------------------------

  it('renders the service name', () => {
    setupMocks({});
    render(<OrderDetailScreen />);
    expect(screen.getByText('Curatenie generala')).toBeTruthy();
  });

  it('renders the status badge for PENDING', () => {
    setupMocks({});
    render(<OrderDetailScreen />);
    expect(screen.getByText('In asteptare')).toBeTruthy();
  });

  // ---- Reference code ------------------------------------------------------

  it('renders the reference code', () => {
    setupMocks({});
    render(<OrderDetailScreen />);
    expect(screen.getByText(/HMC-500/)).toBeTruthy();
  });

  // ---- Schedule section ----------------------------------------------------

  it('renders the schedule section with date, time, and duration', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Programare')).toBeTruthy();
    expect(screen.getByText(/10:00/)).toBeTruthy();
    expect(screen.getByText(/3h/)).toBeTruthy();
  });

  // ---- Client section ------------------------------------------------------

  it('renders the client section with name, email, and phone', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Client')).toBeTruthy();
    expect(screen.getByText('Vasile Lupu')).toBeTruthy();
    expect(screen.getByText('vasile@test.ro')).toBeTruthy();
    expect(screen.getByText('0722111222')).toBeTruthy();
  });

  // ---- Address section -----------------------------------------------------

  it('renders the address section with street, city, county, floor, and apartment', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Adresa')).toBeTruthy();
    expect(screen.getByText('Str. Victoriei 22')).toBeTruthy();
    expect(screen.getByText(/Iasi.*Iasi/)).toBeTruthy();
    expect(screen.getByText(/Etaj: 3/)).toBeTruthy();
    expect(screen.getByText(/Ap: 12/)).toBeTruthy();
  });

  // ---- Cleaner section -- unassigned ---------------------------------------

  it('shows "Niciun curatenist asignat" when no cleaner is assigned', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Curatenist')).toBeTruthy();
    expect(screen.getByText('Niciun curatenist asignat')).toBeTruthy();
  });

  // ---- Cleaner section -- assigned -----------------------------------------

  it('shows the cleaner name and phone when a cleaner is assigned', () => {
    setupMocks({ booking: mockBookingWithCleaner });
    render(<OrderDetailScreen />);

    expect(screen.getByText('Diana Munteanu')).toBeTruthy();
    expect(screen.getByText('0733444555')).toBeTruthy();
  });

  // ---- Property section ----------------------------------------------------

  it('renders property details (type, rooms, area, pets)', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Proprietate')).toBeTruthy();
    expect(screen.getByText(/APARTMENT/)).toBeTruthy();
    expect(screen.getByText(/Camere: 3/)).toBeTruthy();
    expect(screen.getByText(/Bai: 1/)).toBeTruthy();
    expect(screen.getByText(/75 mp/)).toBeTruthy();
    expect(screen.getByText('Are animale de companie')).toBeTruthy();
  });

  // ---- Special instructions ------------------------------------------------

  it('renders special instructions when present', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Instructiuni speciale')).toBeTruthy();
    expect(screen.getByText('Atentie la coltul bucatariei')).toBeTruthy();
  });

  // ---- Financials section --------------------------------------------------

  it('renders financial details (hourly rate, estimated total, payment status)', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Financiar')).toBeTruthy();
    expect(screen.getByText(/80 RON\/h/)).toBeTruthy();
    expect(screen.getByText(/240 RON/)).toBeTruthy();
    expect(screen.getByText(/UNPAID/)).toBeTruthy();
  });

  // ---- Assign cleaner button -- shown for unassigned PENDING orders --------

  it('shows the "Asigneaza curatenist" button for unassigned PENDING orders', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    expect(screen.getByText('Asigneaza curatenist')).toBeTruthy();
  });

  // ---- Assign cleaner button -- hidden for assigned orders -----------------

  it('does NOT show the "Asigneaza curatenist" button when a cleaner is assigned', () => {
    setupMocks({ booking: mockBookingWithCleaner });
    render(<OrderDetailScreen />);

    expect(screen.queryByText('Asigneaza curatenist')).toBeNull();
  });

  // ---- Assign cleaner button -- hidden for COMPLETED orders ----------------

  it('does NOT show the "Asigneaza curatenist" button for COMPLETED orders', () => {
    const completedBooking = { ...mockBooking, status: 'COMPLETED' };
    setupMocks({ booking: completedBooking });
    render(<OrderDetailScreen />);

    expect(screen.queryByText('Asigneaza curatenist')).toBeNull();
  });

  // ---- Assign cleaner button -- hidden for CANCELLED orders ----------------

  it('does NOT show the "Asigneaza curatenist" button for CANCELLED_BY_CLIENT orders', () => {
    const cancelled = { ...mockBooking, status: 'CANCELLED_BY_CLIENT' };
    setupMocks({ booking: cancelled });
    render(<OrderDetailScreen />);

    expect(screen.queryByText('Asigneaza curatenist')).toBeNull();
  });

  it('does NOT show the "Asigneaza curatenist" button for CANCELLED_BY_COMPANY orders', () => {
    const cancelled = { ...mockBooking, status: 'CANCELLED_BY_COMPANY' };
    setupMocks({ booking: cancelled });
    render(<OrderDetailScreen />);

    expect(screen.queryByText('Asigneaza curatenist')).toBeNull();
  });

  it('does NOT show the "Asigneaza curatenist" button for CANCELLED_BY_ADMIN orders', () => {
    const cancelled = { ...mockBooking, status: 'CANCELLED_BY_ADMIN' };
    setupMocks({ booking: cancelled });
    render(<OrderDetailScreen />);

    expect(screen.queryByText('Asigneaza curatenist')).toBeNull();
  });

  // ---- Assign cleaner flow -------------------------------------------------

  it('opens the cleaner selection modal when "Asigneaza curatenist" is pressed', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    const assignButton = screen.getByText('Asigneaza curatenist');
    fireEvent.press(assignButton);

    expect(screen.getByText('Selecteaza curatenist')).toBeTruthy();
  });

  it('shows a close button in the cleaner modal', () => {
    setupMocks({});
    render(<OrderDetailScreen />);

    fireEvent.press(screen.getByText('Asigneaza curatenist'));

    expect(screen.getByText('Inchide')).toBeTruthy();
  });

  it('calls assignCleaner mutation when a cleaner is selected', async () => {
    const mockCleaners = [
      {
        id: 'cl-1',
        fullName: 'Andrei Stan',
        email: 'andrei@test.ro',
        status: 'ACTIVE',
        ratingAvg: 4.5,
        totalJobsCompleted: 20,
      },
    ];

    mockAssignCleaner.mockResolvedValue({ data: {} });

    setupMocks({ cleaners: mockCleaners });
    render(<OrderDetailScreen />);

    // Open the modal
    fireEvent.press(screen.getByText('Asigneaza curatenist'));

    // The cleaner list should display within the modal
    await waitFor(() => {
      expect(screen.getByText('Andrei Stan')).toBeTruthy();
    });

    // Tap on the cleaner to assign
    fireEvent.press(screen.getByText('Andrei Stan'));

    await waitFor(() => {
      expect(mockAssignCleaner).toHaveBeenCalledWith({
        variables: { bookingId: 'test-order-1', cleanerId: 'cl-1' },
      });
    });
  });

  it('shows success alert after assigning a cleaner', async () => {
    const mockCleaners = [
      {
        id: 'cl-2',
        fullName: 'Bogdan Ilie',
        status: 'ACTIVE',
        totalJobsCompleted: 5,
      },
    ];

    mockAssignCleaner.mockResolvedValue({ data: {} });

    setupMocks({ cleaners: mockCleaners });
    render(<OrderDetailScreen />);

    fireEvent.press(screen.getByText('Asigneaza curatenist'));
    await waitFor(() => {
      expect(screen.getByText('Bogdan Ilie')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Bogdan Ilie'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Succes',
        'Curatenistul a fost asignat cu succes.',
      );
    });
  });

  it('shows error alert if assignCleaner mutation fails', async () => {
    const mockCleaners = [
      {
        id: 'cl-3',
        fullName: 'Cristina Moise',
        status: 'ACTIVE',
        totalJobsCompleted: 0,
      },
    ];

    mockAssignCleaner.mockRejectedValue(new Error('Mutation failed'));

    setupMocks({ cleaners: mockCleaners });
    render(<OrderDetailScreen />);

    fireEvent.press(screen.getByText('Asigneaza curatenist'));
    await waitFor(() => {
      expect(screen.getByText('Cristina Moise')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Cristina Moise'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Eroare',
        'Nu s-a putut asigna curatenistul.',
      );
    });
  });

  // ---- Empty cleaner list in modal -----------------------------------------

  it('shows empty state in cleaner modal when there are no cleaners', () => {
    setupMocks({ cleaners: [] });
    render(<OrderDetailScreen />);

    fireEvent.press(screen.getByText('Asigneaza curatenist'));

    expect(screen.getByText('Nu ai curatenisti in echipa.')).toBeTruthy();
  });
});
