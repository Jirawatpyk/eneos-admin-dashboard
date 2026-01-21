/**
 * Recent Activity Feed Tests
 * Story 2.5: Recent Activity Feed
 * Story 2.5.1: View All Activity Link Fix
 *
 * AC#1: Activity Feed Display - panel with latest 10 activities
 * AC#2: Activity Types - different types with distinct icon/color
 * AC#3: Activity Details - icon, description, timestamp
 * AC#4: Timestamp Formatting - relative vs date format
 * AC#5: View All Link - navigation to activity log (admin only - Story 2.5.1)
 * AC#6: Color Coding - specific icons for each type
 * AC#7: Loading & Empty States
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { RecentActivitySkeleton } from '@/components/dashboard/recent-activity-skeleton';
import { formatActivityTime } from '@/lib/format-activity-time';
import { TooltipProvider } from '@/components/ui/tooltip';

// Story 2.5.1: Mock useSession from next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

// Mock next/link - pass through all props including aria-label
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Wrapper component with TooltipProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
);

// Custom render with wrapper
const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// M-03 Fix: Use fixed timestamp for consistent tests
const FIXED_NOW = new Date('2026-01-13T12:00:00Z').getTime();

// Sample activity data with fixed timestamps
const mockActivities = [
  {
    id: '1',
    type: 'claimed' as const,
    description: 'สมชาย claimed ABC Corp',
    timestamp: new Date(FIXED_NOW).toISOString(),
    userId: 'user-1',
    leadId: 'lead-1',
  },
  {
    id: '2',
    type: 'contacted' as const,
    description: 'สมหญิง contacted XYZ Ltd',
    timestamp: new Date(FIXED_NOW - 3600000).toISOString(), // 1 hour ago
    userId: 'user-2',
    leadId: 'lead-2',
  },
  {
    id: '3',
    type: 'closed' as const,
    description: 'สมปอง closed deal with Tech Inc',
    timestamp: new Date(FIXED_NOW - 86400000 * 2).toISOString(), // 2 days ago
    userId: 'user-3',
    leadId: 'lead-3',
  },
  {
    id: '4',
    type: 'new_lead' as const,
    description: 'New lead from Brevo: Company ABC',
    timestamp: new Date(FIXED_NOW - 300000).toISOString(), // 5 minutes ago
    userId: undefined,
    leadId: 'lead-4',
  },
];

describe('RecentActivity', () => {
  // M-03 Fix: Mock Date.now for consistent tests
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    // Story 2.5.1: Default to admin session for existing tests
    mockUseSession.mockReturnValue({
      data: { user: { email: 'admin@eneos.co.th', role: 'admin' } },
      status: 'authenticated',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('AC#1: Activity Feed Display', () => {
    it('renders the Recent Activity panel', () => {
      renderWithProvider(<RecentActivity activities={mockActivities} />);
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('displays up to 10 activities', () => {
      const manyActivities = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        type: 'claimed' as const,
        description: `Activity ${i}`,
        timestamp: new Date(FIXED_NOW).toISOString(),
      }));

      renderWithProvider(<RecentActivity activities={manyActivities} />);
      const items = screen.getAllByTestId(/^activity-item-/);
      expect(items.length).toBeLessThanOrEqual(10);
    });

    it('has correct data-testid for panel', () => {
      renderWithProvider(<RecentActivity activities={mockActivities} />);
      expect(screen.getByTestId('recent-activity-panel')).toBeInTheDocument();
    });

    // M-02 Fix: Edge case - empty array
    it('handles empty activity array correctly', () => {
      renderWithProvider(<RecentActivity activities={[]} />);
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  describe('AC#2 & AC#6: Activity Types and Color Coding', () => {
    it('displays different icons for each activity type', () => {
      renderWithProvider(<RecentActivity activities={mockActivities} />);

      // Check for different activity types
      expect(screen.getByTestId('activity-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('activity-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('activity-item-3')).toBeInTheDocument();
      expect(screen.getByTestId('activity-item-4')).toBeInTheDocument();
    });
  });

  describe('AC#5: View All Link', () => {
    // Story 2.5.1: Admin role tests
    describe('Story 2.5.1 AC#1: Admin sees link', () => {
      it('displays View All Activity link for admin', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'admin@eneos.co.th', role: 'admin' } },
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        const link = screen.getByRole('link', { name: /view all/i });
        expect(link).toBeInTheDocument();
      });

      it('navigates to /settings/activity page for admin', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'admin@eneos.co.th', role: 'admin' } },
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        const link = screen.getByRole('link', { name: /view all/i });
        expect(link).toHaveAttribute('href', '/settings/activity');
      });

      it('has accessible aria-label on link', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'admin@eneos.co.th', role: 'admin' } },
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        const link = screen.getByRole('link', { name: /view all/i });
        expect(link).toHaveAttribute('aria-label', 'View all activity log');
      });
    });

    // Story 2.5.1: Viewer role tests
    describe('Story 2.5.1 AC#2: Viewer does NOT see link', () => {
      it('hides View All Activity link for viewer role', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'viewer@eneos.co.th', role: 'viewer' } },
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        expect(screen.queryByRole('link', { name: /view all/i })).not.toBeInTheDocument();
      });

      it('does not show CardFooter for viewer role', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'viewer@eneos.co.th', role: 'viewer' } },
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        expect(screen.queryByText('View All Activity')).not.toBeInTheDocument();
      });
    });

    // Story 2.5.1: Loading state tests
    describe('Story 2.5.1: Link hidden during session loading', () => {
      it('hides View All Activity link when session is loading', () => {
        mockUseSession.mockReturnValue({
          data: null,
          status: 'loading',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        expect(screen.queryByRole('link', { name: /view all/i })).not.toBeInTheDocument();
      });

      it('hides link when unauthenticated', () => {
        mockUseSession.mockReturnValue({
          data: null,
          status: 'unauthenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        expect(screen.queryByRole('link', { name: /view all/i })).not.toBeInTheDocument();
      });
    });

    // Story 2.5.1: Edge case - user without role property (M-02 fix)
    describe('Story 2.5.1: Edge case - undefined role', () => {
      it('hides link when user exists but role is undefined', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'user@eneos.co.th' } }, // no role property
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        expect(screen.queryByRole('link', { name: /view all/i })).not.toBeInTheDocument();
      });
    });

    // Story 2.5.1 AC#3: Link styling
    describe('Story 2.5.1 AC#3: Link styling', () => {
      it('has hover underline class for styling', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'admin@eneos.co.th', role: 'admin' } },
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        const link = screen.getByRole('link', { name: /view all/i });
        expect(link).toHaveClass('hover:underline');
      });

      it('has arrow icon for navigation indication', () => {
        mockUseSession.mockReturnValue({
          data: { user: { email: 'admin@eneos.co.th', role: 'admin' } },
          status: 'authenticated',
        });
        renderWithProvider(<RecentActivity activities={mockActivities} />);
        const link = screen.getByRole('link', { name: /view all/i });
        // Check the link contains an SVG (ArrowRight icon)
        expect(link.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('AC#7: Loading & Empty States', () => {
    it('shows skeleton when loading', () => {
      renderWithProvider(<RecentActivity activities={[]} isLoading={true} />);
      expect(screen.getByTestId('recent-activity-skeleton')).toBeInTheDocument();
    });

    it('shows empty state when no activities', () => {
      renderWithProvider(<RecentActivity activities={[]} isLoading={false} />);
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });
});

describe('ActivityItem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('AC#3: Activity Details', () => {
    it('displays activity description', () => {
      const activity = mockActivities[0];
      renderWithProvider(<ActivityItem activity={activity} />);
      expect(screen.getByText(activity.description)).toBeInTheDocument();
    });

    it('displays timestamp', () => {
      const activity = mockActivities[0];
      renderWithProvider(<ActivityItem activity={activity} />);
      // Should show relative time for recent activities
      expect(screen.getByTestId(`activity-time-${activity.id}`)).toBeInTheDocument();
    });

    it('displays icon for activity type', () => {
      const activity = mockActivities[0];
      renderWithProvider(<ActivityItem activity={activity} />);
      expect(screen.getByTestId(`activity-icon-${activity.id}`)).toBeInTheDocument();
    });

    // M-02 Fix: Test for long descriptions
    it('handles long descriptions with truncation', () => {
      const longDescription = 'A'.repeat(200);
      const activity = {
        ...mockActivities[0],
        description: longDescription,
      };
      renderWithProvider(<ActivityItem activity={activity} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('AC#6: Color Coding', () => {
    it('applies correct color for claimed type', () => {
      const activity = { ...mockActivities[0], type: 'claimed' as const };
      renderWithProvider(<ActivityItem activity={activity} />);
      const icon = screen.getByTestId(`activity-icon-${activity.id}`);
      expect(icon).toHaveClass('text-blue-600');
    });

    it('applies correct color for contacted type', () => {
      const activity = { ...mockActivities[1], type: 'contacted' as const };
      renderWithProvider(<ActivityItem activity={activity} />);
      const icon = screen.getByTestId(`activity-icon-${activity.id}`);
      expect(icon).toHaveClass('text-amber-600');
    });

    it('applies correct color for closed type', () => {
      const activity = { ...mockActivities[2], type: 'closed' as const };
      renderWithProvider(<ActivityItem activity={activity} />);
      const icon = screen.getByTestId(`activity-icon-${activity.id}`);
      expect(icon).toHaveClass('text-green-600');
    });

    it('applies correct color for new_lead type', () => {
      const activity = { ...mockActivities[3], type: 'new_lead' as const };
      renderWithProvider(<ActivityItem activity={activity} />);
      const icon = screen.getByTestId(`activity-icon-${activity.id}`);
      expect(icon).toHaveClass('text-gray-600');
    });

    it('applies correct color for lost type', () => {
      const activity = { ...mockActivities[0], id: '5', type: 'lost' as const };
      renderWithProvider(<ActivityItem activity={activity} />);
      const icon = screen.getByTestId(`activity-icon-${activity.id}`);
      expect(icon).toHaveClass('text-red-600');
    });

    it('applies correct color for unreachable type', () => {
      const activity = { ...mockActivities[0], id: '6', type: 'unreachable' as const };
      renderWithProvider(<ActivityItem activity={activity} />);
      const icon = screen.getByTestId(`activity-icon-${activity.id}`);
      expect(icon).toHaveClass('text-orange-600');
    });

    // H-02 Fix verification: Unknown activity type fallback
    it('handles unknown activity type gracefully', () => {
      const activity = {
        ...mockActivities[0],
        type: 'unknown_type' as 'claimed', // Force unknown type
      };
      // Should not throw
      expect(() => renderWithProvider(<ActivityItem activity={activity} />)).not.toThrow();
      expect(screen.getByTestId(`activity-icon-${activity.id}`)).toBeInTheDocument();
      // Should use fallback muted color
      expect(screen.getByTestId(`activity-icon-${activity.id}`)).toHaveClass('text-muted-foreground');
    });
  });
});

describe('formatActivityTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('AC#4: Timestamp Formatting', () => {
    it('shows relative time for recent activities (within 24h)', () => {
      const recentDate = new Date(FIXED_NOW - 300000); // 5 minutes ago
      const result = formatActivityTime(recentDate.toISOString());
      expect(result).toMatch(/minutes? ago|just now/i);
    });

    it('shows date format for older activities (older than 24h)', () => {
      const oldDate = new Date(FIXED_NOW - 86400000 * 2); // 2 days ago
      const result = formatActivityTime(oldDate.toISOString());
      // Should be in format like "Jan 12, 10:30 AM"
      expect(result).toMatch(/\w{3} \d{1,2}, \d{1,2}:\d{2} [AP]M/i);
    });

    // H-01 Fix verification: Invalid timestamp handling
    it('handles invalid timestamp gracefully', () => {
      const result = formatActivityTime('invalid-date');
      expect(result).toBe('Unknown time');
    });

    it('handles empty string timestamp', () => {
      const result = formatActivityTime('');
      expect(result).toBe('Unknown time');
    });

    it('handles null-like timestamp', () => {
      const result = formatActivityTime('null');
      expect(result).toBe('Unknown time');
    });
  });
});

describe('RecentActivitySkeleton', () => {
  describe('AC#7: Loading State', () => {
    it('renders skeleton items', () => {
      render(<RecentActivitySkeleton />);
      expect(screen.getByTestId('recent-activity-skeleton')).toBeInTheDocument();
    });

    it('has aria-busy attribute', () => {
      render(<RecentActivitySkeleton />);
      const skeleton = screen.getByTestId('recent-activity-skeleton');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('has aria-label for accessibility', () => {
      render(<RecentActivitySkeleton />);
      const skeleton = screen.getByTestId('recent-activity-skeleton');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading recent activity');
    });
  });
});
