/**
 * NotificationSettingsSkeleton Component Tests
 * Story 7.3: Notification Settings
 *
 * Tests for notification settings loading skeleton.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NotificationSettingsSkeleton } from '@/components/settings/notification-settings-skeleton';

describe('NotificationSettingsSkeleton', () => {
  it('renders skeleton card', () => {
    render(<NotificationSettingsSkeleton />);

    expect(screen.getByTestId('notification-settings-skeleton')).toBeInTheDocument();
  });

  it('renders skeleton elements for loading state', () => {
    const { container } = render(<NotificationSettingsSkeleton />);

    // Should have multiple skeleton elements (using Tailwind class pattern)
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders 3 toggle skeleton rows', () => {
    const { container } = render(<NotificationSettingsSkeleton />);

    // 3 toggle skeletons + header skeletons + permission section
    // Each toggle row has a label skeleton and switch skeleton
    const roundedFullSkeletons = container.querySelectorAll('.rounded-full');
    expect(roundedFullSkeletons.length).toBeGreaterThanOrEqual(3);
  });
});
