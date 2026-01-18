/**
 * Selection Toolbar Tests
 * Story 4.9: Bulk Select - AC#4, AC#5
 *
 * Tests:
 * - AC#4: Display selection count "{count} leads selected"
 * - AC#4: Show "Clear selection" button
 * - AC#5: Clear all selections when button clicked
 * - Accessibility attributes
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectionToolbar } from '@/components/leads/selection-toolbar';

describe('SelectionToolbar', () => {
  const mockOnClearSelection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#4: Display selection count
  describe('AC#4: Selection count display', () => {
    it('displays single lead selection correctly', () => {
      render(
        <SelectionToolbar
          selectedCount={1}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-count')).toHaveTextContent('1 lead selected');
    });

    it('displays plural leads selection correctly', () => {
      render(
        <SelectionToolbar
          selectedCount={5}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-count')).toHaveTextContent('5 leads selected');
    });

    it('displays 10 leads selection correctly', () => {
      render(
        <SelectionToolbar
          selectedCount={10}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-count')).toHaveTextContent('10 leads selected');
    });
  });

  // AC#4: Show clear selection button
  describe('AC#4: Clear selection button', () => {
    it('renders clear selection button', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('clear-selection-button')).toBeInTheDocument();
      expect(screen.getByText('Clear selection')).toBeInTheDocument();
    });
  });

  // AC#5: Clear selection functionality
  describe('AC#5: Clear selection', () => {
    it('calls onClearSelection when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SelectionToolbar
          selectedCount={5}
          onClearSelection={mockOnClearSelection}
        />
      );

      await user.click(screen.getByTestId('clear-selection-button'));

      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  // Conditional rendering
  describe('conditional rendering', () => {
    it('does not render when selectedCount is 0', () => {
      render(
        <SelectionToolbar
          selectedCount={0}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByTestId('selection-toolbar')).not.toBeInTheDocument();
    });

    it('renders when selectedCount is greater than 0', () => {
      render(
        <SelectionToolbar
          selectedCount={1}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-toolbar')).toBeInTheDocument();
    });
  });

  // Accessibility
  describe('accessibility', () => {
    it('has role="toolbar" attribute', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('has aria-label for toolbar', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Selection actions');
    });

    it('clear button has type="button"', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const button = screen.getByTestId('clear-selection-button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  // Styling
  describe('styling', () => {
    it('has background styling classes', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const toolbar = screen.getByTestId('selection-toolbar');
      expect(toolbar).toHaveClass('bg-blue-50');
    });

    it('has animation classes', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const toolbar = screen.getByTestId('selection-toolbar');
      expect(toolbar).toHaveClass('animate-in');
      expect(toolbar).toHaveClass('slide-in-from-top-2');
    });
  });
});
