// ---------------------------------------------------------------------------
// Tests for src/screens/TeamScreen.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import TeamScreen from '../../screens/TeamScreen';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockInviteCleaner = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useMutation as jest.Mock).mockReturnValue([
    mockInviteCleaner,
    { loading: false },
  ]);
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockCleaners = [
  {
    id: 'cl-1',
    fullName: 'Maria Ionescu',
    phone: '0722333444',
    email: 'maria@test.ro',
    status: 'ACTIVE',
    ratingAvg: 4.8,
    totalJobsCompleted: 42,
  },
  {
    id: 'cl-2',
    fullName: 'Alexandru Radu',
    phone: null,
    email: 'alex@test.ro',
    status: 'PENDING',
    ratingAvg: null,
    totalJobsCompleted: 0,
  },
  {
    id: 'cl-3',
    fullName: 'Ioana Dima',
    phone: '0733555666',
    email: null,
    status: 'INACTIVE',
    ratingAvg: 3.5,
    totalJobsCompleted: 15,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupUseQuery({
  loading = false,
  cleaners = [] as typeof mockCleaners,
}) {
  (useQuery as jest.Mock).mockReturnValue({
    data: cleaners.length > 0 ? { myCleaners: cleaners } : undefined,
    loading,
    error: undefined,
    refetch: jest.fn(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TeamScreen', () => {
  // ---- Loading state -------------------------------------------------------

  it('shows an ActivityIndicator when loading and no cleaners exist', () => {
    setupUseQuery({ loading: true });

    const { toJSON } = render(<TeamScreen />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('ActivityIndicator');
  });

  // ---- Page header ---------------------------------------------------------

  it('renders the "Echipa" title', () => {
    setupUseQuery({});
    render(<TeamScreen />);
    expect(screen.getByText('Echipa')).toBeTruthy();
  });

  it('renders the cleaners count', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);
    expect(screen.getByText('3 curatenisti')).toBeTruthy();
  });

  it('uses singular form for 1 cleaner', () => {
    setupUseQuery({ cleaners: [mockCleaners[0]] });
    render(<TeamScreen />);
    expect(screen.getByText('1 curatenist')).toBeTruthy();
  });

  // ---- Invite button -------------------------------------------------------

  it('renders the invite button with "+ Invita" text', () => {
    setupUseQuery({});
    render(<TeamScreen />);
    expect(screen.getByText('+ Invita')).toBeTruthy();
  });

  it('invite button triggers Alert.prompt when pressed', () => {
    // Mock Alert.prompt since it is iOS-only and may not exist in test env
    const promptSpy = jest.fn();
    (Alert as any).prompt = promptSpy;

    setupUseQuery({});
    render(<TeamScreen />);

    fireEvent.press(screen.getByText('+ Invita'));

    expect(promptSpy).toHaveBeenCalledWith(
      'Invita curatenist',
      'Introdu numele complet:',
      expect.any(Function),
    );
  });

  // ---- Team member list ----------------------------------------------------

  it('renders the full names of all team members', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    expect(screen.getByText('Maria Ionescu')).toBeTruthy();
    expect(screen.getByText('Alexandru Radu')).toBeTruthy();
    expect(screen.getByText('Ioana Dima')).toBeTruthy();
  });

  it('renders email addresses when present', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    expect(screen.getByText('maria@test.ro')).toBeTruthy();
    expect(screen.getByText('alex@test.ro')).toBeTruthy();
  });

  it('renders phone numbers when present', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    expect(screen.getByText('0722333444')).toBeTruthy();
    expect(screen.getByText('0733555666')).toBeTruthy();
  });

  // ---- Status badges for cleaners ------------------------------------------

  it('shows "Activ" for ACTIVE cleaners', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    expect(screen.getByText('Activ')).toBeTruthy();
  });

  it('shows "In asteptare" for PENDING cleaners', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    // "In asteptare" appears in the team member status badge
    // Note: also appears in the status filter tabs if OrdersScreen is present,
    // but here we only render TeamScreen.
    expect(screen.getByText('In asteptare')).toBeTruthy();
  });

  it('shows the raw status string for other statuses (e.g., INACTIVE)', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    expect(screen.getByText('INACTIVE')).toBeTruthy();
  });

  // ---- Cleaner stats -------------------------------------------------------

  it('renders rating for cleaners that have one', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    expect(screen.getByText('Rating: 4.8')).toBeTruthy();
    expect(screen.getByText('Rating: 3.5')).toBeTruthy();
  });

  it('renders total jobs completed count', () => {
    setupUseQuery({ cleaners: mockCleaners });
    render(<TeamScreen />);

    expect(screen.getByText('42 lucrari finalizate')).toBeTruthy();
    expect(screen.getByText('0 lucrari finalizate')).toBeTruthy();
    expect(screen.getByText('15 lucrari finalizate')).toBeTruthy();
  });

  // ---- Empty state ---------------------------------------------------------

  it('shows empty state when there are no cleaners', () => {
    setupUseQuery({ cleaners: [] });
    render(<TeamScreen />);

    expect(screen.getByText('Niciun curatenist')).toBeTruthy();
    expect(
      screen.getByText(/Invita curatenisti in echipa ta/),
    ).toBeTruthy();
  });

  // ---- Does NOT show full-screen spinner when refreshing with data ---------

  it('does not show a full-screen ActivityIndicator when loading with existing data', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { myCleaners: mockCleaners },
      loading: true,
      error: undefined,
      refetch: jest.fn(),
    });

    render(<TeamScreen />);

    // Team members should still be visible
    expect(screen.getByText('Maria Ionescu')).toBeTruthy();
  });
});
