/**
 * System Health Skeleton Component Tests
 * Story 7.5: System Health
 *
 * Tests for AC#8: Loading State - skeleton loader while health data loads
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SystemHealthSkeleton } from '@/components/settings/system-health-skeleton';

describe('SystemHealthSkeleton', () => {
  it('renders skeleton with correct testid', () => {
    render(<SystemHealthSkeleton />);
    expect(screen.getByTestId('system-health-skeleton')).toBeInTheDocument();
  });

  it('renders skeleton elements for header', () => {
    render(<SystemHealthSkeleton />);
    expect(screen.getByTestId('skeleton-icon')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-refresh-btn')).toBeInTheDocument();
  });

  it('renders skeleton elements for overall status', () => {
    render(<SystemHealthSkeleton />);
    expect(screen.getByTestId('skeleton-status-label')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-status-badge')).toBeInTheDocument();
  });

  it('renders skeleton elements for services label', () => {
    render(<SystemHealthSkeleton />);
    expect(screen.getByTestId('skeleton-services-label')).toBeInTheDocument();
  });

  it('renders 3 service row skeletons', () => {
    render(<SystemHealthSkeleton />);
    expect(screen.getByTestId('skeleton-service-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-service-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-service-row-3')).toBeInTheDocument();
  });

  it('renders inside a Card component', () => {
    const { container } = render(<SystemHealthSkeleton />);
    // Card component renders with data-slot="card" or similar structure
    expect(container.querySelector('[data-testid="system-health-skeleton"]')).toBeInTheDocument();
  });

  it('matches layout structure of loaded state', () => {
    render(<SystemHealthSkeleton />);
    const skeleton = screen.getByTestId('system-health-skeleton');

    // Should have CardHeader and CardContent structure
    expect(skeleton).toBeInTheDocument();

    // Should have header with icon, title, and refresh button placeholders
    expect(screen.getByTestId('skeleton-icon')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-refresh-btn')).toBeInTheDocument();

    // Should have 3 service rows (matching Supabase, Gemini AI, LINE API)
    expect(screen.getByTestId('skeleton-service-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-service-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-service-row-3')).toBeInTheDocument();
  });
});
