import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import Input from '@/components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input name="email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    // No label element should be rendered
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input name="email" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error border class when error is present', () => {
    render(<Input name="email" error="Error" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('border-danger');
    expect(input.className).not.toContain('border-gray-300');
  });

  it('applies normal border class when no error', () => {
    render(<Input name="email" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('border-gray-300');
    expect(input.className).not.toContain('border-danger');
  });

  it('does not show error message when none provided', () => {
    const { container } = render(<Input name="email" />);
    const errorParagraph = container.querySelector('p');
    expect(errorParagraph).not.toBeInTheDocument();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} name="email" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('handles value and onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Input name="email" label="Email" value="" onChange={onChange} />,
    );
    const input = screen.getByLabelText('Email');
    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('uses id prop for htmlFor when provided', () => {
    render(<Input id="custom-id" label="Custom" />);
    const input = screen.getByLabelText('Custom');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('falls back to name for id when no id provided', () => {
    render(<Input name="username" label="Username" />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', 'username');
  });

  it('applies custom className', () => {
    render(<Input name="email" className="extra-class" data-testid="input" />);
    expect(screen.getByTestId('input').className).toContain('extra-class');
  });
});
