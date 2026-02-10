// ---------------------------------------------------------------------------
// Tests for src/components/StatusBadge.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StatusBadge from '../../components/StatusBadge';

// ---------------------------------------------------------------------------
// Test data -- every known status with its expected Romanian label
// ---------------------------------------------------------------------------

const STATUS_LABEL_MAP: Record<string, string> = {
  PENDING: 'In asteptare',
  ASSIGNED: 'Asignat',
  CONFIRMED: 'Confirmat',
  IN_PROGRESS: 'In desfasurare',
  COMPLETED: 'Finalizat',
  CANCELLED_BY_CLIENT: 'Anulat',
  CANCELLED_BY_COMPANY: 'Anulat',
  CANCELLED_BY_ADMIN: 'Anulat',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StatusBadge', () => {
  // ---- Renders the correct Romanian label for every known status -----------

  it.each(Object.entries(STATUS_LABEL_MAP))(
    'renders Romanian label "%s" -> "%s"',
    (status, expectedLabel) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(expectedLabel)).toBeTruthy();
    },
  );

  // ---- Falls back to the raw status string for unknown statuses ------------

  it('falls back to the raw status string when the status is unknown', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeTruthy();
  });

  // ---- Correct color styling per status category ---------------------------

  it('applies amber styling for PENDING status', () => {
    const { toJSON } = render(<StatusBadge status="PENDING" />);
    const tree = JSON.stringify(toJSON());
    // The outer View should contain the amber background class
    expect(tree).toContain('bg-amber-100');
    expect(tree).toContain('text-amber-700');
  });

  it('applies blue styling for ASSIGNED status', () => {
    const { toJSON } = render(<StatusBadge status="ASSIGNED" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-blue-100');
    expect(tree).toContain('text-blue-700');
  });

  it('applies blue styling for CONFIRMED status', () => {
    const { toJSON } = render(<StatusBadge status="CONFIRMED" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-blue-100');
    expect(tree).toContain('text-blue-700');
  });

  it('applies emerald styling for COMPLETED status', () => {
    const { toJSON } = render(<StatusBadge status="COMPLETED" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-emerald-100');
    expect(tree).toContain('text-emerald-700');
  });

  it('applies red styling for CANCELLED_BY_CLIENT status', () => {
    const { toJSON } = render(<StatusBadge status="CANCELLED_BY_CLIENT" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-red-100');
    expect(tree).toContain('text-red-700');
  });

  it('applies red styling for CANCELLED_BY_COMPANY status', () => {
    const { toJSON } = render(<StatusBadge status="CANCELLED_BY_COMPANY" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-red-100');
    expect(tree).toContain('text-red-700');
  });

  it('applies red styling for CANCELLED_BY_ADMIN status', () => {
    const { toJSON } = render(<StatusBadge status="CANCELLED_BY_ADMIN" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-red-100');
    expect(tree).toContain('text-red-700');
  });

  it('applies gray fallback styling for an unknown status', () => {
    const { toJSON } = render(<StatusBadge status="SOMETHING_ELSE" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-gray-100');
    expect(tree).toContain('text-gray-700');
  });

  it('applies blue-50 + text-primary styling for IN_PROGRESS status', () => {
    const { toJSON } = render(<StatusBadge status="IN_PROGRESS" />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('bg-blue-50');
    expect(tree).toContain('text-primary');
  });
});
