// ---------------------------------------------------------------------------
// Tests for src/screens/SettingsScreen.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import SettingsScreen from '../../screens/SettingsScreen';

// ---------------------------------------------------------------------------
// Mock useAuth
// ---------------------------------------------------------------------------

const mockLogout = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'u1',
      email: 'admin@cleanpro.ro',
      fullName: 'Admin CleanPro',
      role: 'COMPANY_ADMIN',
      status: 'ACTIVE',
    },
    loading: false,
    login: jest.fn(),
    logout: mockLogout,
    isAuthenticated: true,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockCompany = {
  id: 'comp-1',
  companyName: 'CleanPro SRL',
  cui: 'RO12345678',
  companyType: 'SRL',
  status: 'ACTIVE',
  ratingAvg: 4.6,
  totalJobsCompleted: 230,
  maxServiceRadiusKm: 25,
  contactEmail: 'office@cleanpro.ro',
  contactPhone: '0212345678',
  description: 'Servicii profesionale de curatenie',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupUseQuery({
  loading = false,
  company = undefined as typeof mockCompany | undefined,
}) {
  (useQuery as jest.Mock).mockReturnValue({
    data: company ? { myCompany: company } : undefined,
    loading,
    error: undefined,
    refetch: jest.fn(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SettingsScreen', () => {
  // ---- Page header ---------------------------------------------------------

  it('renders the "Setari" title', () => {
    setupUseQuery({});
    render(<SettingsScreen />);
    expect(screen.getByText('Setari')).toBeTruthy();
  });

  // ---- User information ----------------------------------------------------

  it('renders the user full name', () => {
    setupUseQuery({});
    render(<SettingsScreen />);
    expect(screen.getByText('Admin CleanPro')).toBeTruthy();
  });

  it('renders the user email', () => {
    setupUseQuery({});
    render(<SettingsScreen />);
    expect(screen.getByText('admin@cleanpro.ro')).toBeTruthy();
  });

  it('renders the "Administrator" role badge', () => {
    setupUseQuery({});
    render(<SettingsScreen />);
    expect(screen.getByText('Administrator')).toBeTruthy();
  });

  // ---- Company information -- loading state --------------------------------

  it('shows an ActivityIndicator when company data is loading', () => {
    setupUseQuery({ loading: true });

    const { toJSON } = render(<SettingsScreen />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('ActivityIndicator');
  });

  // ---- Company information -- populated ------------------------------------

  it('renders the "Informatii companie" section header', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Informatii companie')).toBeTruthy();
  });

  it('renders the company name', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('CleanPro SRL')).toBeTruthy();
  });

  it('renders the CUI', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('CUI')).toBeTruthy();
    expect(screen.getByText('RO12345678')).toBeTruthy();
  });

  it('renders the company type', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Tip companie')).toBeTruthy();
    expect(screen.getByText('SRL')).toBeTruthy();
  });

  it('renders the contact email', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Email contact')).toBeTruthy();
    expect(screen.getByText('office@cleanpro.ro')).toBeTruthy();
  });

  it('renders the contact phone', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Telefon contact')).toBeTruthy();
    expect(screen.getByText('0212345678')).toBeTruthy();
  });

  it('renders the max service radius', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Raza maxima de serviciu')).toBeTruthy();
    expect(screen.getByText('25 km')).toBeTruthy();
  });

  it('renders the company description', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Descriere')).toBeTruthy();
    expect(screen.getByText('Servicii profesionale de curatenie')).toBeTruthy();
  });

  // ---- Company stats -------------------------------------------------------

  it('renders the company status as "Activ" for ACTIVE', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('Activ')).toBeTruthy();
  });

  it('renders the company rating', () => {
    setupUseQuery({ company: mockCompany });
    render(<SettingsScreen />);
    expect(screen.getByText('Rating')).toBeTruthy();
    expect(screen.getByText('4.6')).toBeTruthy();
  });

  it('renders "--" for rating when ratingAvg is null', () => {
    setupUseQuery({
      company: { ...mockCompany, ratingAvg: null as any },
    });
    render(<SettingsScreen />);
    expect(screen.getByText('--')).toBeTruthy();
  });

  // ---- Optional fields hidden when null ------------------------------------

  it('does not render "Tip companie" when companyType is null', () => {
    setupUseQuery({
      company: { ...mockCompany, companyType: null as any },
    });
    render(<SettingsScreen />);
    expect(screen.queryByText('Tip companie')).toBeNull();
  });

  it('does not render "Email contact" when contactEmail is null', () => {
    setupUseQuery({
      company: { ...mockCompany, contactEmail: null as any },
    });
    render(<SettingsScreen />);
    expect(screen.queryByText('Email contact')).toBeNull();
  });

  it('does not render "Telefon contact" when contactPhone is null', () => {
    setupUseQuery({
      company: { ...mockCompany, contactPhone: null as any },
    });
    render(<SettingsScreen />);
    expect(screen.queryByText('Telefon contact')).toBeNull();
  });

  it('does not render "Raza maxima de serviciu" when maxServiceRadiusKm is null', () => {
    setupUseQuery({
      company: { ...mockCompany, maxServiceRadiusKm: null as any },
    });
    render(<SettingsScreen />);
    expect(screen.queryByText('Raza maxima de serviciu')).toBeNull();
  });

  it('does not render "Descriere" when description is null', () => {
    setupUseQuery({
      company: { ...mockCompany, description: null as any },
    });
    render(<SettingsScreen />);
    expect(screen.queryByText('Descriere')).toBeNull();
  });

  // ---- Logout button -------------------------------------------------------

  it('renders the logout button with text "Deconectare"', () => {
    setupUseQuery({});
    render(<SettingsScreen />);
    expect(screen.getByText('Deconectare')).toBeTruthy();
  });

  it('calls the logout function when logout button is pressed', () => {
    setupUseQuery({});
    render(<SettingsScreen />);

    const logoutButton = screen.getByText('Deconectare');
    fireEvent.press(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  // ---- App version ---------------------------------------------------------

  it('renders the app version string', () => {
    setupUseQuery({});
    render(<SettingsScreen />);
    expect(screen.getByText('HelpMeClean Company App v1.0.0')).toBeTruthy();
  });
});
