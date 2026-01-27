import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Logo } from '@/components/layout/logo';

describe('Logo', () => {
  it('renders ENEOS logo image', () => {
    render(<Logo />);
    expect(screen.getByAltText('ENEOS')).toBeInTheDocument();
  });

  it('uses horizontal logo image', () => {
    render(<Logo />);
    const img = screen.getByAltText('ENEOS');
    expect(img).toHaveAttribute('src', expect.stringContaining('eneos-logo-horizontal'));
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
});
