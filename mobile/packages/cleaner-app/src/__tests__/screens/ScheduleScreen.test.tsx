import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import ScheduleScreen from '../../screens/ScheduleScreen';

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
    referenceCode: 'HMC-2025-0100',
    serviceName: 'Curatenie generala',
    scheduledDate: '2025-06-20',
    scheduledStartTime: '10:00',
    estimatedDurationHours: 2,
    status: 'ASSIGNED',
    address: {
      streetAddress: 'Str. Libertatii 5',
      city: 'Timisoara',
    },
    client: {
      fullName: 'Elena Vasile',
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ScheduleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  describe('loading state', () => {
    it('shows an ActivityIndicator while loading with no data', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: jest.fn(),
      });

      const { toJSON } = render(<ScheduleScreen />);
      const tree = JSON.stringify(toJSON());

      expect(screen.getByText('Program')).toBeTruthy();
      expect(tree).toContain('ActivityIndicator');
    });
  });

  // -----------------------------------------------------------------------
  // Header
  // -----------------------------------------------------------------------
  describe('header', () => {
    it('renders the title "Program"', () => {
      mockUseQuery.mockReturnValue({
        data: { myAssignedJobs: [] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Program')).toBeTruthy();
    });

    it('renders the subtitle "Toate comenzile tale viitoare"', () => {
      mockUseQuery.mockReturnValue({
        data: { myAssignedJobs: [] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Toate comenzile tale viitoare')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // With jobs data
  // -----------------------------------------------------------------------
  describe('with assigned jobs', () => {
    it('renders job cards with their service names', () => {
      mockUseQuery.mockReturnValue({
        data: {
          myAssignedJobs: [
            createMockJob({ id: 'job-1', serviceName: 'Curatenie generala' }),
            createMockJob({ id: 'job-2', serviceName: 'Curatenie birouri' }),
          ],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Curatenie generala')).toBeTruthy();
      expect(screen.getByText('Curatenie birouri')).toBeTruthy();
    });

    it('renders job addresses', () => {
      mockUseQuery.mockReturnValue({
        data: {
          myAssignedJobs: [createMockJob()],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Str. Libertatii 5, Timisoara')).toBeTruthy();
    });

    it('renders the client name in the job details', () => {
      mockUseQuery.mockReturnValue({
        data: {
          myAssignedJobs: [createMockJob()],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText(/Elena Vasile/)).toBeTruthy();
    });

    it('renders reference codes', () => {
      mockUseQuery.mockReturnValue({
        data: {
          myAssignedJobs: [createMockJob({ referenceCode: 'HMC-2025-0100' })],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Ref: HMC-2025-0100')).toBeTruthy();
    });

    it('renders StatusBadge labels for each job status', () => {
      mockUseQuery.mockReturnValue({
        data: {
          myAssignedJobs: [
            createMockJob({ id: 'j1', status: 'ASSIGNED' }),
            createMockJob({ id: 'j2', status: 'CONFIRMED' }),
          ],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Asignat')).toBeTruthy();
      expect(screen.getByText('Confirmat')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------
  describe('empty state', () => {
    it('shows the empty state message when no jobs are assigned', () => {
      mockUseQuery.mockReturnValue({
        data: { myAssignedJobs: [] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Nu ai comenzi programate.')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  describe('error state', () => {
    it('renders the header and empty state when query errors with no data', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: new Error('Network error'),
        refetch: jest.fn(),
      });

      render(<ScheduleScreen />);
      expect(screen.getByText('Program')).toBeTruthy();
      expect(screen.getByText('Nu ai comenzi programate.')).toBeTruthy();
    });
  });
});
