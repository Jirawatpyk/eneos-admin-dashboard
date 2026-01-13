/**
 * Dashboard Error Component Tests
 * Story 2.1: KPI Cards
 * AC: #6 - Error State
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardError } from '../components/dashboard/dashboard-error';

describe('DashboardError', () => {
  const mockRefetch = vi.fn();
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    // Set to development for console.error tests
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // AC#6: Error state with retry button
  describe('AC#6: Error State', () => {
    it('should display error message', () => {
      render(
        <DashboardError
          message="Failed to fetch dashboard data"
          onRetry={mockRefetch}
        />
      );

      expect(screen.getByText('Failed to fetch dashboard data')).toBeInTheDocument();
    });

    it('should display default message when none provided', () => {
      render(<DashboardError onRetry={mockRefetch} />);

      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('should display "Failed to load dashboard" heading', () => {
      render(<DashboardError onRetry={mockRefetch} />);

      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
    });

    it('should display retry button', () => {
      render(<DashboardError onRetry={mockRefetch} />);

      expect(screen.getByTestId('btn-retry')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      render(<DashboardError onRetry={mockRefetch} />);

      fireEvent.click(screen.getByTestId('btn-retry'));

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should log error to console for debugging in development', () => {
      const errorMessage = 'API connection failed';
      render(<DashboardError message={errorMessage} onRetry={mockRefetch} />);

      expect(consoleSpy).toHaveBeenCalledWith('Dashboard error:', errorMessage);
    });

    it('should not log error to console in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.clearAllMocks();

      render(<DashboardError message="Error" onRetry={mockRefetch} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should render with destructive border', () => {
      render(<DashboardError onRetry={mockRefetch} />);

      const card = screen.getByTestId('dashboard-error');
      expect(card).toHaveClass('border-destructive');
    });

    it('should display error icon', () => {
      const { container } = render(<DashboardError onRetry={mockRefetch} />);

      // AlertCircle icon should be present
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
