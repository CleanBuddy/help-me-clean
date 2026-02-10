import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { AVAILABLE_SERVICES } from '@/graphql/operations';
import HomePage from '@/pages/HomePage';

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
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </MockedProvider>,
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows hero title "Curatenie profesionala"', () => {
    renderHomePage();
    expect(screen.getByText(/Curatenie profesionala/)).toBeInTheDocument();
  });

  it('shows hero subtitle text', () => {
    renderHomePage();
    expect(
      screen.getByText(/firme de curatenie verificate din Romania/),
    ).toBeInTheDocument();
  });

  it('shows "Rezerva o curatenie" button', () => {
    renderHomePage();
    expect(
      screen.getByRole('button', { name: /Rezerva o curatenie/ }),
    ).toBeInTheDocument();
  });

  it('shows "Vezi serviciile" button', () => {
    renderHomePage();
    expect(
      screen.getByRole('button', { name: 'Vezi serviciile' }),
    ).toBeInTheDocument();
  });

  it('shows "Cum functioneaza?" section', () => {
    renderHomePage();
    expect(screen.getByText('Cum functioneaza?')).toBeInTheDocument();
  });

  it('shows all three steps in how-it-works section', () => {
    renderHomePage();
    expect(screen.getByText('Pasul 1')).toBeInTheDocument();
    expect(screen.getByText('Pasul 2')).toBeInTheDocument();
    expect(screen.getByText('Pasul 3')).toBeInTheDocument();
    expect(screen.getByText('Alege serviciul')).toBeInTheDocument();
    expect(screen.getByText('Programeaza')).toBeInTheDocument();
    expect(screen.getByText('Bucura-te de rezultat')).toBeInTheDocument();
  });

  it('shows "De ce HelpMeClean?" section', () => {
    renderHomePage();
    expect(screen.getByText('De ce HelpMeClean?')).toBeInTheDocument();
  });

  it('shows trust items', () => {
    renderHomePage();
    // Trust badges in hero
    expect(screen.getAllByText('Firme verificate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Recenzii reale')).toBeInTheDocument();
    expect(screen.getByText('Rezervare rapida')).toBeInTheDocument();
    // Trust items in section
    expect(screen.getByText('Plati sigure')).toBeInTheDocument();
    expect(screen.getByText('Preturi transparente')).toBeInTheDocument();
    expect(screen.getByText('Suport rapid')).toBeInTheDocument();
  });

  it('shows "Serviciile noastre" section heading', () => {
    renderHomePage();
    expect(screen.getByText('Serviciile noastre')).toBeInTheDocument();
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
    expect(screen.getByText('Se incarca serviciile...')).toBeInTheDocument();
  });

  it('shows "Incepe acum" button in how-it-works section', () => {
    renderHomePage();
    expect(
      screen.getByRole('button', { name: /Incepe acum/ }),
    ).toBeInTheDocument();
  });
});
