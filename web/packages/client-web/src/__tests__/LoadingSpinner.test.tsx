import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without text', () => {
    const { container } = render(<LoadingSpinner />);
    // Should render the spinner svg
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Should not render any text paragraph
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders with text', () => {
    render(<LoadingSpinner text="Se incarca..." />);
    expect(screen.getByText('Se incarca...')).toBeInTheDocument();
  });

  it('does not render text paragraph when text is not provided', () => {
    const { container } = render(<LoadingSpinner />);
    const paragraph = container.querySelector('p');
    expect(paragraph).not.toBeInTheDocument();
  });

  it('applies sm size class to the spinner icon', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const svg = container.querySelector('svg');
    const classes = svg?.getAttribute('class') ?? '';
    expect(classes).toContain('h-5');
    expect(classes).toContain('w-5');
  });

  it('applies md size class by default', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    const classes = svg?.getAttribute('class') ?? '';
    expect(classes).toContain('h-8');
    expect(classes).toContain('w-8');
  });

  it('applies lg size class', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const svg = container.querySelector('svg');
    const classes = svg?.getAttribute('class') ?? '';
    expect(classes).toContain('h-12');
    expect(classes).toContain('w-12');
  });

  it('has animate-spin class for animation', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('animate-spin');
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(<LoadingSpinner className="my-custom" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('my-custom');
  });
});
