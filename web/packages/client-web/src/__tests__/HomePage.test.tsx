import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { AVAILABLE_SERVICES } from '@/graphql/operations';
import HomePage from '@/pages/HomePage';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    isAuthenticated: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    refetchUser: vi.fn(),
    refreshToken: vi.fn(),
  })),
}));

vi.mock('@/context/PlatformContext', () => ({
  usePlatform: vi.fn(() => ({
    platformMode: 'live',
    isPreRelease: false,
    loading: false,
  })),
  PlatformProvider: ({ children }: { children: unknown }) => children,
}));

const mockUseAuth = vi.mocked(useAuth);

const mockServices = [
  {
    id: '1',
    serviceType: 'STANDARD_CLEANING',
    nameRo: 'Curatenie Standard',
    nameEn: 'Standard Cleaning',
    descriptionRo: 'Curatenie generala pentru locuinta ta.',
    descriptionEn: 'General cleaning.',
    basePricePerHour: 50,
    minHours: 2,
    icon: '🏠',
  },
  {
    id: '2',
    serviceType: 'DEEP_CLEANING',
    nameRo: 'Curatenie Generala',
    nameEn: 'Deep Cleaning',
    descriptionRo: 'Curatenie aprofundata.',
    descriptionEn: 'Deep cleaning.',
    basePricePerHour: 75,
    minHours: 3,
    icon: '✨',
  },
];

const successMock: MockedResponse[] = [
  {
    request: { query: AVAILABLE_SERVICES },
    result: {
      data: { availableServices: mockServices },
    },
  },
];

const loadingMock: MockedResponse[] = [
  {
    request: { query: AVAILABLE_SERVICES },
    result: {
      data: { availableServices: mockServices },
    },
    delay: 100000, // long delay to keep in loading state
  },
];

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderHomePage(mocks: MockedResponse[] = successMock) {
  return render(
    <HelmetProvider>
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </MockedProvider>
    </HelmetProvider>,
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      refetchUser: vi.fn(),
      refreshToken: vi.fn(),
    });
  });

  it('shows hero title "Casă curată"', () => {
    renderHomePage();
    expect(screen.getByText(/Casă curată/)).toBeInTheDocument();
  });

  it('shows hero subtitle text', () => {
    renderHomePage();
    expect(
      screen.getByText(/firme de cur/),
    ).toBeInTheDocument();
  });

  it('shows "Rezervă o curățenie" button', () => {
    renderHomePage();
    expect(
      screen.getByRole('button', { name: /Rezervă o curățenie/ }),
    ).toBeInTheDocument();
  });

  it('shows "Vezi serviciile" button', () => {
    renderHomePage();
    expect(
      screen.getByRole('button', { name: 'Vezi serviciile' }),
    ).toBeInTheDocument();
  });

  it('shows "Cum funcționează?" section', () => {
    renderHomePage();
    expect(screen.getByText('Cum funcționează?')).toBeInTheDocument();
  });

  it('shows all three steps in how-it-works section', () => {
    renderHomePage();
    expect(screen.getByText('Alege serviciul')).toBeInTheDocument();
    expect(screen.getByText('Programează')).toBeInTheDocument();
    expect(screen.getByText('Bucură-te de rezultat')).toBeInTheDocument();
  });

  it('shows "De ce HelpMeClean?" section', () => {
    renderHomePage();
    expect(screen.getByText('De ce HelpMeClean?')).toBeInTheDocument();
  });

  it('shows trust items', () => {
    renderHomePage();
    expect(screen.getAllByText('Firme verificate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Plăți sigure')).toBeInTheDocument();
    expect(screen.getByText('Prețuri transparente')).toBeInTheDocument();
    expect(screen.getByText('Suport rapid')).toBeInTheDocument();
  });

  it('shows services section heading', () => {
    renderHomePage();
    expect(screen.getByText('Ce putem face pentru tine?')).toBeInTheDocument();
  });

  it('shows services from query after loading', async () => {
    renderHomePage();
    expect(
      await screen.findByText('Curatenie Standard'),
    ).toBeInTheDocument();
    expect(screen.getByText('Curatenie Generala')).toBeInTheDocument();
  });

  it('shows service prices from query', async () => {
    renderHomePage();
    await screen.findByText('Curatenie Standard');
    expect(screen.getByText('50 lei')).toBeInTheDocument();
    expect(screen.getByText('75 lei')).toBeInTheDocument();
  });

  it('shows loading spinner while services are loading', () => {
    renderHomePage(loadingMock);
    expect(screen.getByText('Se încarcă serviciile...')).toBeInTheDocument();
  });

  it('shows "Rezervă acum" button in how-it-works section', () => {
    renderHomePage();
    const buttons = screen.getAllByRole('button', { name: /Rezervă acum/ });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows stats section', () => {
    renderHomePage();
    expect(screen.getAllByText('500+').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Rezervări efectuate')).toBeInTheDocument();
  });

  it('shows testimonials section', () => {
    renderHomePage();
    expect(screen.getByText('Ce spun clienții noștri')).toBeInTheDocument();
  });
});
