import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import JobCard from '../../components/JobCard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockJob(overrides: Record<string, unknown> = {}) {
  return {
    id: 'job-1',
    referenceCode: 'HMC-2025-0042',
    serviceName: 'Curatenie generala',
    scheduledDate: '2025-06-15',
    scheduledStartTime: '09:00',
    estimatedDurationHours: 3,
    status: 'ASSIGNED',
    address: {
      streetAddress: 'Str. Victoriei 12',
      city: 'Bucuresti',
      floor: '3',
      apartment: '15',
    },
    client: {
      fullName: 'Maria Popescu',
      phone: '+40721000000',
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('JobCard', () => {
  it('renders the service name', () => {
    const job = createMockJob();
    render(<JobCard job={job} onPress={jest.fn()} />);

    expect(screen.getByText('Curatenie generala')).toBeTruthy();
  });

  it('renders the reference code', () => {
    const job = createMockJob();
    render(<JobCard job={job} onPress={jest.fn()} />);

    expect(screen.getByText('Ref: HMC-2025-0042')).toBeTruthy();
  });

  it('renders the street address and city', () => {
    const job = createMockJob();
    render(<JobCard job={job} onPress={jest.fn()} />);

    expect(screen.getByText('Str. Victoriei 12, Bucuresti')).toBeTruthy();
  });

  it('renders the scheduled time, duration, and client name', () => {
    const job = createMockJob();
    render(<JobCard job={job} onPress={jest.fn()} />);

    // The component renders: "09:00 · 3h · Maria Popescu"
    expect(screen.getByText(/09:00/)).toBeTruthy();
    expect(screen.getByText(/3h/)).toBeTruthy();
    expect(screen.getByText(/Maria Popescu/)).toBeTruthy();
  });

  it('displays the client full name', () => {
    const job = createMockJob({
      client: { fullName: 'Ion Ionescu' },
    });
    render(<JobCard job={job} onPress={jest.fn()} />);

    expect(screen.getByText(/Ion Ionescu/)).toBeTruthy();
  });

  it('renders the StatusBadge component for the given status', () => {
    const job = createMockJob({ status: 'CONFIRMED' });
    render(<JobCard job={job} onPress={jest.fn()} />);

    // StatusBadge translates CONFIRMED -> "Confirmat"
    expect(screen.getByText('Confirmat')).toBeTruthy();
  });

  it('renders the correct badge for COMPLETED status', () => {
    const job = createMockJob({ status: 'COMPLETED' });
    render(<JobCard job={job} onPress={jest.fn()} />);

    expect(screen.getByText('Finalizat')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    const job = createMockJob();
    render(<JobCard job={job} onPress={onPress} />);

    fireEvent.press(screen.getByText('Curatenie generala'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders different job data correctly', () => {
    const job = createMockJob({
      referenceCode: 'HMC-2025-0099',
      serviceName: 'Curatenie dupa renovare',
      scheduledStartTime: '14:30',
      estimatedDurationHours: 5,
      address: {
        streetAddress: 'Bd. Unirii 44',
        city: 'Cluj-Napoca',
      },
      client: { fullName: 'Andrei Munteanu' },
    });
    render(<JobCard job={job} onPress={jest.fn()} />);

    expect(screen.getByText('Curatenie dupa renovare')).toBeTruthy();
    expect(screen.getByText('Ref: HMC-2025-0099')).toBeTruthy();
    expect(screen.getByText('Bd. Unirii 44, Cluj-Napoca')).toBeTruthy();
    expect(screen.getByText(/14:30/)).toBeTruthy();
    expect(screen.getByText(/5h/)).toBeTruthy();
    expect(screen.getByText(/Andrei Munteanu/)).toBeTruthy();
  });
});
