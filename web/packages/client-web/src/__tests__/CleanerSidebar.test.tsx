import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CleanerLayout from '@/components/layout/CleanerLayout';
import { useAuth } from '@/context/AuthContext';

vi.mock('@helpmeclean/shared', () => ({
  cn: (...args: unknown[]) =>
    args
      .flat()
      .filter((a) => typeof a === 'string' && a.length > 0)
      .join(' '),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CleanerLayout sidebar', () => {
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

  const renderLayout = () =>
    render(
      <MemoryRouter initialEntries={['/worker']}>
        <Routes>
          <Route path="/worker" element={<CleanerLayout />}>
            <Route index element={<div>Worker Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

  it('shows "HelpMeClean" text', () => {
    renderLayout();
    expect(screen.getAllByText('HelpMeClean').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Worker Dashboard" subtitle', () => {
    renderLayout();
    expect(screen.getAllByText('Worker Dashboard').length).toBeGreaterThanOrEqual(1);
  });

  it('shows nav links: Dashboard, Comenzi, Program, Mesaje, Profil', () => {
    renderLayout();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Comenzi').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Program').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Mesaje').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Profil').length).toBeGreaterThanOrEqual(1);
  });

  it('shows user name when authenticated', () => {
    renderLayout();
    expect(screen.getAllByText('Ana Curatenie').length).toBeGreaterThanOrEqual(1);
  });

  it('shows user email when authenticated', () => {
    renderLayout();
    expect(screen.getAllByText('ana.cleaner@test.dev').length).toBeGreaterThanOrEqual(1);
  });

  it('shows Deconectare button', () => {
    renderLayout();
    expect(screen.getAllByText('Deconectare').length).toBeGreaterThanOrEqual(1);
  });

  it('calls logout on Deconectare click', async () => {
    const user = userEvent.setup();
    renderLayout();
    const logoutButtons = screen.getAllByText('Deconectare');
    await user.click(logoutButtons[0]);
    expect(defaultAuth.logout).toHaveBeenCalledTimes(1);
  });
});
