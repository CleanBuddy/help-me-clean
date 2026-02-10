import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminSidebar from '@/components/layout/AdminSidebar';
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

const defaultAuth = {
  user: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  refetchUser: vi.fn(),
};

function renderSidebar(initialRoute = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AdminSidebar />
    </MemoryRouter>,
  );
}

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ ...defaultAuth });
  });

  it('shows "HelpMeClean" text', () => {
    renderSidebar();
    expect(screen.getByText('HelpMeClean')).toBeInTheDocument();
  });

  it('shows "Admin Panel" subtitle', () => {
    renderSidebar();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('shows all nav links', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Companii')).toBeInTheDocument();
    expect(screen.getByText('Comenzi')).toBeInTheDocument();
    expect(screen.getByText('Mesaje')).toBeInTheDocument();
    expect(screen.getByText('Utilizatori')).toBeInTheDocument();
    expect(screen.getByText('Setari')).toBeInTheDocument();
  });

  it('shows user name and email when authenticated', () => {
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
    renderSidebar();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@helpmeclean.ro')).toBeInTheDocument();
  });

  it('shows Deconectare button', () => {
    renderSidebar();
    expect(screen.getByText('Deconectare')).toBeInTheDocument();
  });

  it('calls logout and navigates on Deconectare click', async () => {
    const mockLogout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ ...defaultAuth, logout: mockLogout });
    const user = userEvent.setup();
    renderSidebar();
    await user.click(screen.getByText('Deconectare'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/autentificare');
  });

  it('active link has bg-primary/10 class', () => {
    renderSidebar('/admin');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink?.className).toContain('bg-primary/10');
  });
});
