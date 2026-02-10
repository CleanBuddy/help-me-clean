import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '@/pages/company/SettingsPage';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue([vi.fn(), { loading: false }]);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

  it('shows page title "Setari"', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          cui: 'RO12345678',
          companyType: 'SRL',
          legalRepresentative: 'Ion Popescu',
          contactEmail: 'contact@cleanpro.ro',
          contactPhone: '+40700000000',
          address: 'Str. Principala 1',
          city: 'Bucuresti',
          county: 'Bucuresti',
          description: 'Firma de curatenie',
          logoUrl: null,
          status: 'ACTIVE',
          rejectionReason: null,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Setari')).toBeInTheDocument();
  });

  it('shows company name when loaded', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          cui: 'RO12345678',
          companyType: 'SRL',
          legalRepresentative: 'Ion Popescu',
          contactEmail: 'contact@cleanpro.ro',
          contactPhone: '+40700000000',
          address: 'Str. Principala 1',
          city: 'Bucuresti',
          county: 'Bucuresti',
          description: 'Firma de curatenie',
          logoUrl: null,
          status: 'ACTIVE',
          rejectionReason: null,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('CleanPro SRL')).toBeInTheDocument();
  });

  it('shows company CUI when loaded', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          cui: 'RO12345678',
          companyType: 'SRL',
          legalRepresentative: 'Ion Popescu',
          contactEmail: 'contact@cleanpro.ro',
          contactPhone: '+40700000000',
          address: 'Str. Principala 1',
          city: 'Bucuresti',
          county: 'Bucuresti',
          description: '',
          logoUrl: null,
          status: 'ACTIVE',
          rejectionReason: null,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText(/CUI: RO12345678/)).toBeInTheDocument();
  });

  it('shows company type when loaded', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          cui: 'RO12345678',
          companyType: 'SRL',
          legalRepresentative: 'Ion Popescu',
          contactEmail: 'contact@cleanpro.ro',
          contactPhone: '+40700000000',
          address: 'Str. Principala 1',
          city: 'Bucuresti',
          county: 'Bucuresti',
          description: '',
          logoUrl: null,
          status: 'ACTIVE',
          rejectionReason: null,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Tip firma')).toBeInTheDocument();
    expect(screen.getByText('SRL')).toBeInTheDocument();
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

  it('shows company status badge', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCompany: {
          id: '1',
          companyName: 'CleanPro SRL',
          cui: 'RO12345678',
          companyType: 'SRL',
          legalRepresentative: 'Ion Popescu',
          contactEmail: 'contact@cleanpro.ro',
          contactPhone: '+40700000000',
          address: 'Str. Principala 1',
          city: 'Bucuresti',
          county: 'Bucuresti',
          description: '',
          logoUrl: null,
          status: 'ACTIVE',
          rejectionReason: null,
          maxServiceRadiusKm: 25,
        },
      },
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });
});
