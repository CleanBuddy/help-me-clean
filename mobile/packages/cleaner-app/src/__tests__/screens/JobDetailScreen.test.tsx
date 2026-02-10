import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import JobDetailScreen from '../../screens/JobDetailScreen';

// ---------------------------------------------------------------------------
// Re-type mocked modules
// ---------------------------------------------------------------------------
const mockUseQuery = useQuery as jest.Mock;
const mockUseMutation = useMutation as jest.Mock;

// ---------------------------------------------------------------------------
// Mock navigation with route params
// ---------------------------------------------------------------------------
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { jobId: 'test-job-1' },
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-job-1',
    referenceCode: 'HMC-2025-0055',
    serviceType: 'STANDARD',
    serviceName: 'Curatenie standard',
    scheduledDate: '2025-07-01',
    scheduledStartTime: '10:00',
    estimatedDurationHours: 3,
    status: 'ASSIGNED',
    propertyType: 'APARTMENT',
    numRooms: 3,
    numBathrooms: 1,
    areaSqm: 75,
    hasPets: false,
    specialInstructions: null,
    client: {
      id: 'client-1',
      fullName: 'Maria Popescu',
      email: 'maria@test.ro',
      phone: '+40721111222',
    },
    address: {
      streetAddress: 'Str. Primaverii 22',
      city: 'Bucuresti',
      county: 'Bucuresti',
      postalCode: '010001',
      floor: '4',
      apartment: '12A',
    },
    company: { id: 'co-1', companyName: 'CleanCo' },
    cleaner: { id: 'cl-1', fullName: 'Ion Popa', phone: '+40721333444' },
    hourlyRate: 50,
    estimatedTotal: 150,
    finalTotal: null,
    paymentStatus: 'PENDING',
    startedAt: null,
    completedAt: null,
    createdAt: '2025-06-20T10:00:00Z',
    ...overrides,
  };
}

/** Sets up useMutation to return controllable mock functions. */
function setupMutationMocks() {
  const mockConfirm = jest.fn().mockResolvedValue({ data: {} });
  const mockStart = jest.fn().mockResolvedValue({ data: {} });
  const mockComplete = jest.fn().mockResolvedValue({ data: {} });

  // useMutation is called 3 times in JobDetailScreen:
  // 1. confirmBooking
  // 2. startJob
  // 3. completeJob
  mockUseMutation
    .mockReturnValueOnce([mockConfirm, { loading: false }])
    .mockReturnValueOnce([mockStart, { loading: false }])
    .mockReturnValueOnce([mockComplete, { loading: false }]);

  return { mockConfirm, mockStart, mockComplete };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('JobDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  describe('loading state', () => {
    it('shows an ActivityIndicator while loading', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: true,
      });
      setupMutationMocks();

      const { toJSON } = render(<JobDetailScreen />);
      const tree = JSON.stringify(toJSON());
      expect(tree).toContain('ActivityIndicator');
    });
  });

  // -----------------------------------------------------------------------
  // Job details display
  // -----------------------------------------------------------------------
  describe('job details display', () => {
    it('renders the service name', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Curatenie standard')).toBeTruthy();
    });

    it('renders the reference code', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Ref: HMC-2025-0055')).toBeTruthy();
    });

    it('renders the street address', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Str. Primaverii 22')).toBeTruthy();
    });

    it('renders the city and county', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Bucuresti, Bucuresti')).toBeTruthy();
    });

    it('renders floor and apartment info', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Etaj: 4')).toBeTruthy();
      expect(screen.getByText('Ap: 12A')).toBeTruthy();
    });

    it('renders the client name', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Maria Popescu')).toBeTruthy();
    });

    it('renders the client phone', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('+40721111222')).toBeTruthy();
    });

    it('renders the scheduled time', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Ora: 10:00')).toBeTruthy();
    });

    it('renders the estimated duration', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Durata: 3h')).toBeTruthy();
    });

    it('renders the status badge', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'ASSIGNED' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Asignat')).toBeTruthy();
    });

    it('renders property info when available', () => {
      mockUseQuery.mockReturnValue({
        data: {
          booking: createMockBooking({
            propertyType: 'APARTMENT',
            numRooms: 3,
            numBathrooms: 1,
            areaSqm: 75,
          }),
        },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Tip: APARTMENT')).toBeTruthy();
      expect(screen.getByText('Camere: 3')).toBeTruthy();
      expect(screen.getByText('Bai: 1')).toBeTruthy();
      expect(screen.getByText('Suprafata: 75 mp')).toBeTruthy();
    });

    it('renders special instructions when provided', () => {
      mockUseQuery.mockReturnValue({
        data: {
          booking: createMockBooking({
            specialInstructions: 'Rog folositi produse eco.',
          }),
        },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Instructiuni speciale')).toBeTruthy();
      expect(screen.getByText('Rog folositi produse eco.')).toBeTruthy();
    });

    it('does not render special instructions section when null', () => {
      mockUseQuery.mockReturnValue({
        data: {
          booking: createMockBooking({ specialInstructions: null }),
        },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.queryByText('Instructiuni speciale')).toBeNull();
    });

    it('renders section headers', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking() },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Programare')).toBeTruthy();
      expect(screen.getByText('Adresa')).toBeTruthy();
      expect(screen.getByText('Client')).toBeTruthy();
      expect(screen.getByText('Proprietate')).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Action buttons per status
  // -----------------------------------------------------------------------
  describe('action buttons', () => {
    it('shows "Confirma comanda" button for ASSIGNED status', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'ASSIGNED' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Confirma comanda')).toBeTruthy();
    });

    it('does not show start or complete buttons for ASSIGNED status', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'ASSIGNED' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.queryByText('Incepe curatenia')).toBeNull();
      expect(screen.queryByText('Finalizeaza curatenia')).toBeNull();
    });

    it('shows "Incepe curatenia" button for CONFIRMED status', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'CONFIRMED' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Incepe curatenia')).toBeTruthy();
    });

    it('does not show confirm or complete buttons for CONFIRMED status', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'CONFIRMED' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.queryByText('Confirma comanda')).toBeNull();
      expect(screen.queryByText('Finalizeaza curatenia')).toBeNull();
    });

    it('shows "Finalizeaza curatenia" button for IN_PROGRESS status', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'IN_PROGRESS' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.getByText('Finalizeaza curatenia')).toBeTruthy();
    });

    it('does not show confirm or start buttons for IN_PROGRESS status', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'IN_PROGRESS' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.queryByText('Confirma comanda')).toBeNull();
      expect(screen.queryByText('Incepe curatenia')).toBeNull();
    });

    it('does not show any action button for COMPLETED status', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'COMPLETED' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.queryByText('Confirma comanda')).toBeNull();
      expect(screen.queryByText('Incepe curatenia')).toBeNull();
      expect(screen.queryByText('Finalizeaza curatenia')).toBeNull();
    });

    it('does not show any action button for CANCELLED statuses', () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'CANCELLED_BY_CLIENT' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      expect(screen.queryByText('Confirma comanda')).toBeNull();
      expect(screen.queryByText('Incepe curatenia')).toBeNull();
      expect(screen.queryByText('Finalizeaza curatenia')).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Mutation calls
  // -----------------------------------------------------------------------
  describe('mutation calls', () => {
    it('calls confirmBooking mutation when Confirm button is pressed', async () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'ASSIGNED' }) },
        loading: false,
      });
      const { mockConfirm } = setupMutationMocks();

      render(<JobDetailScreen />);
      fireEvent.press(screen.getByText('Confirma comanda'));

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith({
          variables: { id: 'test-job-1' },
        });
      });
    });

    it('calls startJob mutation when Start button is pressed', async () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'CONFIRMED' }) },
        loading: false,
      });
      const { mockStart } = setupMutationMocks();

      render(<JobDetailScreen />);
      fireEvent.press(screen.getByText('Incepe curatenia'));

      await waitFor(() => {
        expect(mockStart).toHaveBeenCalledWith({
          variables: { id: 'test-job-1' },
        });
      });
    });

    it('calls completeJob mutation when Complete button is pressed', async () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'IN_PROGRESS' }) },
        loading: false,
      });
      const { mockComplete } = setupMutationMocks();

      render(<JobDetailScreen />);
      fireEvent.press(screen.getByText('Finalizeaza curatenia'));

      await waitFor(() => {
        expect(mockComplete).toHaveBeenCalledWith({
          variables: { id: 'test-job-1' },
        });
      });
    });

    it('shows success alert after a successful mutation', async () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'ASSIGNED' }) },
        loading: false,
      });
      setupMutationMocks();

      render(<JobDetailScreen />);
      fireEvent.press(screen.getByText('Confirma comanda'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Succes',
          'Statusul comenzii a fost actualizat.',
        );
      });
    });

    it('shows error alert when a mutation fails', async () => {
      mockUseQuery.mockReturnValue({
        data: { booking: createMockBooking({ status: 'ASSIGNED' }) },
        loading: false,
      });

      const mockConfirm = jest.fn().mockRejectedValue(new Error('fail'));
      mockUseMutation
        .mockReturnValueOnce([mockConfirm, { loading: false }])
        .mockReturnValueOnce([jest.fn(), { loading: false }])
        .mockReturnValueOnce([jest.fn(), { loading: false }]);

      render(<JobDetailScreen />);
      fireEvent.press(screen.getByText('Confirma comanda'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Eroare',
          'Nu s-a putut actualiza statusul.',
        );
      });
    });
  });
});
