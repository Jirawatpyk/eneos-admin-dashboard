/**
 * Lead Metrics Component Tests
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#3: Performance Metrics Section
 * - Response Time (new → claimed)
 * - Closing Time (claimed → closed)
 * - Lead Age
 * - Shows "-" when not applicable
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LeadMetrics } from '@/components/leads/lead-metrics';
import type { LeadMetrics as LeadMetricsType } from '@/types/lead-detail';

describe('LeadMetrics', () => {
  const mockMetrics: LeadMetricsType = {
    responseTime: 45, // 45 minutes
    closingTime: 1335, // ~22 hours
    age: 2880, // 2 days
  };

  it('renders all three metrics', () => {
    render(<LeadMetrics metrics={mockMetrics} />);

    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Closing Time')).toBeInTheDocument();
    expect(screen.getByText('Lead Age')).toBeInTheDocument();
  });

  it('formats response time correctly (minutes)', () => {
    render(<LeadMetrics metrics={mockMetrics} />);
    const responseMetric = screen.getByTestId('metric-response-time');
    expect(responseMetric).toHaveTextContent('45 นาที');
  });

  it('formats closing time correctly (hours)', () => {
    render(<LeadMetrics metrics={mockMetrics} />);
    const closingMetric = screen.getByTestId('metric-closing-time');
    // 1335 minutes = 22 hours 15 minutes
    expect(closingMetric).toHaveTextContent('22 ชั่วโมง 15 นาที');
  });

  it('formats lead age correctly (days)', () => {
    render(<LeadMetrics metrics={mockMetrics} />);
    const ageMetric = screen.getByTestId('metric-lead-age');
    // 2880 minutes = 2 days
    expect(ageMetric).toHaveTextContent('2 วัน');
  });

  it('shows "-" for zero values (AC#3)', () => {
    const zeroMetrics: LeadMetricsType = {
      responseTime: 0,
      closingTime: 0,
      age: 0,
    };
    render(<LeadMetrics metrics={zeroMetrics} />);

    const responseMetric = screen.getByTestId('metric-response-time');
    const closingMetric = screen.getByTestId('metric-closing-time');
    const ageMetric = screen.getByTestId('metric-lead-age');

    expect(responseMetric).toHaveTextContent('-');
    expect(closingMetric).toHaveTextContent('-');
    expect(ageMetric).toHaveTextContent('-');
  });

  it('shows "-" for negative values', () => {
    const negativeMetrics: LeadMetricsType = {
      responseTime: -10,
      closingTime: -100,
      age: -50,
    };
    render(<LeadMetrics metrics={negativeMetrics} />);

    const responseMetric = screen.getByTestId('metric-response-time');
    expect(responseMetric).toHaveTextContent('-');
  });

  it('has title attributes for descriptions', () => {
    render(<LeadMetrics metrics={mockMetrics} />);

    // Check that metric values have title attributes
    const metricValues = document.querySelectorAll('[title]');
    expect(metricValues.length).toBeGreaterThan(0);
  });

  it('renders in a grid layout', () => {
    const { container } = render(<LeadMetrics metrics={mockMetrics} />);

    // Check for grid class
    const cardContent = container.querySelector('.grid');
    expect(cardContent).toBeInTheDocument();
    expect(cardContent).toHaveClass('sm:grid-cols-3');
  });
});
