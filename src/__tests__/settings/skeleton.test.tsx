/**
 * Settings Skeleton Component Tests
 * Story 7.1: User Profile
 *
 * Tests for AC#7 (Loading State)
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ProfileCardSkeleton } from '@/components/settings/profile-card-skeleton';
import { SessionCardSkeleton } from '@/components/settings/session-card-skeleton';

describe('ProfileCardSkeleton', () => {
  describe('AC#7: Loading State', () => {
    it('renders skeleton card', () => {
      render(<ProfileCardSkeleton />);
      expect(screen.getByTestId('profile-card-skeleton')).toBeInTheDocument();
    });

    it('renders avatar skeleton (64x64)', () => {
      render(<ProfileCardSkeleton />);
      const avatarSkeleton = screen.getByTestId('skeleton-avatar');
      expect(avatarSkeleton).toHaveClass('h-16', 'w-16', 'rounded-full');
    });

    it('renders name skeleton', () => {
      render(<ProfileCardSkeleton />);
      expect(screen.getByTestId('skeleton-name')).toBeInTheDocument();
    });

    it('renders email skeleton', () => {
      render(<ProfileCardSkeleton />);
      expect(screen.getByTestId('skeleton-email')).toBeInTheDocument();
    });

    it('renders role badge skeleton', () => {
      render(<ProfileCardSkeleton />);
      expect(screen.getByTestId('skeleton-badge')).toBeInTheDocument();
    });
  });
});

describe('SessionCardSkeleton', () => {
  describe('AC#7: Loading State', () => {
    it('renders skeleton card', () => {
      render(<SessionCardSkeleton />);
      expect(screen.getByTestId('session-card-skeleton')).toBeInTheDocument();
    });

    it('renders multiple skeleton rows', () => {
      render(<SessionCardSkeleton />);
      const rows = screen.getAllByTestId(/skeleton-row-/);
      expect(rows.length).toBeGreaterThanOrEqual(3);
    });

    it('renders button skeleton', () => {
      render(<SessionCardSkeleton />);
      expect(screen.getByTestId('skeleton-button')).toBeInTheDocument();
    });
  });
});
