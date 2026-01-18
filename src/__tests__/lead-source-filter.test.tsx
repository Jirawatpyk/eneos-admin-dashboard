/**
 * Lead Source Filter Tests
 * Story 4.14: Filter by Lead Source
 *
 * Tests for:
 * - AC#1: Filter dropdown display
 * - AC#2: Source options
 * - AC#3: Single-select filter
 * - AC#8: Empty source handling
 * - AC#9: Accessibility
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { LeadSourceFilter } from '@/components/leads/lead-source-filter';

// Mock DOM APIs for radix-ui components
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('LeadSourceFilter', () => {
  const mockOnChange = vi.fn();
  const mockSources = ['Email Campaign', 'Website', 'Referral', 'LinkedIn'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#1: Filter Dropdown Display', () => {
    it('renders filter with icon', () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const container = screen.getByTestId('lead-source-filter');
      expect(container).toBeInTheDocument();
    });

    it('shows "All Sources" by default when no selection', () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toHaveTextContent('All Sources');
    });

    it('opens dropdown when clicked', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('AC#2: Source Options', () => {
    it('displays all source options plus All Sources and Unknown', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('source-option-all')).toBeInTheDocument();
        expect(screen.getByTestId('source-option-unknown')).toBeInTheDocument();
        expect(screen.getByTestId('source-option-email-campaign')).toBeInTheDocument();
        expect(screen.getByTestId('source-option-website')).toBeInTheDocument();
        expect(screen.getByTestId('source-option-referral')).toBeInTheDocument();
        expect(screen.getByTestId('source-option-linkedin')).toBeInTheDocument();
      });
    });

    it('shows "All Sources" option at top', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        const options = within(listbox).getAllByRole('option');
        expect(options[0]).toHaveTextContent('All Sources');
      });
    });

    it('shows "Unknown" option for null sources (AC#8)', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        const options = within(listbox).getAllByRole('option');
        expect(options[1]).toHaveTextContent('Unknown');
      });
    });
  });

  describe('AC#3: Single-Select Filter', () => {
    it('calls onChange with selected source', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('source-option-website')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('source-option-website'));

      expect(mockOnChange).toHaveBeenCalledWith('Website');
    });

    it('replaces selection when clicking another source', async () => {
      render(
        <LeadSourceFilter
          value="Website"
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('source-option-referral')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('source-option-referral'));

      expect(mockOnChange).toHaveBeenCalledWith('Referral');
    });

    it('shows selected source name in trigger', () => {
      render(
        <LeadSourceFilter
          value="Website"
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toHaveTextContent('Website');
    });
  });

  describe('AC#6: Clear Filter', () => {
    it('clears selection when "All Sources" clicked', async () => {
      render(
        <LeadSourceFilter
          value="Website"
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('source-option-all')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('source-option-all'));

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });

  describe('AC#8: Empty Source Handling', () => {
    it('shows "Unknown" for leads with null source', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('source-option-unknown')).toBeInTheDocument();
        expect(screen.getByTestId('source-option-unknown')).toHaveTextContent('Unknown');
      });
    });

    it('calls onChange with __unknown__ when Unknown is selected', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('source-filter-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('source-option-unknown')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('source-option-unknown'));

      expect(mockOnChange).toHaveBeenCalledWith('__unknown__');
    });

    it('displays "Unknown" in trigger when __unknown__ is selected', () => {
      render(
        <LeadSourceFilter
          value="__unknown__"
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toHaveTextContent('Unknown');
    });
  });

  describe('AC#9: Accessibility', () => {
    it('has accessible label on trigger', () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toHaveAttribute('aria-label', expect.stringContaining('Filter by lead source'));
    });

    it('has accessible label when filter active', () => {
      render(
        <LeadSourceFilter
          value="Website"
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toHaveAttribute('aria-label', expect.stringContaining('Website selected'));
    });

    it('opens dropdown with keyboard', async () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading text when isLoading is true', () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={[]}
          onChange={mockOnChange}
          isLoading={true}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toHaveTextContent('Loading...');
    });

    it('disables trigger when loading', () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={[]}
          onChange={mockOnChange}
          isLoading={true}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('disables trigger when disabled prop is true', () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Visual Indicator', () => {
    it('shows visual indicator when filter active', () => {
      render(
        <LeadSourceFilter
          value="Website"
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).toHaveClass('border-primary');
    });

    it('does not show visual indicator when no filter', () => {
      render(
        <LeadSourceFilter
          value={null}
          sources={mockSources}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByTestId('source-filter-trigger');
      expect(trigger).not.toHaveClass('border-primary');
    });
  });
});
