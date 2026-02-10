import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '@/pages/admin/SettingsPage';
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

const defaultAuth = {
  user: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  refetchUser: vi.fn(),
};

function renderSettingsPage() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );
}

describe('Admin SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'admin@helpmeclean.ro',
        fullName: 'Admin User',
        role: 'GLOBAL_ADMIN',
        status: 'ACTIVE',
      },
    });
  });

  it('shows "Setari Platforma" title', () => {
    renderSettingsPage();
    expect(screen.getByText('Setari Platforma')).toBeInTheDocument();
  });

  it('shows admin user name', () => {
    renderSettingsPage();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('shows admin user email', () => {
    renderSettingsPage();
    expect(screen.getByText('admin@helpmeclean.ro')).toBeInTheDocument();
  });

  it('shows platform configuration section', () => {
    renderSettingsPage();
    expect(screen.getByText('Configuratie platforma')).toBeInTheDocument();
  });

  it('shows commission rate "15%"', () => {
    renderSettingsPage();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('shows currency "RON"', () => {
    renderSettingsPage();
    expect(screen.getByText('RON')).toBeInTheDocument();
  });
});
