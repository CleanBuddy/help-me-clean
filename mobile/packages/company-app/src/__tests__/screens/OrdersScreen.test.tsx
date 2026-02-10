// ---------------------------------------------------------------------------
// Tests for src/screens/OrdersScreen.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import OrdersScreen from '../../screens/OrdersScreen';

// ---------------------------------------------------------------------------
// Navigation mock is already set globally in setup.ts.
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockOrders = [
  {
    id: 'o1',
    referenceCode: 'HMC-200',
    serviceName: 'Curatenie birouri',
    scheduledDate: '2026-04-01',
    scheduledStartTime: '08:00',
    estimatedDurationHours: 4,
    status: 'PENDING',
    estimatedTotal: 400,
    client: { id: 'c1', fullName: 'George Enescu' },
    cleaner: null,
    address: { streetAddress: 'Bd. Unirii 5', city: 'Bucuresti' },
  },
  {
    id: 'o2',
    referenceCode: 'HMC-201',
    serviceName: 'Curatenie apartament',
    scheduledDate: '2026-04-02',
    scheduledStartTime: '10:00',
    estimatedDurationHours: 2,
    status: 'COMPLETED',
    estimatedTotal: 180,
    client: { id: 'c2', fullName: 'Elena Vasilescu' },
    cleaner: { id: 'cl1', fullName: 'Mihai Popa' },
    address: { streetAddress: 'Str. Florilor 12', city: 'Cluj' },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupUseQuery({
  loading = false,
  orders = [] as typeof mockOrders,
  totalCount = 0,
}) {
  (useQuery as jest.Mock).mockReturnValue({
    data: orders.length > 0 || totalCount > 0
      ? { companyBookings: { edges: orders, totalCount } }
      : undefined,
    loading,
    error: undefined,
    refetch: jest.fn(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrdersScreen', () => {
  // ---- Loading state -------------------------------------------------------

  it('shows an ActivityIndicator when loading and no orders exist', () => {
    setupUseQuery({ loading: true });

    const { toJSON } = render(<OrdersScreen />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('ActivityIndicator');
  });

  // ---- Page header ---------------------------------------------------------

  it('renders the "Comenzi" title', () => {
    setupUseQuery({});
    render(<OrdersScreen />);
    expect(screen.getByText('Comenzi')).toBeTruthy();
  });

  it('renders total count summary text', () => {
    setupUseQuery({ orders: mockOrders, totalCount: 2 });
    render(<OrdersScreen />);
    expect(screen.getByText(/2 comenz/)).toBeTruthy();
  });

  // ---- Filter tabs ---------------------------------------------------------

  it('renders all status filter tabs', () => {
    setupUseQuery({});
    render(<OrdersScreen />);

    expect(screen.getByText('Toate')).toBeTruthy();
    expect(screen.getByText('In asteptare')).toBeTruthy();
    expect(screen.getByText('Confirmate')).toBeTruthy();
    expect(screen.getByText('In desfasurare')).toBeTruthy();
    expect(screen.getByText('Finalizate')).toBeTruthy();
  });

  it('filter tabs are pressable', () => {
    setupUseQuery({});
    render(<OrdersScreen />);

    const confirmateTab = screen.getByText('Confirmate');
    // Just verifying it can be pressed without crashing
    fireEvent.press(confirmateTab);
  });

  // ---- Order list rendering ------------------------------------------------

  it('renders the order list with service names', () => {
    setupUseQuery({ orders: mockOrders, totalCount: 2 });
    render(<OrdersScreen />);

    expect(screen.getByText('Curatenie birouri')).toBeTruthy();
    expect(screen.getByText('Curatenie apartament')).toBeTruthy();
  });

  it('renders client names in the order cards', () => {
    setupUseQuery({ orders: mockOrders, totalCount: 2 });
    render(<OrdersScreen />);

    expect(screen.getByText('George Enescu')).toBeTruthy();
    expect(screen.getByText('Elena Vasilescu')).toBeTruthy();
  });

  it('renders addresses in the order cards', () => {
    setupUseQuery({ orders: mockOrders, totalCount: 2 });
    render(<OrdersScreen />);

    expect(screen.getByText(/Bd. Unirii 5.*Bucuresti/)).toBeTruthy();
    expect(screen.getByText(/Str. Florilor 12.*Cluj/)).toBeTruthy();
  });

  it('renders reference codes for orders', () => {
    setupUseQuery({ orders: mockOrders, totalCount: 2 });
    render(<OrdersScreen />);

    expect(screen.getByText(/HMC-200/)).toBeTruthy();
    expect(screen.getByText(/HMC-201/)).toBeTruthy();
  });

  it('shows "Neasignat" for unassigned orders and cleaner name for assigned ones', () => {
    setupUseQuery({ orders: mockOrders, totalCount: 2 });
    render(<OrdersScreen />);

    expect(screen.getByText('Neasignat')).toBeTruthy();
    expect(screen.getByText('Mihai Popa')).toBeTruthy();
  });

  // ---- Empty state ---------------------------------------------------------

  it('shows empty state when no orders match the selected filter', () => {
    setupUseQuery({ orders: [], totalCount: 0 });
    render(<OrdersScreen />);

    expect(
      screen.getByText('Nicio comanda gasita pentru filtrul selectat.'),
    ).toBeTruthy();
  });

  // ---- Does NOT show spinner when loading but orders already exist ----------

  it('does not show a full-screen ActivityIndicator when loading but orders already exist', () => {
    // First render with data, then simulate refetch (loading=true, orders present)
    (useQuery as jest.Mock).mockReturnValue({
      data: { companyBookings: { edges: mockOrders, totalCount: 2 } },
      loading: true,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<OrdersScreen />);

    // Orders should still be visible
    expect(screen.getByText('Curatenie birouri')).toBeTruthy();
  });
});
