import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import StatCard from '@/components/common/StatCard';
import { Receipt } from 'lucide-react';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Sales" value="₹5,000" />);
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('₹5,000')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<StatCard label="Sales" value="₹0" onClick={onClick} />);
    fireEvent.click(screen.getByText('Sales'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders with icon and variant', () => {
    render(
      <StatCard
        label="Revenue"
        value="₹10,000"
        icon={<Receipt data-testid="icon" />}
        variant="success"
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders trend when provided', () => {
    render(<StatCard label="Sales" value="₹5,000" trend={{ value: 12.5, label: 'vs last month' }} />);
    expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
  });
});
