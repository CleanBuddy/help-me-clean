import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-700');
  });

  it('applies success variant classes', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge.className).toContain('bg-emerald-50');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('applies warning variant classes', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge.className).toContain('bg-amber-50');
    expect(badge.className).toContain('text-amber-700');
  });

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText('Danger');
    expect(badge.className).toContain('bg-red-50');
    expect(badge.className).toContain('text-red-700');
  });

  it('applies info variant classes', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge.className).toContain('bg-blue-50');
    expect(badge.className).toContain('text-blue-700');
  });

  it('applies custom className', () => {
    render(<Badge className="extra-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge.className).toContain('extra-class');
  });
});
