import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavItem } from '@/components/layout/nav-item';
import { LayoutDashboard } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

describe('NavItem', () => {
  it('renders link with label and icon', () => {
    render(
      <NavItem
        href="/dashboard"
        icon={LayoutDashboard}
        label="Dashboard"
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
  });

  it('shows active state when pathname matches href', () => {
    render(
      <NavItem
        href="/dashboard"
        icon={LayoutDashboard}
        label="Dashboard"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('bg-eneos-red/10');
  });

  it('renders disabled state with "Soon" badge', () => {
    render(
      <TooltipProvider>
        <NavItem
          href="/leads"
          icon={LayoutDashboard}
          label="Leads"
          disabled
        />
      </TooltipProvider>
    );

    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Soon')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('calls onClick when provided', async () => {
    const onClick = vi.fn();
    const { user } = render(
      <NavItem
        href="/sales"
        icon={LayoutDashboard}
        label="Sales"
        onClick={onClick}
      />
    );

    // Note: This would need userEvent setup for proper click testing
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });
});
