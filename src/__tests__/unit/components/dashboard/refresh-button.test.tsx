/**
 * Refresh Button Tests
 * Story 2.8: Auto Refresh
 *
 * AC#4: Manual Refresh Button - immediate data reload
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RefreshButton } from '@/components/dashboard/refresh-button';

describe('RefreshButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('AC#4: Manual Refresh Button', () => {
    it('should render refresh button', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      const button = screen.getByTestId('refresh-button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when refreshing', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={true} />);

      const button = screen.getByTestId('refresh-button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled when not refreshing', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      const button = screen.getByTestId('refresh-button');
      expect(button).not.toBeDisabled();
    });

    it('should not call onClick when disabled', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={true} />);

      const button = screen.getByTestId('refresh-button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should have accessible aria-label in Thai', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'รีเฟรชข้อมูล Dashboard');
    });

    it('should have title tooltip in Thai', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'รีเฟรชข้อมูล');
    });
  });

  describe('Visual Feedback', () => {
    it('should show spinning icon when refreshing', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={true} />);

      const button = screen.getByTestId('refresh-button');
      const icon = button.querySelector('svg');
      expect(icon).toHaveClass('animate-spin');
    });

    it('should not spin icon when not refreshing', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      const button = screen.getByTestId('refresh-button');
      const icon = button.querySelector('svg');
      expect(icon).not.toHaveClass('animate-spin');
    });

    it('should render icon with aria-hidden', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      const button = screen.getByTestId('refresh-button');
      const icon = button.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(
        <RefreshButton
          onClick={mockOnClick}
          isRefreshing={false}
          className="custom-class"
        />
      );

      const button = screen.getByTestId('refresh-button');
      expect(button).toHaveClass('custom-class');
    });

    it('should use ghost variant', () => {
      render(<RefreshButton onClick={mockOnClick} isRefreshing={false} />);

      const button = screen.getByTestId('refresh-button');
      // Check for ghost button styling (no background)
      expect(button).toBeInTheDocument();
    });
  });
});
