/**
 * Lead Status Filter Tests
 * Story 4.4: Filter by Status
 *
 * Tests for:
 * - AC#1: Filter dropdown display
 * - AC#2: Status options with colored badges
 * - AC#3: Multi-select filter
 * - AC#6: Clear filter
 * - AC#8: Filter badge/indicator
 * - AC#9: Accessibility (keyboard navigation)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadStatusFilter } from '@/components/leads/lead-status-filter';

describe('LeadStatusFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#1: Filter Dropdown Display', () => {
    it('renders filter button with icon', () => {
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Status');
    });

    it('shows "All Statuses" by default when no selection', () => {
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toHaveTextContent('Status');
    });

    it('opens popover when clicked', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('AC#2: Status Options', () => {
    it('displays all 6 status options', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));

      expect(screen.getByTestId('status-option-all')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-new')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-claimed')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-contacted')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-closed')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-lost')).toBeInTheDocument();
      expect(screen.getByTestId('status-option-unreachable')).toBeInTheDocument();
    });

    it('shows "All Statuses" option at top', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));

      const listbox = screen.getByRole('listbox');
      const options = within(listbox).getAllByRole('option');
      expect(options[0]).toHaveTextContent('All Statuses');
    });

    it('shows checkmark for All Statuses when no filter active', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));

      const allOption = screen.getByTestId('status-option-all');
      expect(allOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('AC#3: Multi-Select Filter', () => {
    it('calls onChange with selected status', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      await user.click(screen.getByTestId('status-option-new'));

      expect(mockOnChange).toHaveBeenCalledWith(['new']);
    });

    it('adds status to existing selection', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={['new']} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      await user.click(screen.getByTestId('status-option-claimed'));

      expect(mockOnChange).toHaveBeenCalledWith(['new', 'claimed']);
    });

    it('removes status when clicking selected status', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={['new', 'claimed']} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      await user.click(screen.getByTestId('status-option-new'));

      expect(mockOnChange).toHaveBeenCalledWith(['claimed']);
    });

    it('shows checkmarks for selected items', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={['new', 'closed']} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));

      expect(screen.getByTestId('status-option-new')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('status-option-closed')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('status-option-claimed')).toHaveAttribute('aria-selected', 'false');
    });

    it('shows "X selected" indicator when multiple selected', () => {
      render(<LeadStatusFilter value={['new', 'claimed']} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toHaveTextContent('2 selected');
    });
  });

  describe('AC#6: Clear Filter', () => {
    it('clears selection when "All Statuses" clicked', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={['new', 'claimed']} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      await user.click(screen.getByTestId('status-option-all'));

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('closes popover after clearing with All Statuses', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={['new']} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      await user.click(screen.getByTestId('status-option-all'));

      // Popover should close after clearing
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('AC#8: Filter Badge/Indicator', () => {
    it('shows clear button when filter active', () => {
      render(<LeadStatusFilter value={['new']} onChange={mockOnChange} />);

      expect(screen.getByTestId('status-filter-clear')).toBeInTheDocument();
    });

    it('hides clear button when no filter', () => {
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      expect(screen.queryByTestId('status-filter-clear')).not.toBeInTheDocument();
    });

    it('clears filter when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={['new', 'claimed']} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-clear'));

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('shows visual indicator on button when filter active', () => {
      render(<LeadStatusFilter value={['new']} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toHaveClass('border-primary');
    });

    it('shows single status label when only one selected', () => {
      render(<LeadStatusFilter value={['new']} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toHaveTextContent('ใหม่'); // Thai label for 'new'
    });

    it('shows count badge when multiple selected', () => {
      render(<LeadStatusFilter value={['new', 'claimed', 'closed']} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toHaveTextContent('3');
    });
  });

  describe('AC#9: Accessibility', () => {
    it('has correct aria attributes on trigger', () => {
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('listbox has multiselectable attribute', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('options have correct role and aria-selected', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={['new']} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
      expect(screen.getByTestId('status-option-new')).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates with arrow keys', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      const listbox = screen.getByRole('listbox');

      // Press arrow down to move focus
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });

      // Should focus next option
      const newOption = screen.getByTestId('status-option-new');
      expect(newOption).toHaveClass('bg-accent');
    });

    it('selects option with Enter key', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      const listbox = screen.getByRole('listbox');

      // Move to "new" option (index 1)
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      fireEvent.keyDown(listbox, { key: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith(['new']);
    });

    it('closes popover with Escape key', async () => {
      const user = userEvent.setup();
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      await user.click(screen.getByTestId('status-filter-trigger'));
      const listbox = screen.getByRole('listbox');

      fireEvent.keyDown(listbox, { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('has aria-live region for screen reader announcements', () => {
      render(<LeadStatusFilter value={['new', 'claimed']} onChange={mockOnChange} />);

      const announcement = screen.getByTestId('status-filter-announcement');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
      expect(announcement).toHaveTextContent('2 statuses selected');
    });

    it('announces no filter when none selected', () => {
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} />);

      const announcement = screen.getByTestId('status-filter-announcement');
      expect(announcement).toHaveTextContent('No status filter active');
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<LeadStatusFilter value={[]} onChange={mockOnChange} disabled />);

      const trigger = screen.getByTestId('status-filter-trigger');
      expect(trigger).toBeDisabled();
    });
  });
});
