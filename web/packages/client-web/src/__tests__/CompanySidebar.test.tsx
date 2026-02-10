import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CompanySidebar from '@/components/layout/CompanySidebar';
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

describe('CompanySidebar', () => {
  const defaultAuth = {
    user: {
      id: '1',
      email: 'admin@clean.ro',
      fullName: 'Ion Popescu',
      role: 'COMPANY_ADMIN',
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
        <CompanySidebar />
      </MemoryRouter>,
    );

  it('shows "HelpMeClean" text', () => {
    renderSidebar();
    expect(screen.getByText('HelpMeClean')).toBeInTheDocument();
  });

  it('shows "Company Dashboard" subtitle', () => {
    renderSidebar();
    expect(screen.getByText('Company Dashboard')).toBeInTheDocument();
  });

  it('shows nav links: Dashboard, Comenzi, Mesaje, Echipa mea, Setari', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Comenzi')).toBeInTheDocument();
    expect(screen.getByText('Mesaje')).toBeInTheDocument();
    expect(screen.getByText('Echipa mea')).toBeInTheDocument();
    expect(screen.getByText('Setari')).toBeInTheDocument();
  });

  it('shows user name when authenticated', () => {
    renderSidebar();
    expect(screen.getByText('Ion Popescu')).toBeInTheDocument();
  });

  it('shows user email when authenticated', () => {
    renderSidebar();
    expect(screen.getByText('admin@clean.ro')).toBeInTheDocument();
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
