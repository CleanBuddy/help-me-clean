import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from '@/components/ui/Select';

const options = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="Choose" name="choice" options={options} />);
    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Select name="choice" options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    // No label text should exist
    expect(screen.queryByText('Choose')).not.toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select name="choice" options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('shows placeholder as first option', () => {
    render(
      <Select
        name="choice"
        options={options}
        placeholder="Select an option..."
      />,
    );
    const placeholderOption = screen.getByText('Select an option...');
    expect(placeholderOption).toBeInTheDocument();
    expect(placeholderOption.tagName).toBe('OPTION');
    expect(placeholderOption).toHaveAttribute('value', '');
  });

  it('does not render placeholder when not provided', () => {
    render(<Select name="choice" options={options} />);
    const allOptions = screen.getAllByRole('option');
    expect(allOptions).toHaveLength(3);
  });

  it('shows error message', () => {
    render(
      <Select name="choice" options={options} error="Selection required" />,
    );
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('applies error border class when error is present', () => {
    render(
      <Select
        name="choice"
        options={options}
        error="Error"
        data-testid="select"
      />,
    );
    const select = screen.getByTestId('select');
    expect(select.className).toContain('border-danger');
    expect(select.className).not.toContain('border-gray-300');
  });

  it('applies normal border class when no error', () => {
    render(
      <Select name="choice" options={options} data-testid="select" />,
    );
    const select = screen.getByTestId('select');
    expect(select.className).toContain('border-gray-300');
    expect(select.className).not.toContain('border-danger');
  });

  it('handles onChange when user selects an option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        name="choice"
        label="Choose"
        options={options}
        onChange={onChange}
      />,
    );
    const select = screen.getByLabelText('Choose');
    await user.selectOptions(select, 'opt2');
    expect(onChange).toHaveBeenCalled();
    expect((select as HTMLSelectElement).value).toBe('opt2');
  });

  it('uses id prop for htmlFor when provided', () => {
    render(
      <Select id="custom-id" label="Custom" options={options} />,
    );
    const select = screen.getByLabelText('Custom');
    expect(select).toHaveAttribute('id', 'custom-id');
  });

  it('falls back to name for id when no id provided', () => {
    render(
      <Select name="my-select" label="My Select" options={options} />,
    );
    const select = screen.getByLabelText('My Select');
    expect(select).toHaveAttribute('id', 'my-select');
  });
});
