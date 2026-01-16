import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

describe('MobileSidebar', () => {
  it('renders hamburger menu button', () => {
    render(<MobileSidebar />);

    const button = screen.getByRole('button', { name: /open navigation menu/i });
    expect(button).toBeInTheDocument();
  });

  it('hamburger button is only visible on mobile (md:hidden)', () => {
    render(<MobileSidebar />);

    const button = screen.getByRole('button', { name: /open navigation menu/i });
    expect(button).toHaveClass('md:hidden');
  });

  it('has proper accessibility label on trigger button', () => {
    render(<MobileSidebar />);

    const button = screen.getByRole('button', { name: /open navigation menu/i });
    expect(button).toHaveAttribute('aria-label', 'Open navigation menu');
  });
});
