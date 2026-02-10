import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import ProfileScreen from '../../screens/ProfileScreen';

// ---------------------------------------------------------------------------
// Re-type mocked modules
// ---------------------------------------------------------------------------
const mockUseQuery = useQuery as jest.Mock;

// ---------------------------------------------------------------------------
// Mock useAuth
// ---------------------------------------------------------------------------
const mockLogout = jest.fn();
const mockUser = {
  id: 'user-1',
  email: 'cleaner@helpmeclean.ro',
  fullName: 'Ana Marinescu',
  role: 'CLEANER',
  status: 'ACTIVE',
};

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    login: jest.fn(),
    logout: mockLogout,
    isAuthenticated: true,
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupQueryMocks({
  profile = null,
  stats = null,
  profileLoading = false,
  statsLoading = false,
}: {
  profile?: Record<string, unknown> | null;
  stats?: Record<string, unknown> | null;
  profileLoading?: boolean;
  statsLoading?: boolean;
} = {}) {
  // ProfileScreen calls useQuery twice: first for profile, then for stats.
  mockUseQuery
    .mockReturnValueOnce({
      data: profile ? { myCleanerProfile: profile } : undefined,
      loading: profileLoading,
    })
    .mockReturnValueOnce({
      data: stats ? { myCleanerStats: stats } : undefined,
      loading: statsLoading,
    });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // User profile display
  // -----------------------------------------------------------------------
  describe('user profile information', () => {
    it('renders the page title "Profil"', () => {
      setupQueryMocks();
      render(<ProfileScreen />);
      expect(screen.getByText('Profil')).toBeTruthy();
    });

    it('displays the user full name from auth context', () => {
      setupQueryMocks();
      render(<ProfileScreen />);
      expect(screen.getByText('Ana Marinescu')).toBeTruthy();
    });

    it('displays the user email from auth context', () => {
      setupQueryMocks();
      render(<ProfileScreen />);
      expect(screen.getByText('cleaner@helpmeclean.ro')).toBeTruthy();
    });

    it('displays phone from profile data when available', () => {
      setupQueryMocks({
        profile: {
          id: 'p-1',
          fullName: 'Ana Marinescu',
          email: 'cleaner@helpmeclean.ro',
          phone: '+40721555888',
        },
      });
      render(<ProfileScreen />);
      expect(screen.getByText('+40721555888')).toBeTruthy();
    });

    it('does not render phone row when profile has no phone', () => {
      setupQueryMocks({
        profile: {
          id: 'p-1',
          fullName: 'Ana Marinescu',
          email: 'cleaner@helpmeclean.ro',
          phone: null,
        },
      });
      render(<ProfileScreen />);
      expect(screen.queryByText('Telefon')).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Job statistics
  // -----------------------------------------------------------------------
  describe('job statistics', () => {
    it('displays total jobs completed', () => {
      setupQueryMocks({
        stats: {
          totalJobsCompleted: 142,
          totalJobsThisMonth: 8,
          averageRating: 4.7,
          upcomingJobsCount: 3,
        },
      });
      render(<ProfileScreen />);
      expect(screen.getByText('142')).toBeTruthy();
    });

    it('displays jobs this month', () => {
      setupQueryMocks({
        stats: {
          totalJobsCompleted: 142,
          totalJobsThisMonth: 8,
          averageRating: 4.7,
          upcomingJobsCount: 3,
        },
      });
      render(<ProfileScreen />);
      expect(screen.getByText('8')).toBeTruthy();
    });

    it('displays average rating formatted to one decimal', () => {
      setupQueryMocks({
        stats: {
          totalJobsCompleted: 142,
          totalJobsThisMonth: 8,
          averageRating: 4.7,
          upcomingJobsCount: 3,
        },
      });
      render(<ProfileScreen />);
      expect(screen.getByText('4.7')).toBeTruthy();
    });

    it('displays upcoming jobs count', () => {
      setupQueryMocks({
        stats: {
          totalJobsCompleted: 142,
          totalJobsThisMonth: 8,
          averageRating: 4.7,
          upcomingJobsCount: 3,
        },
      });
      render(<ProfileScreen />);
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('shows "--" when averageRating is null', () => {
      setupQueryMocks({
        stats: {
          totalJobsCompleted: 0,
          totalJobsThisMonth: 0,
          averageRating: null,
          upcomingJobsCount: 0,
        },
      });
      render(<ProfileScreen />);
      expect(screen.getByText('--')).toBeTruthy();
    });

    it('renders stat labels', () => {
      setupQueryMocks({
        stats: {
          totalJobsCompleted: 10,
          totalJobsThisMonth: 2,
          averageRating: 5.0,
          upcomingJobsCount: 1,
        },
      });
      render(<ProfileScreen />);
      expect(screen.getByText('Total lucrari')).toBeTruthy();
      expect(screen.getByText('Luna aceasta')).toBeTruthy();
      expect(screen.getByText('Rating')).toBeTruthy();
      expect(screen.getByText('Urmatoare')).toBeTruthy();
    });

    it('shows loading indicator when stats are loading', () => {
      setupQueryMocks({ statsLoading: true });
      const { toJSON } = render(<ProfileScreen />);
      const tree = JSON.stringify(toJSON());
      expect(tree).toContain('ActivityIndicator');
    });
  });

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------
  describe('logout', () => {
    it('renders the logout button with text "Deconectare"', () => {
      setupQueryMocks();
      render(<ProfileScreen />);
      expect(screen.getByText('Deconectare')).toBeTruthy();
    });

    it('calls logout when the logout button is pressed', () => {
      setupQueryMocks();
      render(<ProfileScreen />);

      const logoutButton = screen.getByText('Deconectare');
      fireEvent.press(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
