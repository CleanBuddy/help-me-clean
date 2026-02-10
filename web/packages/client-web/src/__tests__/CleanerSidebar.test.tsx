import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CleanerSidebar from '@/components/layout/CleanerSidebar';
import { useAuth } from '@/context/AuthContext';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CleanerSidebar', () => {
  const defaultAuth = {
    user: {
      id: '1',
      email: 'ana.cleaner@test.dev',
      fullName: 'Ana Curatenie',
      role: 'CLEANER',
      status: 'ACTIVE',
    },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    refetchUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(defaultAuth);
  });

  const renderSidebar = () =>
    render(
      <MemoryRouter>
        <CleanerSidebar />
      </MemoryRouter>,
    );

  it('shows "HelpMeClean" text', () => {
    renderSidebar();
    expect(screen.getByText('HelpMeClean')).toBeInTheDocument();
  });

  it('shows "Worker Dashboard" subtitle', () => {
    renderSidebar();
    expect(screen.getByText('Worker Dashboard')).toBeInTheDocument();
  });

  it('shows nav links: Azi, Program, Mesaje, Profil', () => {
    renderSidebar();
    expect(screen.getByText('Azi')).toBeInTheDocument();
    expect(screen.getByText('Program')).toBeInTheDocument();
    expect(screen.getByText('Mesaje')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
  });

  it('shows user name when authenticated', () => {
    renderSidebar();
    expect(screen.getByText('Ana Curatenie')).toBeInTheDocument();
  });

  it('shows user email when authenticated', () => {
    renderSidebar();
    expect(screen.getByText('ana.cleaner@test.dev')).toBeInTheDocument();
  });

  it('shows Deconectare button', () => {
    renderSidebar();
    expect(screen.getByText('Deconectare')).toBeInTheDocument();
  });

  it('calls logout on Deconectare click', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await user.click(screen.getByText('Deconectare'));
    expect(defaultAuth.logout).toHaveBeenCalledTimes(1);
  });
});
