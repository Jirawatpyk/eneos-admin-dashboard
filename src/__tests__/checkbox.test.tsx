/**
 * Checkbox Component Tests
 * Story 4.9: Bulk Select - AC#1, AC#2, AC#8
 *
 * Tests:
 * - Renders with different states (checked, unchecked, indeterminate)
 * - Keyboard accessibility (Space to toggle)
 * - Screen reader attributes
 * - Custom className support
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
  // AC#2: Checkbox renders correctly in different states
  describe('rendering states', () => {
    it('renders unchecked state by default', () => {
      render(<Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders checked state when checked prop is true', () => {
      render(<Checkbox checked={true} aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders indeterminate state when checked prop is "indeterminate"', () => {
      render(<Checkbox checked="indeterminate" aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      // Radix UI sets data-state attribute for indeterminate
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  // AC#2: Click to toggle selection
  describe('interaction', () => {
    it('calls onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox
          checked={false}
          onCheckedChange={onCheckedChange}
          aria-label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('calls onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox
          checked={true}
          onCheckedChange={onCheckedChange}
          aria-label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });

  // AC#8: Keyboard Accessibility
  describe('keyboard accessibility', () => {
    it('can be toggled with Space key', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox
          checked={false}
          onCheckedChange={onCheckedChange}
          aria-label="Test checkbox"
        />
      );

      await user.tab(); // Focus the checkbox

      // userEvent keyboard simulation works better with Radix
      await user.keyboard(' ');

      expect(onCheckedChange).toHaveBeenCalled();
    });

    it('has tabIndex for focus navigation', () => {
      render(<Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      // Radix checkbox is focusable by default
      expect(checkbox).not.toHaveAttribute('tabindex', '-1');
    });

    it('maintains focus after toggle', async () => {
      const user = userEvent.setup();
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(document.activeElement).toBe(checkbox);
    });
  });

  // Accessibility attributes
  describe('accessibility', () => {
    it('supports aria-label', () => {
      render(<Checkbox aria-label="Select row 1" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Select row 1');
    });

    it('supports aria-labelledby', () => {
      render(
        <>
          <label id="checkbox-label">Select this item</label>
          <Checkbox aria-labelledby="checkbox-label" />
        </>
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-labelledby', 'checkbox-label');
    });
  });

  // Styling
  describe('styling', () => {
    it('accepts custom className', () => {
      render(<Checkbox className="custom-class" aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('custom-class');
    });

    it('has focus-visible ring styles', () => {
      render(<Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      // Check that focus-visible classes are applied
      expect(checkbox).toHaveClass('focus-visible:outline-none');
      expect(checkbox).toHaveClass('focus-visible:ring-2');
    });

    it('has disabled styles when disabled', () => {
      render(<Checkbox disabled aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
      expect(checkbox).toHaveClass('disabled:opacity-50');
    });
  });

  // Disabled state
  describe('disabled state', () => {
    it('cannot be clicked when disabled', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox
          disabled
          checked={false}
          onCheckedChange={onCheckedChange}
          aria-label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });
});
