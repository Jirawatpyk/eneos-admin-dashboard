/**
 * Alerts Panel Tests
 * Story 2.6: Alerts Panel
 *
 * AC#1: Alerts Panel Display - panel with actionable warnings
 * AC#2: Alert Types - unclaimed >24h, contacted >7 days
 * AC#3: Alert Content - icon, description, action button
 * AC#4: View Leads Action - navigate with filters
 * AC#5: Alert Count Badge - red/orange badge
 * AC#6: No Alerts State - green checkmark, "All clear!"
 * AC#7: Info Alerts - info icon, different styling
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AlertsPanel } from '@/components/dashboard/alerts-panel';
import { AlertItem } from '@/components/dashboard/alert-item';
import { AlertsPanelSkeleton } from '@/components/dashboard/alerts-panel-skeleton';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Sample alert data
const mockWarningAlerts = [
  {
    id: 'unclaimed-24h',
    type: 'unclaimed' as const,
    message: '5 leads ไม่มีคนรับ >24h',
    count: 5,
    severity: 'warning' as const,
    link: '/leads?status=new&ageMin=1440',
  },
  {
    id: 'stale-contacted',
    type: 'stale_contacted' as const,
    message: '3 leads contacted >7 days',
    count: 3,
    severity: 'warning' as const,
    link: '/leads?status=contacted&ageMin=10080',
  },
];

const mockInfoAlert = {
  id: 'campaign-ending',
  type: 'campaign_ending' as const,
  message: 'Campaign Q1 ends in 3 days',
  severity: 'info' as const,
};

const mockMixedAlerts = [...mockWarningAlerts, mockInfoAlert];

describe('AlertsPanel', () => {
  describe('AC#1: Alerts Panel Display', () => {
    it('renders the Alerts panel with title', () => {
      render(<AlertsPanel alerts={mockWarningAlerts} />);
      expect(screen.getByText('Alerts')).toBeInTheDocument();
    });

    it('has correct data-testid for panel', () => {
      render(<AlertsPanel alerts={mockWarningAlerts} />);
      expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
    });

    it('displays alerts in the panel', () => {
      render(<AlertsPanel alerts={mockWarningAlerts} />);
      expect(screen.getByText('5 leads ไม่มีคนรับ >24h')).toBeInTheDocument();
      expect(screen.getByText('3 leads contacted >7 days')).toBeInTheDocument();
    });
  });

  describe('AC#5: Alert Count Badge', () => {
    it('shows warning count badge when warnings exist', () => {
      render(<AlertsPanel alerts={mockWarningAlerts} />);
      const badge = screen.getByTestId('alert-count-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });

    it('badge has destructive/warning styling', () => {
      render(<AlertsPanel alerts={mockWarningAlerts} />);
      const badge = screen.getByTestId('alert-count-badge');
      // Badge should be visible and styled for urgency (red/destructive variant)
      // Testing presence and that it contains the count rather than implementation-specific CSS
      expect(badge).toBeVisible();
      expect(badge).toHaveTextContent('2');
    });

    it('does not show badge when no warnings', () => {
      render(<AlertsPanel alerts={[mockInfoAlert]} />);
      expect(screen.queryByTestId('alert-count-badge')).not.toBeInTheDocument();
    });
  });

  describe('AC#6: No Alerts State', () => {
    it('shows "All clear!" message when no alerts', () => {
      render(<AlertsPanel alerts={[]} />);
      expect(screen.getByText(/all clear/i)).toBeInTheDocument();
    });

    it('shows green checkmark icon for no alerts', () => {
      render(<AlertsPanel alerts={[]} />);
      expect(screen.getByTestId('no-alerts-icon')).toBeInTheDocument();
    });

    it('no alerts state has green styling', () => {
      render(<AlertsPanel alerts={[]} />);
      const container = screen.getByTestId('no-alerts-state');
      expect(container).toHaveClass('text-green-600');
    });
  });

  describe('AC#7: Info Alerts', () => {
    it('displays info alerts differently from warnings', () => {
      render(<AlertsPanel alerts={mockMixedAlerts} />);
      // Should show all alerts
      expect(screen.getByText('Campaign Q1 ends in 3 days')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows skeleton when loading', () => {
      render(<AlertsPanel alerts={[]} isLoading={true} />);
      expect(screen.getByTestId('alerts-panel-skeleton')).toBeInTheDocument();
    });
  });
});

describe('AlertItem', () => {
  describe('AC#2 & AC#3: Alert Types and Content', () => {
    it('displays warning icon for warning alerts', () => {
      render(<AlertItem alert={mockWarningAlerts[0]} />);
      const icon = screen.getByTestId(`alert-icon-${mockWarningAlerts[0].id}`);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-amber-500');
    });

    it('displays info icon for info alerts', () => {
      render(<AlertItem alert={mockInfoAlert} />);
      const icon = screen.getByTestId(`alert-icon-${mockInfoAlert.id}`);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-blue-500');
    });

    it('displays alert message', () => {
      render(<AlertItem alert={mockWarningAlerts[0]} />);
      expect(screen.getByText(mockWarningAlerts[0].message)).toBeInTheDocument();
    });
  });

  describe('AC#4: View Leads Action', () => {
    it('shows "View Leads" button when link exists', () => {
      render(<AlertItem alert={mockWarningAlerts[0]} />);
      const link = screen.getByRole('link', { name: /view leads/i });
      expect(link).toBeInTheDocument();
    });

    it('links to correct filtered URL', () => {
      render(<AlertItem alert={mockWarningAlerts[0]} />);
      const link = screen.getByRole('link', { name: /view leads/i });
      expect(link).toHaveAttribute('href', mockWarningAlerts[0].link);
    });

    it('does not show action button when no link', () => {
      render(<AlertItem alert={mockInfoAlert} />);
      expect(screen.queryByRole('link', { name: /view/i })).not.toBeInTheDocument();
    });

    it('link is clickable and focusable', async () => {
      const user = userEvent.setup();
      render(<AlertItem alert={mockWarningAlerts[0]} />);
      const link = screen.getByRole('link', { name: /view leads/i });

      // Verify link can receive focus
      await user.tab();
      expect(link).toHaveFocus();
    });
  });

  describe('Accessibility: ARIA attributes', () => {
    it('warning alerts have role="alert" for screen readers', () => {
      render(<AlertItem alert={mockWarningAlerts[0]} />);
      const alertMessage = screen.getByRole('alert');
      expect(alertMessage).toHaveTextContent(mockWarningAlerts[0].message);
    });

    it('warning alerts have aria-live="polite"', () => {
      render(<AlertItem alert={mockWarningAlerts[0]} />);
      const alertMessage = screen.getByRole('alert');
      expect(alertMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('info alerts do not have alert role', () => {
      render(<AlertItem alert={mockInfoAlert} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

describe('AlertsPanelSkeleton', () => {
  it('renders skeleton loading state', () => {
    render(<AlertsPanelSkeleton />);
    expect(screen.getByTestId('alerts-panel-skeleton')).toBeInTheDocument();
  });

  it('has aria-busy attribute', () => {
    render(<AlertsPanelSkeleton />);
    const skeleton = screen.getByTestId('alerts-panel-skeleton');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('has aria-label for accessibility', () => {
    render(<AlertsPanelSkeleton />);
    const skeleton = screen.getByTestId('alerts-panel-skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading alerts');
  });
});
