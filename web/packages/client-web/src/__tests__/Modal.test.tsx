import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/ui/Modal';

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal body content</p>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when open=false', () => {
    render(
      <Modal open={false} onClose={defaultProps.onClose} title="Hidden Modal">
        <p>Should not appear</p>
      </Modal>,
    );
    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('shows the title', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Title">
        <span>Child element</span>
      </Modal>,
    );
    expect(screen.getByText('Child element')).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>,
    );
    // The overlay is the element with bg-black/50
    const overlay = document.querySelector('.bg-black\\/50');
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key press', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on non-Escape key press', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders without title', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>No title modal</p>
      </Modal>,
    );
    expect(screen.getByText('No title modal')).toBeInTheDocument();
    // No heading should appear
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('has a close button when title is provided', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="With Close">
        <p>Content</p>
      </Modal>,
    );
    // The close button is a button element within the header containing the X icon
    const buttons = screen.getAllByRole('button');
    // Click the close button (the one in the header)
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Title">
        <p>Content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow on unmount', () => {
    const { unmount } = render(
      <Modal open={true} onClose={vi.fn()} title="Title">
        <p>Content</p>
      </Modal>,
    );
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
