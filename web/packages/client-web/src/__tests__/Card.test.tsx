import { render, screen } from '@testing-library/react';
import Card from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has padding by default (p-6 class)', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('p-6');
  });

  it('has no padding when padding=false', () => {
    render(<Card padding={false} data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).not.toContain('p-6');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('custom-class');
  });

  it('has base styling classes', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('shadow-sm');
  });

  it('passes through other HTML attributes', () => {
    render(
      <Card data-testid="card" id="my-card" role="region">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'my-card');
    expect(card).toHaveAttribute('role', 'region');
  });

  it('renders complex children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
