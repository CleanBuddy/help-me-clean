// ---------------------------------------------------------------------------
// Tests for src/screens/HomeScreen.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import HomeScreen from '../../screens/HomeScreen';

// ---------------------------------------------------------------------------
// Navigation mock is already set globally in setup.ts.
// We override useQuery per test to control data/loading/error states.
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockCompany = {
  id: 'company-1',
  companyName: 'CleanPro SRL',
  cui: 'RO12345',
  status: 'ACTIVE',
  ratingAvg: 4.7,
  totalJobsCompleted: 128,
};

const mockBookings = [
  {
    id: 'b1',
    serviceName: 'Curatenie generala',
    status: 'PENDING',
    client: { fullName: 'Ion Popescu' },
    scheduledDate: '2026-03-15',
    referenceCode: 'HMC-100',
  },
  {
    id: 'b2',
    serviceName: 'Curatenie dupa constructor',
    status: 'COMPLETED',
    client: { fullName: 'Ana Marin' },
    scheduledDate: '2026-03-14',
    referenceCode: 'HMC-101',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Configure the useQuery mock to return different results for each call.
 * HomeScreen calls useQuery twice: first for MY_COMPANY, second for COMPANY_BOOKINGS.
 */
function setupUseQuery({
  companyLoading = false,
  companyData = undefined as any,
  bookingsLoading = false,
  bookingsData = undefined as any,
  companyError = undefined as any,
}) {
  let callCount = 0;
  (useQuery as jest.Mock).mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // MY_COMPANY
      return {
        data: companyData,
        loading: companyLoading,
        error: companyError,
        refetch: jest.fn(),
      };
    }
    // COMPANY_BOOKINGS
    return {
      data: bookingsData,
      loading: bookingsLoading,
      error: undefined,
      refetch: jest.fn(),
    };
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HomeScreen', () => {
  // ---- Loading state -------------------------------------------------------

  it('shows an ActivityIndicator when company data is loading', () => {
    setupUseQuery({ companyLoading: true });

    const { UNSAFE_getByType } = render(<HomeScreen />);

    // ActivityIndicator should be present in the tree
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows "Company Dashboard" subtitle', () => {
    setupUseQuery({ companyLoading: false });
    render(<HomeScreen />);
    expect(screen.getByText('Company Dashboard')).toBeTruthy();
  });

  // ---- Company stats when data available -----------------------------------

  it('renders company name when company data is loaded', () => {
    setupUseQuery({
      companyData: { myCompany: mockCompany },
    });
    render(<HomeScreen />);
    expect(screen.getByText('CleanPro SRL')).toBeTruthy();
  });

  it('renders total jobs completed stat', () => {
    setupUseQuery({
      companyData: { myCompany: mockCompany },
    });
    render(<HomeScreen />);
    expect(screen.getByText('128')).toBeTruthy();
    expect(screen.getByText('Lucrari totale')).toBeTruthy();
  });

  it('renders rating stat', () => {
    setupUseQuery({
      companyData: { myCompany: mockCompany },
    });
    render(<HomeScreen />);
    expect(screen.getByText('4.7')).toBeTruthy();
    expect(screen.getByText('Rating')).toBeTruthy();
  });

  it('renders "--" for rating when ratingAvg is null', () => {
    setupUseQuery({
      companyData: {
        myCompany: { ...mockCompany, ratingAvg: null },
      },
    });
    render(<HomeScreen />);
    expect(screen.getByText('--')).toBeTruthy();
  });

  // ---- Fallback title when no company data ---------------------------------

  it('shows "HelpMeClean" as fallback title when no company data', () => {
    setupUseQuery({});
    render(<HomeScreen />);
    expect(screen.getByText('HelpMeClean')).toBeTruthy();
  });

  // ---- Recent bookings -----------------------------------------------------

  it('renders "Comenzi recente" section header', () => {
    setupUseQuery({});
    render(<HomeScreen />);
    expect(screen.getByText('Comenzi recente')).toBeTruthy();
  });

  it('renders recent bookings when data is available', () => {
    setupUseQuery({
      companyData: { myCompany: mockCompany },
      bookingsData: { companyBookings: { edges: mockBookings, totalCount: 2 } },
    });
    render(<HomeScreen />);

    expect(screen.getByText('Curatenie generala')).toBeTruthy();
    expect(screen.getByText('Curatenie dupa constructor')).toBeTruthy();
    expect(screen.getByText('Ion Popescu')).toBeTruthy();
    expect(screen.getByText('Ana Marin')).toBeTruthy();
  });

  it('renders booking reference codes', () => {
    setupUseQuery({
      bookingsData: { companyBookings: { edges: mockBookings, totalCount: 2 } },
    });
    render(<HomeScreen />);

    expect(screen.getByText(/HMC-100/)).toBeTruthy();
    expect(screen.getByText(/HMC-101/)).toBeTruthy();
  });

  // ---- Empty state when no bookings ----------------------------------------

  it('shows empty state message when there are no bookings', () => {
    setupUseQuery({
      companyData: { myCompany: mockCompany },
      bookingsData: { companyBookings: { edges: [], totalCount: 0 } },
    });
    render(<HomeScreen />);

    expect(screen.getByText('Nicio comanda inca.')).toBeTruthy();
  });

  // ---- Status badges shown for bookings ------------------------------------

  it('renders StatusBadge for each booking status', () => {
    setupUseQuery({
      bookingsData: { companyBookings: { edges: mockBookings, totalCount: 2 } },
    });
    render(<HomeScreen />);

    // PENDING -> "In asteptare", COMPLETED -> "Finalizat"
    expect(screen.getByText('In asteptare')).toBeTruthy();
    expect(screen.getByText('Finalizat')).toBeTruthy();
  });
});
