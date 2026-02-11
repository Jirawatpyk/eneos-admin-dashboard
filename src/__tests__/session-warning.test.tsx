/**
 * SessionWarning Tests
 * Story 11-4: Simplified - Supabase handles auto-refresh (AC-6)
 *
 * The component now simply checks useAuth state and returns null.
 * Supabase handles token refresh automatically via onAuthStateChange.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Import after mocks
import { SessionWarning } from '@/components/shared/session-warning';

describe('SessionWarning - Story 11-4: Simplified Supabase Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render null when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true, isLoading: false, user: null, role: 'admin',
    });

    const { container } = render(<SessionWarning />);
    expect(container.innerHTML).toBe('');
  });

  it('should render null when unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false, isLoading: false, user: null, role: 'viewer',
    });

    const { container } = render(<SessionWarning />);
    expect(container.innerHTML).toBe('');
  });

  it('should render null when loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false, isLoading: true, user: null, role: 'viewer',
    });

    const { container } = render(<SessionWarning />);
    expect(container.innerHTML).toBe('');
  });
});
