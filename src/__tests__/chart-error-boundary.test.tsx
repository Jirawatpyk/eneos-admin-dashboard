/**
 * Chart Error Boundary Tests
 * Story 3.5: Individual Performance Trend
 *
 * Tests for error boundary that catches Recharts rendering errors
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ChartErrorBoundary } from '@/components/ui/chart-error-boundary';

// Component that throws an error
function ThrowingComponent(): ReactElement {
  throw new Error('Test error');
}

// Component that renders normally
function NormalComponent(): ReactElement {
  return <div data-testid="normal-content">Normal content</div>;
}

describe('ChartErrorBoundary', () => {
  // Suppress console.error for expected errors
  let originalError: typeof console.error;

  beforeAll(() => {
    originalError = console.error;
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ChartErrorBoundary>
          <NormalComponent />
        </ChartErrorBoundary>
      );

      expect(screen.getByTestId('normal-content')).toBeInTheDocument();
      expect(screen.queryByTestId('chart-error-boundary')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays fallback UI', () => {
      render(
        <ChartErrorBoundary>
          <ThrowingComponent />
        </ChartErrorBoundary>
      );

      expect(screen.getByTestId('chart-error-boundary')).toBeInTheDocument();
      expect(screen.getByText('Unable to render chart')).toBeInTheDocument();
      expect(screen.getByText('An error occurred while displaying this chart')).toBeInTheDocument();
    });

    it('displays custom fallback title when provided', () => {
      render(
        <ChartErrorBoundary fallbackTitle="Custom Chart Title">
          <ThrowingComponent />
        </ChartErrorBoundary>
      );

      expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
    });

    it('shows retry button', () => {
      render(
        <ChartErrorBoundary>
          <ThrowingComponent />
        </ChartErrorBoundary>
      );

      expect(screen.getByTestId('chart-error-retry')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('calls onReset when retry button is clicked', () => {
      const onReset = vi.fn();
      render(
        <ChartErrorBoundary onReset={onReset}>
          <ThrowingComponent />
        </ChartErrorBoundary>
      );

      fireEvent.click(screen.getByTestId('chart-error-retry'));
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });
});
