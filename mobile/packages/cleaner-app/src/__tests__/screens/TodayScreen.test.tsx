import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import TodayScreen from '../../screens/TodayScreen';

// ---------------------------------------------------------------------------
// Re-type mocked modules
// ---------------------------------------------------------------------------
const mockUseQuery = useQuery as jest.Mock;

// ---------------------------------------------------------------------------
// Mock navigation
// ---------------------------------------------------------------------------
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockJob(overrides: Record<string, unknown> = {}) {
  return {
    id: 'job-1',
    referenceCode: 'HMC-2025-0042',
    serviceName: 'Curatenie generala',
    scheduledDate: '2025-06-15',
    scheduledStartTime: '09:00',
    estimatedDurationHours: 3,
    status: 'ASSIGNED',
    address: {
      streetAddress: 'Str. Victoriei 12',
      city: 'Bucuresti',
    },
    client: {
      fullName: 'Maria Popescu',
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TodayScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  describe('loading state', () => {
    it('shows an ActivityIndicator while loading and no data', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: jest.fn(),
      });

      const { toJSON } = render(<TodayScreen />);
      const tree = JSON.stringify(toJSON());

      // The screen renders "Comenzile de azi" header and an ActivityIndicator
      expect(screen.getByText('Comenzile de azi')).toBeTruthy();
      // ActivityIndicator should be present in the tree
      expect(tree).toContain('ActivityIndicator');
    });

    it('shows "Nicio comanda" subtitle when loading with no data', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('Nicio comanda')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Data loaded - with jobs
  // -----------------------------------------------------------------------
  describe('with jobs data', () => {
    it('renders the page title "Comenzile de azi"', () => {
      mockUseQuery.mockReturnValue({
        data: { todaysJobs: [createMockJob()] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('Comenzile de azi')).toBeTruthy();
    });

    it('shows the correct count for a single job', () => {
      mockUseQuery.mockReturnValue({
        data: { todaysJobs: [createMockJob()] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('1 comanda')).toBeTruthy();
    });

    it('shows the correct count for multiple jobs', () => {
      mockUseQuery.mockReturnValue({
        data: {
          todaysJobs: [
            createMockJob({ id: 'job-1' }),
            createMockJob({ id: 'job-2', serviceName: 'Curatenie birouri' }),
            createMockJob({ id: 'job-3', serviceName: 'Spalat geamuri' }),
          ],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('3 comande')).toBeTruthy();
    });

    it('renders job cards with service names', () => {
      mockUseQuery.mockReturnValue({
        data: {
          todaysJobs: [
            createMockJob({ id: 'job-1', serviceName: 'Curatenie generala' }),
            createMockJob({ id: 'job-2', serviceName: 'Curatenie birouri' }),
          ],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('Curatenie generala')).toBeTruthy();
      expect(screen.getByText('Curatenie birouri')).toBeTruthy();
    });

    it('renders job reference codes', () => {
      mockUseQuery.mockReturnValue({
        data: {
          todaysJobs: [createMockJob({ referenceCode: 'HMC-2025-0042' })],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('Ref: HMC-2025-0042')).toBeTruthy();
    });

    it('renders job addresses', () => {
      mockUseQuery.mockReturnValue({
        data: {
          todaysJobs: [createMockJob()],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('Str. Victoriei 12, Bucuresti')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------
  describe('empty state', () => {
    it('shows the empty state message when there are no jobs', () => {
      mockUseQuery.mockReturnValue({
        data: { todaysJobs: [] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(
        screen.getByText('Nicio comanda programata pentru azi.'),
      ).toBeTruthy();
    });

    it('shows the notification hint in the empty state', () => {
      mockUseQuery.mockReturnValue({
        data: { todaysJobs: [] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(
        screen.getByText('Vei fi notificat cand primesti o comanda noua.'),
      ).toBeTruthy();
    });

    it('shows "Nicio comanda" subtitle when there are no jobs', () => {
      mockUseQuery.mockReturnValue({
        data: { todaysJobs: [] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('Nicio comanda')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  describe('error state', () => {
    it('still renders the header even when there is an error', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: new Error('Network error'),
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      expect(screen.getByText('Comenzile de azi')).toBeTruthy();
    });

    it('shows the empty state when query errors with no data', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: new Error('Network error'),
        refetch: jest.fn(),
      });

      render(<TodayScreen />);
      // With no data and loading=false, the FlatList renders with empty array
      // and shows the ListEmptyComponent
      expect(
        screen.getByText('Nicio comanda programata pentru azi.'),
      ).toBeTruthy();
    });
  });
});
