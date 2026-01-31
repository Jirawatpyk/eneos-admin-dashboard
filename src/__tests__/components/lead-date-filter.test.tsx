/**
 * Lead Date Filter Tests
 * Story 4.6: Filter by Date
 * Unit tests for rendering, label display, and clear behavior
 * Calendar interactions should be tested via E2E (Playwright)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadDateFilter } from '@/components/leads/lead-date-filter';

describe('LeadDateFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[P1] Default state (no selection)', () => {
    it('should render filter container', () => {
      render(<LeadDateFilter value={null} onChange={vi.fn()} />);
      expect(screen.getByTestId('lead-date-filter')).toBeInTheDocument();
    });

    it('should display "All Time" as default label', () => {
      render(<LeadDateFilter value={null} onChange={vi.fn()} />);
      expect(screen.getByTestId('date-filter-trigger')).toBeInTheDocument();
      // formatDateRangeLabel(null) returns "All Time"
      expect(screen.getByText('All Time')).toBeInTheDocument();
    });

    it('should not show clear button when no selection', () => {
      render(<LeadDateFilter value={null} onChange={vi.fn()} />);
      expect(screen.queryByTestId('date-filter-clear')).not.toBeInTheDocument();
    });

    it('should have aria-label for accessibility', () => {
      render(<LeadDateFilter value={null} onChange={vi.fn()} />);
      expect(screen.getByTestId('date-filter-trigger')).toHaveAttribute(
        'aria-label',
        'Filter by date'
      );
    });

    it('should have ARIA live region for announcements', () => {
      render(<LeadDateFilter value={null} onChange={vi.fn()} />);
      const announcement = screen.getByTestId('date-filter-announcement');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveTextContent('No date filter active, showing all leads');
    });
  });

  describe('[P1] With active selection', () => {
    const activeRange = {
      from: new Date('2026-01-01'),
      to: new Date('2026-01-31'),
    };

    it('should show clear button when date is selected', () => {
      render(<LeadDateFilter value={activeRange} onChange={vi.fn()} />);
      expect(screen.getByTestId('date-filter-clear')).toBeInTheDocument();
    });

    it('should call onChange(null) when quick clear clicked', () => {
      const onChange = vi.fn();
      render(<LeadDateFilter value={activeRange} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('date-filter-clear'));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should update aria-label when selection active', () => {
      render(<LeadDateFilter value={activeRange} onChange={vi.fn()} />);
      const trigger = screen.getByTestId('date-filter-trigger');
      expect(trigger.getAttribute('aria-label')).toContain('Filter by date,');
    });

    it('should update ARIA announcement when filter active', () => {
      render(<LeadDateFilter value={activeRange} onChange={vi.fn()} />);
      const announcement = screen.getByTestId('date-filter-announcement');
      expect(announcement).toHaveTextContent('Date filter active:');
    });
  });

  describe('[P1] Disabled state', () => {
    it('should disable trigger button when disabled', () => {
      render(<LeadDateFilter value={null} onChange={vi.fn()} disabled />);
      expect(screen.getByTestId('date-filter-trigger')).toBeDisabled();
    });
  });

  describe('[P1] fullWidth prop', () => {
    it('should apply fullWidth class', () => {
      render(<LeadDateFilter value={null} onChange={vi.fn()} fullWidth />);
      const trigger = screen.getByTestId('date-filter-trigger');
      expect(trigger.className).toContain('w-full');
    });
  });
});
