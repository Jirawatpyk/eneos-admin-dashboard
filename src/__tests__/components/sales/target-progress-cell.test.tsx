/**
 * Target Progress Cell Tests
 * Story 3.7: Target vs Actual Comparison
 * Task 4: Table Target Column (AC#3, AC#4)
 * Task 5: Achievement Badge (AC#5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TargetProgressCell,
  TargetAchievementBadge,
} from '@/components/sales/target-progress-cell';

// Mock date for consistent testing
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-15'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('TargetProgressCell', () => {
  const defaultProps = {
    actual: 10,
    target: 15,
  };

  describe('Basic Rendering', () => {
    it('should render the cell with actual value', () => {
      render(<TargetProgressCell {...defaultProps} />);

      expect(screen.getByTestId('target-progress-cell')).toBeInTheDocument();
      expect(screen.getByTestId('actual-value')).toHaveTextContent('10');
    });

    it('should render progress bar', () => {
      render(<TargetProgressCell {...defaultProps} />);

      expect(screen.getByTestId('target-cell-progress-bar')).toBeInTheDocument();
    });

    it('should show target value in subtitle', () => {
      render(<TargetProgressCell {...defaultProps} />);

      expect(screen.getByText('of 15')).toBeInTheDocument();
    });

    it('should show percentage', () => {
      // 10 / 15 = 66.67%
      render(<TargetProgressCell {...defaultProps} />);

      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });

  describe('Color Coding (AC#3)', () => {
    it('should have red color when below 70%', () => {
      // 6 / 15 = 40%
      render(<TargetProgressCell actual={6} target={15} />);

      const percentText = screen.getByText('40%');
      expect(percentText).toHaveClass('text-red-600');
    });

    it('should have amber color when 70-99%', () => {
      // 12 / 15 = 80%
      render(<TargetProgressCell actual={12} target={15} />);

      const percentText = screen.getByText('80%');
      expect(percentText).toHaveClass('text-amber-600');
    });

    it('should have green color when 100%+', () => {
      // 20 / 15 = 133%
      render(<TargetProgressCell actual={20} target={15} />);

      const percentText = screen.getByText('133%');
      expect(percentText).toHaveClass('text-green-600');
    });
  });

  describe('Achievement Badge (AC#5)', () => {
    it('should show badge when target achieved', () => {
      render(<TargetProgressCell actual={15} target={15} />);

      expect(screen.getByTestId('achievement-badge')).toBeInTheDocument();
    });

    it('should not show badge when below target', () => {
      render(<TargetProgressCell actual={10} target={15} />);

      expect(screen.queryByTestId('achievement-badge')).not.toBeInTheDocument();
    });

    it('should not show badge when showAchievementBadge is false', () => {
      render(
        <TargetProgressCell actual={15} target={15} showAchievementBadge={false} />
      );

      expect(screen.queryByTestId('achievement-badge')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip (AC#8)', () => {
    it('should show tooltip with breakdown on hover', async () => {
      // Use real timers for tooltip tests since Radix tooltip has internal delays
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<TargetProgressCell {...defaultProps} />);

      const cell = screen.getByTestId('target-progress-cell');
      await user.hover(cell);

      // Use findAllBy since Radix renders tooltip content twice for accessibility
      expect(await screen.findByTestId('target-cell-tooltip', {}, { timeout: 2000 })).toBeInTheDocument();
      expect(screen.getAllByText('closed vs Target').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Current:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Target:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Progress:').length).toBeGreaterThan(0);

      // Restore fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15'));
    });

    it('should show "Target achieved!" in tooltip when achieved', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<TargetProgressCell actual={20} target={15} />);

      const cell = screen.getByTestId('target-progress-cell');
      await user.hover(cell);

      const achievedTexts = await screen.findAllByText('Target achieved!', {}, { timeout: 2000 });
      expect(achievedTexts.length).toBeGreaterThan(0);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15'));
    });

    it('should use custom metric label in tooltip', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<TargetProgressCell {...defaultProps} metricLabel="claimed" />);

      const cell = screen.getByTestId('target-progress-cell');
      await user.hover(cell);

      const labelTexts = await screen.findAllByText('claimed vs Target', {}, { timeout: 2000 });
      expect(labelTexts.length).toBeGreaterThan(0);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle target = 0 (edge case)', () => {
      render(<TargetProgressCell actual={5} target={0} />);

      // Should show 100% and achieved badge
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByTestId('achievement-badge')).toBeInTheDocument();
    });

    it('should handle actual = 0', () => {
      render(<TargetProgressCell actual={0} target={15} />);

      expect(screen.getByTestId('actual-value')).toHaveTextContent('0');
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should cap progress bar at 100% when exceeding', () => {
      // 200% progress
      render(<TargetProgressCell actual={30} target={15} />);

      const progressBar = screen.getByTestId('target-cell-progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });
});

describe('TargetAchievementBadge', () => {
  it('should not render when no targets achieved', () => {
    const { container } = render(
      <TargetAchievementBadge achieved={0} total={3} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render badge when targets achieved', () => {
    render(<TargetAchievementBadge achieved={2} total={3} showDetails />);

    expect(screen.getByTestId('achievement-badge-multi')).toBeInTheDocument();
    expect(screen.getByText('2/3 targets')).toBeInTheDocument();
  });

  it('should show green style when all targets achieved', () => {
    render(<TargetAchievementBadge achieved={3} total={3} />);

    const badge = screen.getByTestId('achievement-badge-multi');
    expect(badge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('should show amber style when partial targets achieved', () => {
    render(<TargetAchievementBadge achieved={2} total={3} showDetails />);

    const badge = screen.getByTestId('achievement-badge-multi');
    expect(badge).toHaveClass('bg-amber-100', 'text-amber-700');
  });
});
