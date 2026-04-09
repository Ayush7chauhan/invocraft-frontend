import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import EmptyState from '@/components/common/EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Start by adding items." />);
    expect(screen.getByText('Start by adding items.')).toBeInTheDocument();
  });

  it('renders action button', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Empty"
        action={<button onClick={onClick}>Add Item</button>}
      />,
    );
    fireEvent.click(screen.getByText('Add Item'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
