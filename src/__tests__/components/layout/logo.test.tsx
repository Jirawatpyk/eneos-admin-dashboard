import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Logo } from '@/components/layout/logo';

describe('Logo', () => {
  it('renders ENEOS text', () => {
    render(<Logo />);
    expect(screen.getByText('ENEOS')).toBeInTheDocument();
  });

  it('renders logo icon with E letter', () => {
    render(<Logo />);
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('links to dashboard', () => {
    render(<Logo />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('calls onClick handler when provided', () => {
    const onClick = vi.fn();
    render(<Logo onClick={onClick} />);

    const link = screen.getByRole('link');
    fireEvent.click(link);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has ENEOS brand red background on icon', () => {
    render(<Logo />);

    const iconContainer = screen.getByText('E').parentElement;
    expect(iconContainer).toHaveClass('bg-eneos-red');
  });
});
