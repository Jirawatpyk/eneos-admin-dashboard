import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/components/layout/sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

describe('Sidebar', () => {
  it('renders ENEOS logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('ENEOS')).toBeInTheDocument();
  });

  it('renders all main navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Export & Reports')).toBeInTheDocument();
  });

  it('renders Settings in secondary navigation', () => {
    render(<Sidebar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has proper accessibility labels', () => {
    render(<Sidebar />);

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Secondary navigation' })).toBeInTheDocument();
  });

  it('is hidden on mobile screens (md:hidden)', () => {
    render(<Sidebar />);

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('hidden');
    expect(aside).toHaveClass('md:flex');
  });

  it('has fixed positioning with correct width', () => {
    render(<Sidebar />);

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('md:fixed');
    expect(aside).toHaveClass('md:w-64');
  });

  it('has z-index for proper layering', () => {
    render(<Sidebar />);

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('z-30');
  });
});
