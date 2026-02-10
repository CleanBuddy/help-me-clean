import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { AVAILABLE_SERVICES } from '@/graphql/operations';
import ServicesPage from '@/pages/ServicesPage';

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

const errorMock: MockedResponse[] = [
  {
    request: { query: AVAILABLE_SERVICES },
    result: {
      errors: [new GraphQLError('Failed to fetch services')],
    },
  },
];

const emptyMock: MockedResponse[] = [
  {
    request: { query: AVAILABLE_SERVICES },
    result: {
      data: { availableServices: [] },
    },
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

function renderServicesPage(mocks: MockedResponse[] = successMock) {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <ServicesPage />
      </MemoryRouter>
    </MockedProvider>,
  );
}

describe('ServicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    renderServicesPage();
    expect(screen.getByText('Se incarca serviciile...')).toBeInTheDocument();
  });

  it('shows page heading', async () => {
    renderServicesPage();
    expect(screen.getByText('Serviciile noastre')).toBeInTheDocument();
  });

  it('shows service cards after loading', async () => {
    renderServicesPage();
    expect(
      await screen.findByText('Curatenie Standard'),
    ).toBeInTheDocument();
    expect(screen.getByText('Curatenie Generala')).toBeInTheDocument();
  });

  it('shows service descriptions', async () => {
    renderServicesPage();
    expect(
      await screen.findByText('Curatenie generala pentru locuinta ta.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Curatenie aprofundata.'),
    ).toBeInTheDocument();
  });

  it('shows service prices', async () => {
    renderServicesPage();
    await screen.findByText('Curatenie Standard');
    expect(screen.getByText('50 lei')).toBeInTheDocument();
    expect(screen.getByText('75 lei')).toBeInTheDocument();
  });

  it('shows minimum hours for services', async () => {
    renderServicesPage();
    await screen.findByText('Curatenie Standard');
    expect(screen.getByText(/Minim 2/)).toBeInTheDocument();
    expect(screen.getByText(/Minim 3/)).toBeInTheDocument();
  });

  it('shows "Rezerva" button for each service', async () => {
    renderServicesPage();
    await screen.findByText('Curatenie Standard');
    const rezervaButtons = screen.getAllByRole('button', { name: /Rezerva/ });
    expect(rezervaButtons).toHaveLength(2);
  });

  it('shows error state when query fails', async () => {
    renderServicesPage(errorMock);
    expect(
      await screen.findByText(
        'Nu am putut incarca serviciile. Te rugam sa incerci din nou.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reincearca' }),
    ).toBeInTheDocument();
  });

  it('shows empty state when no services available', async () => {
    renderServicesPage(emptyMock);
    expect(
      await screen.findByText('Momentan nu sunt servicii disponibile.'),
    ).toBeInTheDocument();
  });

  it('does not show loading spinner after data loads', async () => {
    renderServicesPage();
    await screen.findByText('Curatenie Standard');
    expect(
      screen.queryByText('Se incarca serviciile...'),
    ).not.toBeInTheDocument();
  });

  it('uses correct plural form for minHours (ore vs ora)', async () => {
    const singleHourMock: MockedResponse[] = [
      {
        request: { query: AVAILABLE_SERVICES },
        result: {
          data: {
            availableServices: [
              {
                id: '3',
                serviceType: 'WINDOW_CLEANING',
                nameRo: 'Spalat geamuri',
                nameEn: 'Window Cleaning',
                descriptionRo: 'Curatare geamuri.',
                descriptionEn: 'Window cleaning.',
                basePricePerHour: 40,
                minHours: 1,
                icon: '🪟',
              },
            ],
          },
        },
      },
    ];
    renderServicesPage(singleHourMock);
    await screen.findByText('Spalat geamuri');
    expect(screen.getByText(/Minim 1 ora/)).toBeInTheDocument();
  });
});
