import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import UsersPage from '@/pages/admin/UsersPage';

vi.mock('@helpmeclean/shared', () => ({
  cn: (...args: unknown[]) =>
    args
      .flat()
      .filter((a) => typeof a === 'string' && a.length > 0)
      .join(' '),
}));

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

function renderUsersPage() {
  return render(
    <MemoryRouter>
      <UsersPage />
    </MemoryRouter>,
  );
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuery).mockReturnValue({
      data: {
        platformStats: {
          totalClients: 10,
          totalCompanies: 3,
          totalCleaners: 5,
          newClientsThisMonth: 2,
        },
      },
      loading: false,
    } as ReturnType<typeof useQuery>);
  });

  it('shows "Utilizatori" title', () => {
    renderUsersPage();
    expect(screen.getByText('Utilizatori')).toBeInTheDocument();
  });

  it('shows stat cards', () => {
    renderUsersPage();
    expect(screen.getByText('Total Clienti')).toBeInTheDocument();
    expect(screen.getByText('Total Companii')).toBeInTheDocument();
    expect(screen.getByText('Total Curatatori')).toBeInTheDocument();
    expect(screen.getByText('Clienti noi luna aceasta')).toBeInTheDocument();
  });

  it('shows correct stat values', () => {
    renderUsersPage();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows user management placeholder text', () => {
    renderUsersPage();
    expect(screen.getByText('Gestionare utilizatori')).toBeInTheDocument();
    expect(
      screen.getByText(/functionalitatea completa de management al utilizatorilor/i),
    ).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: true,
    } as ReturnType<typeof useQuery>);
    renderUsersPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
