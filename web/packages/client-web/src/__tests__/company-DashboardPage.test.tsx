import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '@/pages/company/DashboardPage';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseQuery = vi.fn();

vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Company DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

  it('shows welcome message with company name', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          totalJobsCompleted: 42,
          ratingAvg: 4.8,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText(/bun venit.*cleanpro srl/i)).toBeInTheDocument();
  });

  it('shows stat cards', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          totalJobsCompleted: 42,
          ratingAvg: 4.8,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Comenzi finalizate')).toBeInTheDocument();
    expect(screen.getByText('Venit saptamana')).toBeInTheDocument();
    expect(screen.getByText('Rating mediu')).toBeInTheDocument();
    expect(screen.getByText('Raza serviciu')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
    });
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows zero values when no data', () => {
    mockUseQuery.mockReturnValue({
      data: { myCompany: null },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Bun venit!')).toBeInTheDocument();
    // totalJobsCompleted defaults to 0
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows company stats values', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          totalJobsCompleted: 42,
          ratingAvg: 4.8,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText(/25 km/)).toBeInTheDocument();
  });
});
