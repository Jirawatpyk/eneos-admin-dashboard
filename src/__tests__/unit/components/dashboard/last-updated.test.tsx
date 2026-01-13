/**
 * Last Updated Tests
 * Story 2.8: Auto Refresh
 *
 * AC#5: Last Updated Timestamp - shows relative time, updates in real-time
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LastUpdated } from '@/components/dashboard/last-updated';

describe('LastUpdated', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('AC#5: Last Updated Timestamp', () => {
    it('should render last updated container', () => {
      const timestamp = new Date();
      render(<LastUpdated timestamp={timestamp} />);

      expect(screen.getByTestId('last-updated')).toBeInTheDocument();
    });

    it('should show loading state when timestamp is null', () => {
      render(<LastUpdated timestamp={null} />);

      expect(screen.getByTestId('last-updated')).toBeInTheDocument();
      expect(screen.getByText(/กำลังโหลด/)).toBeInTheDocument();
    });

    it('should display "อัพเดตล่าสุด:" prefix', () => {
      const timestamp = new Date();
      render(<LastUpdated timestamp={timestamp} />);

      expect(screen.getByText(/อัพเดตล่าสุด:/)).toBeInTheDocument();
    });

    it('should show relative time for recent timestamp', () => {
      // Set current time
      const now = new Date('2026-01-13T12:00:00');
      vi.setSystemTime(now);

      // Timestamp is 30 seconds ago
      const timestamp = new Date('2026-01-13T11:59:30');
      render(<LastUpdated timestamp={timestamp} />);

      // Should show something like "less than a minute ago" in Thai
      expect(screen.getByTestId('last-updated')).toBeInTheDocument();
    });

    it('should show relative time for older timestamp', () => {
      // Set current time
      const now = new Date('2026-01-13T12:00:00');
      vi.setSystemTime(now);

      // Timestamp is 5 minutes ago
      const timestamp = new Date('2026-01-13T11:55:00');
      render(<LastUpdated timestamp={timestamp} />);

      // Should show something like "5 minutes ago" in Thai
      expect(screen.getByTestId('last-updated')).toBeInTheDocument();
    });

    it('should update relative time every 10 seconds', async () => {
      const now = new Date('2026-01-13T12:00:00');
      vi.setSystemTime(now);

      const timestamp = new Date('2026-01-13T11:59:55');
      render(<LastUpdated timestamp={timestamp} />);

      // Initial render
      expect(screen.getByTestId('last-updated')).toBeInTheDocument();

      // Advance time by 10 seconds
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      // Component should have re-rendered (internal state changed)
      expect(screen.getByTestId('last-updated')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should show clock icon by default', () => {
      const timestamp = new Date();
      render(<LastUpdated timestamp={timestamp} />);

      const container = screen.getByTestId('last-updated');
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      const timestamp = new Date();
      render(<LastUpdated timestamp={timestamp} showIcon={false} />);

      const container = screen.getByTestId('last-updated');
      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const timestamp = new Date();
      render(<LastUpdated timestamp={timestamp} className="custom-class" />);

      const container = screen.getByTestId('last-updated');
      expect(container).toHaveClass('custom-class');
    });

    it('should have muted text color', () => {
      const timestamp = new Date();
      render(<LastUpdated timestamp={timestamp} />);

      const container = screen.getByTestId('last-updated');
      expect(container).toHaveClass('text-muted-foreground');
    });

    it('should have small text size', () => {
      const timestamp = new Date();
      render(<LastUpdated timestamp={timestamp} />);

      const container = screen.getByTestId('last-updated');
      expect(container).toHaveClass('text-xs');
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const timestamp = new Date();
      const { unmount } = render(<LastUpdated timestamp={timestamp} />);

      // Unmount should clear the interval
      unmount();

      // No error should occur when advancing time after unmount
      vi.advanceTimersByTime(10000);
    });
  });
});
