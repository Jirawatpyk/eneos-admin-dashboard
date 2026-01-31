/**
 * QuickReports Component Tests
 * Story 6.3: Quick Reports - Task 1
 *
 * Tests for rendering, card layout, and responsive grid
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickReports } from '@/components/export/quick-reports';

// Mock useQuickReports hook
vi.mock('@/hooks/use-quick-reports', () => ({
  useQuickReports: () => ({
    daily: { totalLeads: 5, contacted: 3, closed: 1 },
    weekly: { totalLeads: 50, conversionRate: 25, topSalesName: 'Alice' },
    monthly: { totalLeads: 200, conversionRate: 18, totalCampaigns: 12 },
    isLoading: { daily: false, weekly: false, monthly: false },
  }),
}));

// Mock useExport
vi.mock('@/hooks/use-export', () => ({
  useExport: () => ({
    exportData: vi.fn().mockResolvedValue(undefined),
    isExporting: false,
  }),
}));

// Mock report date utils
vi.mock('@/lib/report-date-utils', () => ({
  getReportDateRange: () => ({
    from: new Date(2026, 0, 31),
    to: new Date(2026, 0, 31),
  }),
  formatReportDateLabel: (type: string) => {
    if (type === 'daily') return 'Jan 31, 2026';
    if (type === 'weekly') return 'Jan 26 - Jan 31, 2026';
    return 'January 2026';
  },
}));

describe('QuickReports', () => {
  it('should render section heading', () => {
    render(<QuickReports />);

    expect(screen.getByText('Quick Reports')).toBeInTheDocument();
    expect(screen.getByText(/one-click preset/i)).toBeInTheDocument();
  });

  it('should render all 3 report cards', () => {
    render(<QuickReports />);

    expect(screen.getByText('Daily Summary')).toBeInTheDocument();
    expect(screen.getByText('Weekly Summary')).toBeInTheDocument();
    expect(screen.getByText('Monthly Summary')).toBeInTheDocument();
  });

  it('should render card descriptions', () => {
    render(<QuickReports />);

    expect(screen.getByText("Today's leads and activity")).toBeInTheDocument();
    expect(screen.getByText("This week's performance overview")).toBeInTheDocument();
    expect(screen.getByText('Full month metrics and trends')).toBeInTheDocument();
  });

  it('should render date range labels', () => {
    render(<QuickReports />);

    expect(screen.getByText('Jan 31, 2026')).toBeInTheDocument();
    expect(screen.getByText('Jan 26 - Jan 31, 2026')).toBeInTheDocument();
    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });

  it('should render 3 Generate buttons', () => {
    render(<QuickReports />);

    const generateBtns = screen.getAllByRole('button', { name: /generate/i });
    expect(generateBtns).toHaveLength(3);
  });

  it('should render 3 format selectors', () => {
    render(<QuickReports />);

    // Each card has an xlsx default selector
    const formatSelectors = screen.getAllByText('xlsx');
    expect(formatSelectors).toHaveLength(3);
  });

  it('should use responsive grid layout', () => {
    const { container } = render(<QuickReports />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should display preview stats for daily card', () => {
    render(<QuickReports />);

    // Daily stats: 5 new leads, 3 contacted, 1 closed
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('New Leads')).toBeInTheDocument();
  });

  it('should display top performer name in weekly card', () => {
    render(<QuickReports />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('should display campaign count in monthly card', () => {
    render(<QuickReports />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
  });
});
