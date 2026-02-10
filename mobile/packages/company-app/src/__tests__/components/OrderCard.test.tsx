// ---------------------------------------------------------------------------
// Tests for src/components/OrderCard.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import OrderCard from '../../components/OrderCard';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseOrder = {
  id: 'order-1',
  referenceCode: 'HMC-001',
  serviceName: 'Curatenie generala',
  scheduledDate: '2026-03-15',
  scheduledStartTime: '09:00',
  estimatedDurationHours: 3,
  status: 'PENDING',
  estimatedTotal: 250,
  client: { id: 'client-1', fullName: 'Ion Popescu', email: 'ion@test.ro' },
  cleaner: null,
  address: { streetAddress: 'Str. Libertatii 10', city: 'Bucuresti' },
};

const assignedOrder = {
  ...baseOrder,
  id: 'order-2',
  status: 'ASSIGNED',
  cleaner: { id: 'cleaner-1', fullName: 'Maria Ionescu' },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrderCard', () => {
  // ---- Renders core order information --------------------------------------

  it('renders the service name', () => {
    render(<OrderCard order={baseOrder} onPress={jest.fn()} />);
    expect(screen.getByText('Curatenie generala')).toBeTruthy();
  });

  it('renders the reference code', () => {
    render(<OrderCard order={baseOrder} onPress={jest.fn()} />);
    expect(screen.getByText(/HMC-001/)).toBeTruthy();
  });

  it('renders the client full name', () => {
    render(<OrderCard order={baseOrder} onPress={jest.fn()} />);
    expect(screen.getByText('Ion Popescu')).toBeTruthy();
  });

  it('renders the address (street and city)', () => {
    render(<OrderCard order={baseOrder} onPress={jest.fn()} />);
    expect(screen.getByText(/Str. Libertatii 10.*Bucuresti/)).toBeTruthy();
  });

  it('renders the scheduled date, start time, and duration', () => {
    render(<OrderCard order={baseOrder} onPress={jest.fn()} />);
    // The component formats the date via toLocaleDateString('ro-RO')
    // and appends scheduledStartTime and duration.
    expect(screen.getByText(/09:00/)).toBeTruthy();
    expect(screen.getByText(/3h/)).toBeTruthy();
  });

  // ---- Client fallback when missing ----------------------------------------

  it('shows "--" when client is missing', () => {
    const orderWithoutClient = { ...baseOrder, client: undefined };
    render(<OrderCard order={orderWithoutClient as any} onPress={jest.fn()} />);
    expect(screen.getByText('--')).toBeTruthy();
  });

  // ---- Status badge --------------------------------------------------------

  it('renders a StatusBadge with the order status', () => {
    render(<OrderCard order={baseOrder} onPress={jest.fn()} />);
    // StatusBadge should render the Romanian label for PENDING
    expect(screen.getByText('In asteptare')).toBeTruthy();
  });

  // ---- Unassigned indicator ------------------------------------------------

  it('shows "Neasignat" when no cleaner is assigned', () => {
    render(<OrderCard order={baseOrder} onPress={jest.fn()} />);
    expect(screen.getByText('Neasignat')).toBeTruthy();
  });

  // ---- Cleaner assignment info ---------------------------------------------

  it('shows cleaner full name when a cleaner is assigned', () => {
    render(<OrderCard order={assignedOrder} onPress={jest.fn()} />);
    expect(screen.getByText('Maria Ionescu')).toBeTruthy();
  });

  it('does not show "Neasignat" when a cleaner is assigned', () => {
    render(<OrderCard order={assignedOrder} onPress={jest.fn()} />);
    expect(screen.queryByText('Neasignat')).toBeNull();
  });

  // ---- onPress callback ----------------------------------------------------

  it('calls onPress when the card is tapped', () => {
    const onPress = jest.fn();
    render(<OrderCard order={baseOrder} onPress={onPress} />);

    const card = screen.getByText('Curatenie generala');
    fireEvent.press(card);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // ---- Different statuses render correctly ---------------------------------

  it('renders correct badge for COMPLETED status', () => {
    const completedOrder = { ...baseOrder, status: 'COMPLETED' };
    render(<OrderCard order={completedOrder} onPress={jest.fn()} />);
    expect(screen.getByText('Finalizat')).toBeTruthy();
  });

  it('renders correct badge for IN_PROGRESS status', () => {
    const inProgressOrder = { ...baseOrder, status: 'IN_PROGRESS' };
    render(<OrderCard order={inProgressOrder} onPress={jest.fn()} />);
    expect(screen.getByText('In desfasurare')).toBeTruthy();
  });
});
