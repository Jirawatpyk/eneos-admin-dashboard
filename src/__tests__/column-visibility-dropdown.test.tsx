/**
 * Column Visibility Dropdown Component Tests
 * Technical Debt: Table Column Toggle Feature
 *
 * Tests:
 * - Renders trigger button
 * - Opens dropdown on click
 * - Shows all toggleable columns
 * - Toggles column visibility
 * - Shows reset option when columns hidden
 * - Accessibility (aria labels)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ColumnVisibilityDropdown } from '@/components/leads/column-visibility-dropdown';
import { TOGGLEABLE_COLUMNS, COLUMN_DEFINITIONS } from '@/hooks/use-column-visibility';

describe('ColumnVisibilityDropdown', () => {
  const mockIsColumnVisible = vi.fn();
  const mockToggleColumnVisibility = vi.fn();
  const mockResetColumnVisibility = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: all columns visible
    mockIsColumnVisible.mockReturnValue(true);
  });

  const defaultProps = {
    isColumnVisible: mockIsColumnVisible,
    toggleColumnVisibility: mockToggleColumnVisibility,
    resetColumnVisibility: mockResetColumnVisibility,
    hiddenColumnCount: 0,
  };

  describe('rendering', () => {
    it('renders trigger button', () => {
      render(<ColumnVisibilityDropdown {...defaultProps} />);

      expect(screen.getByTestId('column-visibility-trigger')).toBeInTheDocument();
      expect(screen.getByText('Columns')).toBeInTheDocument();
    });

    it('does not show hidden count badge when no columns hidden', () => {
      render(<ColumnVisibilityDropdown {...defaultProps} />);

      expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    });

    it('shows hidden count badge when columns are hidden', () => {
      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={2} />);

      expect(screen.getByText('2 hidden')).toBeInTheDocument();
    });

    it('uses singular form for 1 hidden column in aria-label', () => {
      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={1} />);

      expect(screen.getByTestId('column-visibility-trigger')).toHaveAttribute(
        'aria-label',
        'Toggle column visibility. 1 column hidden.'
      );
    });

    it('uses plural form for multiple hidden columns in aria-label', () => {
      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={3} />);

      expect(screen.getByTestId('column-visibility-trigger')).toHaveAttribute(
        'aria-label',
        'Toggle column visibility. 3 columns hidden.'
      );
    });

    it('disables button when disabled prop is true', () => {
      render(<ColumnVisibilityDropdown {...defaultProps} disabled={true} />);

      expect(screen.getByTestId('column-visibility-trigger')).toBeDisabled();
    });
  });

  describe('dropdown behavior', () => {
    it('opens dropdown on click', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('column-visibility-content')).toBeInTheDocument();
      });
    });

    it('shows label "Toggle Columns"', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Toggle Columns')).toBeInTheDocument();
      });
    });

    it('shows all toggleable columns', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        for (const columnId of TOGGLEABLE_COLUMNS) {
          expect(screen.getByTestId(`column-visibility-${columnId}`)).toBeInTheDocument();
          expect(screen.getByText(COLUMN_DEFINITIONS[columnId])).toBeInTheDocument();
        }
      });
    });

    it('shows checkboxes as checked for visible columns', async () => {
      const user = userEvent.setup();
      mockIsColumnVisible.mockReturnValue(true);

      render(<ColumnVisibilityDropdown {...defaultProps} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        const companyCheckbox = screen.getByTestId('column-visibility-company');
        expect(companyCheckbox).toHaveAttribute('data-state', 'checked');
      });
    });

    it('shows checkboxes as unchecked for hidden columns', async () => {
      const user = userEvent.setup();
      mockIsColumnVisible.mockImplementation((col) => col !== 'email');

      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={1} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        const emailCheckbox = screen.getByTestId('column-visibility-email');
        expect(emailCheckbox).toHaveAttribute('data-state', 'unchecked');
      });
    });
  });

  describe('toggle functionality', () => {
    it('calls toggleColumnVisibility when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('column-visibility-email')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('column-visibility-email'));

      expect(mockToggleColumnVisibility).toHaveBeenCalledWith('email');
    });

    it('toggles multiple columns', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} />);

      // First toggle
      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('column-visibility-email')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('column-visibility-email'));
      expect(mockToggleColumnVisibility).toHaveBeenCalledWith('email');

      // Re-open dropdown for second toggle (dropdown closes after selection)
      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('column-visibility-phone')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('column-visibility-phone'));
      expect(mockToggleColumnVisibility).toHaveBeenCalledWith('phone');
    });
  });

  describe('reset functionality', () => {
    it('does not show reset option when no columns hidden', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={0} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('column-visibility-content')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('column-visibility-reset')).not.toBeInTheDocument();
    });

    it('shows reset option when columns are hidden', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={2} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('column-visibility-reset')).toBeInTheDocument();
      });
    });

    it('calls resetColumnVisibility when reset is clicked', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={2} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('column-visibility-reset')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('column-visibility-reset'));

      expect(mockResetColumnVisibility).toHaveBeenCalled();
    });

    it('shows "Reset to default" text', async () => {
      const user = userEvent.setup();
      render(<ColumnVisibilityDropdown {...defaultProps} hiddenColumnCount={2} />);

      await user.click(screen.getByTestId('column-visibility-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Reset to default')).toBeInTheDocument();
      });
    });
  });
});
