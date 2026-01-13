/**
 * Auto Refresh Toggle Tests
 * Story 2.8: Auto Refresh
 *
 * AC#1: Auto Refresh Toggle - toggle in header, default OFF
 * Note: Removed AC#3 icon tests - icon removed to avoid visual clutter with RefreshButton
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutoRefreshToggle } from '@/components/dashboard/auto-refresh-toggle';

describe('AutoRefreshToggle', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  describe('AC#1: Auto Refresh Toggle', () => {
    it('should render toggle switch', () => {
      render(
        <AutoRefreshToggle enabled={false} onToggle={mockOnToggle} />
      );

      expect(screen.getByTestId('auto-refresh-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('auto-refresh-switch')).toBeInTheDocument();
    });

    it('should display Auto-refresh label', () => {
      render(
        <AutoRefreshToggle enabled={false} onToggle={mockOnToggle} />
      );

      expect(screen.getByText('Auto-refresh')).toBeInTheDocument();
    });

    it('should show disabled state (OFF) when enabled is false', () => {
      render(
        <AutoRefreshToggle enabled={false} onToggle={mockOnToggle} />
      );

      const toggle = screen.getByTestId('auto-refresh-switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('should show enabled state (ON) when enabled is true', () => {
      render(
        <AutoRefreshToggle enabled={true} onToggle={mockOnToggle} />
      );

      const toggle = screen.getByTestId('auto-refresh-switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should call onToggle with true when clicked while disabled', () => {
      render(
        <AutoRefreshToggle enabled={false} onToggle={mockOnToggle} />
      );

      const toggle = screen.getByTestId('auto-refresh-switch');
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it('should call onToggle with false when clicked while enabled', () => {
      render(
        <AutoRefreshToggle enabled={true} onToggle={mockOnToggle} />
      );

      const toggle = screen.getByTestId('auto-refresh-switch');
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(false);
    });

    it('should have accessible aria-label', () => {
      render(
        <AutoRefreshToggle enabled={false} onToggle={mockOnToggle} />
      );

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Toggle auto-refresh');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(
        <AutoRefreshToggle
          enabled={false}
          onToggle={mockOnToggle}
          className="custom-class"
        />
      );

      const container = screen.getByTestId('auto-refresh-toggle');
      expect(container).toHaveClass('custom-class');
    });

    it('should change label color when enabled', () => {
      const { rerender } = render(
        <AutoRefreshToggle enabled={false} onToggle={mockOnToggle} />
      );

      expect(screen.getByText('Auto-refresh')).toHaveClass('text-muted-foreground');

      rerender(
        <AutoRefreshToggle enabled={true} onToggle={mockOnToggle} />
      );

      expect(screen.getByText('Auto-refresh')).toHaveClass('text-foreground');
    });
  });
});
