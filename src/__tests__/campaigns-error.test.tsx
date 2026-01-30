/**
 * Campaigns Error Component Tests
 * Story 5.3: Campaign Summary Cards
 * AC#5: Error state with retry button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignsError } from '../components/campaigns/campaigns-error';

describe('CampaignsError', () => {
  it('should render error container with data-testid', () => {
    const onRetry = vi.fn();
    render(<CampaignsError onRetry={onRetry} />);

    expect(screen.getByTestId('campaigns-error')).toBeInTheDocument();
  });

  it('should display error title', () => {
    const onRetry = vi.fn();
    render(<CampaignsError onRetry={onRetry} />);

    expect(screen.getByText('Failed to load campaigns')).toBeInTheDocument();
  });

  it('should display custom error message', () => {
    const onRetry = vi.fn();
    render(<CampaignsError message="Network connection error" onRetry={onRetry} />);

    expect(screen.getByText('Network connection error')).toBeInTheDocument();
  });

  it('should display default error message when message not provided', () => {
    const onRetry = vi.fn();
    render(<CampaignsError onRetry={onRetry} />);

    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeInTheDocument();
  });

  it('should render retry button', () => {
    const onRetry = vi.fn();
    render(<CampaignsError onRetry={onRetry} />);

    expect(screen.getByTestId('btn-campaigns-retry')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<CampaignsError onRetry={onRetry} />);

    fireEvent.click(screen.getByTestId('btn-campaigns-retry'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have destructive border style', () => {
    const onRetry = vi.fn();
    render(<CampaignsError onRetry={onRetry} />);

    expect(screen.getByTestId('campaigns-error')).toHaveClass('border-destructive');
  });
});
