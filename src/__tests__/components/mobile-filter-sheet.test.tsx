/**
 * Mobile Filter Sheet Tests
 * Story 4.16: Mobile Filter Sheet
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock child filter components
vi.mock('@/components/leads/lead-status-filter', () => ({
  LeadStatusFilter: vi.fn(({ value }: { value: string[] }) => (
    <div data-testid="mock-status-filter" data-value={value.join(',')} />
  )),
}));

vi.mock('@/components/leads/lead-owner-filter', () => ({
  LeadOwnerFilter: vi.fn(({ value }: { value: string[] }) => (
    <div data-testid="mock-owner-filter" data-value={value.join(',')} />
  )),
}));

vi.mock('@/components/leads/lead-date-filter', () => ({
  LeadDateFilter: vi.fn(() => <div data-testid="mock-date-filter" />),
}));

vi.mock('@/components/leads/lead-source-filter', () => ({
  LeadSourceFilter: vi.fn(() => <div data-testid="mock-source-filter" />),
}));

import { MobileFilterSheet } from '@/components/leads/mobile-filter-sheet';

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  status: [] as string[],
  owner: [] as string[],
  dateRange: null,
  leadSource: null,
  availableLeadSources: ['Brevo', 'Manual'],
  onApply: vi.fn(),
  onCancel: vi.fn(),
  onClearAll: vi.fn(),
};

describe('MobileFilterSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[P1] Rendering', () => {
    it('should render sheet with testid when open', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByTestId('mobile-filter-sheet')).toBeInTheDocument();
    });

    it('should render sheet title', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByText('Filter Leads')).toBeInTheDocument();
    });

    it('should render sheet description', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByText(/Select filters and tap Apply/)).toBeInTheDocument();
    });

    it('should render all 4 filter sections', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
    });

    it('should render all filter components', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByTestId('mock-status-filter')).toBeInTheDocument();
      expect(screen.getByTestId('mock-owner-filter')).toBeInTheDocument();
      expect(screen.getByTestId('mock-date-filter')).toBeInTheDocument();
      expect(screen.getByTestId('mock-source-filter')).toBeInTheDocument();
    });
  });

  describe('[P1] Action buttons', () => {
    it('should render Cancel button', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render Clear All button', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should render Apply button', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    it('should call onCancel when Cancel clicked', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onCancel).toHaveBeenCalledOnce();
    });

    it('should call onClearAll when Clear All clicked', () => {
      render(<MobileFilterSheet {...defaultProps} />);
      fireEvent.click(screen.getByText('Clear All'));
      expect(defaultProps.onClearAll).toHaveBeenCalledOnce();
    });

    it('should call onApply when Apply clicked', async () => {
      const onApply = vi.fn().mockResolvedValue(undefined);
      render(<MobileFilterSheet {...defaultProps} onApply={onApply} />);
      fireEvent.click(screen.getByText('Apply'));
      await waitFor(() => {
        expect(onApply).toHaveBeenCalledOnce();
      });
    });
  });

  describe('[P1] Apply loading state', () => {
    it('should show Applying text during apply', async () => {
      // Make onApply take time to resolve
      let resolveApply: () => void;
      const onApply = vi.fn().mockReturnValue(
        new Promise<void>((resolve) => { resolveApply = resolve; })
      );

      render(<MobileFilterSheet {...defaultProps} onApply={onApply} />);
      fireEvent.click(screen.getByText('Apply'));

      await waitFor(() => {
        expect(screen.getByText('Applying...')).toBeInTheDocument();
      });

      // Resolve the apply
      resolveApply!();
    });
  });

  describe('[P1] Error handling', () => {
    it('should keep sheet open on apply error', async () => {
      const onApply = vi.fn().mockRejectedValue(new Error('Apply failed'));
      render(<MobileFilterSheet {...defaultProps} onApply={onApply} />);

      fireEvent.click(screen.getByText('Apply'));

      await waitFor(() => {
        // Should show Apply button again (not loading)
        expect(screen.getByText('Apply')).toBeInTheDocument();
      });

      // onOpenChange(false) should NOT have been called
      expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });
});
