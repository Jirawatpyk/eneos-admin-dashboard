/**
 * Export All Button Component Tests
 * Technical Debt: Export All Feature
 *
 * Tests:
 * - Renders with correct count
 * - Opens dropdown on click
 * - Shows confirmation for large datasets
 * - Handles export actions
 * - Accessibility (aria labels)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportAllButton } from '@/components/leads/export-all-button';

// Mock the hook
vi.mock('@/hooks/use-export-all-leads', () => ({
  useExportAllLeads: vi.fn(() => ({
    isExporting: false,
    progress: null,
    exportAllLeads: vi.fn(),
  })),
}));

import { useExportAllLeads } from '@/hooks/use-export-all-leads';

describe('ExportAllButton', () => {
  const mockExportAllLeads = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useExportAllLeads).mockReturnValue({
      isExporting: false,
      progress: null,
      exportAllLeads: mockExportAllLeads,
    });
  });

  const defaultProps = {
    filters: { status: ['new'] as ('new' | 'contacted' | 'claimed' | 'closed' | 'lost' | 'unreachable')[] },
    totalCount: 100,
  };

  describe('rendering', () => {
    it('renders button with correct count', () => {
      render(<ExportAllButton {...defaultProps} />);

      expect(screen.getByTestId('export-all-button')).toBeInTheDocument();
      expect(screen.getByText('Export All (100)')).toBeInTheDocument();
    });

    it('renders with zero count', () => {
      render(<ExportAllButton {...defaultProps} totalCount={0} />);

      expect(screen.getByText('Export All (0)')).toBeInTheDocument();
      expect(screen.getByTestId('export-all-button')).toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      render(<ExportAllButton {...defaultProps} disabled={true} />);

      expect(screen.getByTestId('export-all-button')).toBeDisabled();
    });

    it('has correct aria-label', () => {
      render(<ExportAllButton {...defaultProps} />);

      expect(screen.getByTestId('export-all-button')).toHaveAttribute(
        'aria-label',
        'Export all 100 leads'
      );
    });

    it('uses singular form for 1 lead', () => {
      render(<ExportAllButton {...defaultProps} totalCount={1} />);

      expect(screen.getByTestId('export-all-button')).toHaveAttribute(
        'aria-label',
        'Export all 1 lead'
      );
    });
  });

  describe('dropdown behavior', () => {
    it('opens dropdown on click', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-dropdown-content')).toBeInTheDocument();
      });
    });

    it('shows Excel and CSV options', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-option-excel')).toBeInTheDocument();
        expect(screen.getByTestId('export-all-option-csv')).toBeInTheDocument();
      });
    });

    it('calls exportAllLeads with excel format', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-option-excel')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('export-all-option-excel'));

      expect(mockExportAllLeads).toHaveBeenCalledWith(
        { status: ['new'] },
        'excel'
      );
    });

    it('calls exportAllLeads with csv format', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-option-csv')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('export-all-option-csv'));

      expect(mockExportAllLeads).toHaveBeenCalledWith(
        { status: ['new'] },
        'csv'
      );
    });
  });

  describe('large dataset confirmation', () => {
    it('shows confirmation dialog for >500 leads', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} totalCount={600} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-option-excel')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('export-all-option-excel'));

      await waitFor(() => {
        expect(screen.getByText('Export 600 leads?')).toBeInTheDocument();
      });
    });

    it('does not show confirmation for <=500 leads', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} totalCount={500} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-option-excel')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('export-all-option-excel'));

      expect(mockExportAllLeads).toHaveBeenCalled();
      expect(screen.queryByText('Export 500 leads?')).not.toBeInTheDocument();
    });

    it('proceeds with export when confirmation is accepted', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} totalCount={600} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-option-excel')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('export-all-option-excel'));

      await waitFor(() => {
        expect(screen.getByText('Export anyway')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Export anyway'));

      expect(mockExportAllLeads).toHaveBeenCalledWith(
        { status: ['new'] },
        'excel'
      );
    });

    it('cancels export when confirmation is declined', async () => {
      const user = userEvent.setup();
      render(<ExportAllButton {...defaultProps} totalCount={600} />);

      await user.click(screen.getByTestId('export-all-button'));

      await waitFor(() => {
        expect(screen.getByTestId('export-all-option-excel')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('export-all-option-excel'));

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));

      expect(mockExportAllLeads).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('shows loading state when exporting', () => {
      vi.mocked(useExportAllLeads).mockReturnValue({
        isExporting: true,
        progress: { loaded: 50, total: 100 },
        exportAllLeads: mockExportAllLeads,
      });

      render(<ExportAllButton {...defaultProps} />);

      expect(screen.getByText('Exporting 50/100...')).toBeInTheDocument();
      expect(screen.getByTestId('export-all-button')).toBeDisabled();
    });

    it('shows aria-busy when exporting', () => {
      vi.mocked(useExportAllLeads).mockReturnValue({
        isExporting: true,
        progress: { loaded: 50, total: 100 },
        exportAllLeads: mockExportAllLeads,
      });

      render(<ExportAllButton {...defaultProps} />);

      expect(screen.getByTestId('export-all-button')).toHaveAttribute(
        'aria-busy',
        'true'
      );
    });

    it('announces progress to screen readers', () => {
      vi.mocked(useExportAllLeads).mockReturnValue({
        isExporting: true,
        progress: { loaded: 50, total: 100 },
        exportAllLeads: mockExportAllLeads,
      });

      render(<ExportAllButton {...defaultProps} />);

      const srAnnouncement = screen.getByText(
        'Exporting 50 of 100 leads...'
      );
      expect(srAnnouncement).toHaveClass('sr-only');
      expect(srAnnouncement).toHaveAttribute('aria-live', 'polite');
    });
  });
});
