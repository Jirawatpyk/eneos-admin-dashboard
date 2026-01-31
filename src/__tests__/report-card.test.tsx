/**
 * ReportCard Component Tests
 * Story 6.3: Quick Reports - Task 2 & Task 4
 *
 * Tests for card display, stats, skeleton loading, format selector, and generate button
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDays } from 'lucide-react';
import { ReportCard } from '@/components/export/report-card';
import type { ReportPreset } from '@/components/export/quick-reports';

// Mock useExport
const mockExportData = vi.fn();
vi.mock('@/hooks/use-export', () => ({
  useExport: () => ({
    exportData: mockExportData,
    isExporting: false,
  }),
}));

// Mock report date utils
vi.mock('@/lib/report-date-utils', () => ({
  getReportDateRange: () => ({
    from: new Date(2026, 0, 31),
    to: new Date(2026, 0, 31),
  }),
  formatReportDateLabel: () => 'Jan 31, 2026',
}));

const defaultPreset: ReportPreset = {
  type: 'daily',
  title: 'Daily Summary',
  description: "Today's leads and activity",
  icon: CalendarDays,
  period: 'today',
  stats: [
    { label: 'New Leads', key: 'totalLeads' },
    { label: 'Contacted', key: 'contacted' },
    { label: 'Closed', key: 'closed' },
  ],
};

const defaultStats = { totalLeads: 15, contacted: 8, closed: 3 };

describe('ReportCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExportData.mockResolvedValue(undefined);
  });

  it('should render card title and description', () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    expect(screen.getByText('Daily Summary')).toBeInTheDocument();
    expect(screen.getByText("Today's leads and activity")).toBeInTheDocument();
  });

  it('should render date range label', () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    expect(screen.getByText('Jan 31, 2026')).toBeInTheDocument();
  });

  it('should render stat values and labels', () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('New Leads')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should render skeleton loaders when loading', () => {
    render(<ReportCard preset={defaultPreset} stats={null} isLoading={true} />);

    // Card title should still be visible
    expect(screen.getByText('Daily Summary')).toBeInTheDocument();
    // Stats should show skeletons (3 stat items)
    const skeletons = document.querySelectorAll('[data-testid="stat-skeleton"]');
    expect(skeletons.length).toBe(3);
  });

  it('should show "--" placeholder for null stats when not loading', () => {
    render(<ReportCard preset={defaultPreset} stats={null} isLoading={false} />);

    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBe(3);
  });

  it('should render Generate button', () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('should call exportData with correct params when Generate clicked', async () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    const generateBtn = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateBtn);

    expect(mockExportData).toHaveBeenCalledWith({
      format: 'xlsx',
      dateRange: { from: expect.any(Date), to: expect.any(Date) },
      status: 'all',
      owner: 'all',
      campaign: 'all',
    });
  });

  it('should show loading spinner during export', async () => {
    mockExportData.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    const generateBtn = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });

  it('should reset loading state after export completes', async () => {
    mockExportData.mockResolvedValue(undefined);

    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    const generateBtn = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate/i })).not.toBeDisabled();
    });
  });

  it('should reset loading state after export fails', async () => {
    mockExportData.mockRejectedValue(new Error('Network error'));

    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    const generateBtn = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate/i })).not.toBeDisabled();
    });
  });

  it('should have format selector defaulting to xlsx', () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    // The select trigger should show xlsx
    expect(screen.getByText('xlsx')).toBeInTheDocument();
  });

  it('should format conversionRate as percentage', () => {
    const preset = {
      ...defaultPreset,
      stats: [{ label: 'Conversion', key: 'conversionRate' }],
    };
    render(<ReportCard preset={preset} stats={{ conversionRate: 25.5 }} isLoading={false} />);

    expect(screen.getByText('25.5%')).toBeInTheDocument();
  });

  it('should display string values directly (e.g., topSalesName)', () => {
    const preset = {
      ...defaultPreset,
      stats: [{ label: 'Top Performer', key: 'topSalesName' }],
    };
    render(<ReportCard preset={preset} stats={{ topSalesName: 'Alice' }} isLoading={false} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('should have accessible button label', () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    const btn = screen.getByRole('button', { name: /generate/i });
    expect(btn).toHaveAttribute('aria-label', 'Generate Daily Summary report');
  });

  it('should render format selector as combobox with xlsx default (AC6)', () => {
    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    // Verify format selector renders as accessible combobox
    const formatSelector = screen.getByRole('combobox');
    expect(formatSelector).toBeInTheDocument();
    // Default value is xlsx
    expect(screen.getByText('xlsx')).toBeInTheDocument();
  });

  it('should log error to console when export fails (AC8)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exportError = new Error('Network error');
    mockExportData.mockRejectedValue(exportError);

    render(<ReportCard preset={defaultPreset} stats={defaultStats} isLoading={false} />);

    const generateBtn = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Quick report generation failed:', exportError);
    });

    consoleSpy.mockRestore();
  });
});
