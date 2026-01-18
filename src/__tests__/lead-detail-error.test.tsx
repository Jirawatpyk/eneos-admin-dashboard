/**
 * Lead Detail Error Component Tests
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#6: Error Handling
 * - Error message appears with retry button
 * - Retry button triggers a new fetch attempt
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeadDetailError } from '@/components/leads/lead-detail-error';

describe('LeadDetailError', () => {
  it('renders error container', () => {
    render(<LeadDetailError onRetry={() => {}} />);
    const error = screen.getByTestId('lead-detail-error');
    expect(error).toBeInTheDocument();
  });

  it('displays default error message', () => {
    render(<LeadDetailError onRetry={() => {}} />);
    expect(screen.getByText('Failed to load lead details')).toBeInTheDocument();
  });

  it('displays custom error message', () => {
    render(<LeadDetailError onRetry={() => {}} message="Custom error occurred" />);
    expect(screen.getByText('Custom error occurred')).toBeInTheDocument();
  });

  it('displays help text', () => {
    render(<LeadDetailError onRetry={() => {}} />);
    expect(screen.getByText('Please try again or check your connection')).toBeInTheDocument();
  });

  it('renders retry button (AC#6)', () => {
    render(<LeadDetailError onRetry={() => {}} />);
    const retryButton = screen.getByTestId('retry-button');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent('Try Again');
  });

  it('calls onRetry when retry button is clicked (AC#6)', () => {
    const handleRetry = vi.fn();
    render(<LeadDetailError onRetry={handleRetry} />);

    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('retry button has accessible aria-label', () => {
    render(<LeadDetailError onRetry={() => {}} />);
    const retryButton = screen.getByTestId('retry-button');
    expect(retryButton).toHaveAttribute('aria-label', 'Retry loading lead details');
  });

  it('has error styling (destructive border)', () => {
    render(<LeadDetailError onRetry={() => {}} />);
    const errorCard = screen.getByTestId('lead-detail-error');
    expect(errorCard).toHaveClass('border-destructive/50');
  });

  it('displays alert icon', () => {
    const { container } = render(<LeadDetailError onRetry={() => {}} />);
    // Check for lucide icon (AlertCircle)
    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });
});
