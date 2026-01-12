import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Use vi.hoisted() for mock functions
const { mockSignIn, mockSearchParams, mockReplace } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSearchParams: new URLSearchParams(),
  mockReplace: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  signOut: vi.fn(),
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/login',
  redirect: vi.fn(),
}));

// Import after mocks
import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear search params
    mockSearchParams.delete('error');
    mockSearchParams.delete('signedOut');
  });

  // AC1: Login Page Display
  describe('AC1: Login Page Display', () => {
    it('should render login card with ENEOS branding', () => {
      render(<LoginPage />);

      expect(screen.getByText('ENEOS')).toBeInTheDocument();
      expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
    });

    it('should display Sign in with Google button', () => {
      render(<LoginPage />);

      expect(
        screen.getByRole('button', { name: /sign in with google/i })
      ).toBeInTheDocument();
    });

    it('should show domain restriction message', () => {
      render(<LoginPage />);

      expect(
        screen.getByText(/only authorized company accounts are allowed/i)
      ).toBeInTheDocument();
    });
  });

  // AC2: Google OAuth Flow
  describe('AC2: Google OAuth Flow', () => {
    it('should trigger Google signIn when button is clicked', async () => {
      render(<LoginPage />);

      const button = screen.getByRole('button', { name: /sign in with google/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/dashboard',
        });
      });
    });

    it('should use /dashboard as callback URL (AC4 requirement)', async () => {
      render(<LoginPage />);

      const button = screen.getByRole('button', { name: /sign in with google/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Verify the exact callback URL is /dashboard, not / or other path
        const callArgs = mockSignIn.mock.calls[0];
        expect(callArgs[0]).toBe('google');
        expect(callArgs[1]).toEqual({ callbackUrl: '/dashboard' });
      });
    });
  });

  // AC3: Domain Restriction Error Message
  describe('AC3: Domain Restriction', () => {
    it('should display error message for AccessDenied', () => {
      mockSearchParams.set('error', 'AccessDenied');

      render(<LoginPage />);

      expect(
        screen.getByText(
          'Access denied. Only authorized company accounts are allowed.'
        )
      ).toBeInTheDocument();
    });

    it('should display error message for OAuthCallback error', () => {
      mockSearchParams.set('error', 'OAuthCallback');

      render(<LoginPage />);

      expect(
        screen.getByText('Authentication failed. Please try again.')
      ).toBeInTheDocument();
    });

    it('should display generic error message for unknown errors', () => {
      mockSearchParams.set('error', 'UnknownError');

      render(<LoginPage />);

      expect(
        screen.getByText('An error occurred during sign in.')
      ).toBeInTheDocument();
    });

    it('should display session expired message for SessionExpired error (AC4)', () => {
      mockSearchParams.set('error', 'SessionExpired');

      render(<LoginPage />);

      expect(
        screen.getByText('Your session has expired. Please log in again.')
      ).toBeInTheDocument();
    });
  });

  // AC7: Loading State
  describe('AC7: Loading State', () => {
    it('should show loading indicator when signing in', async () => {
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<LoginPage />);

      const button = screen.getByRole('button', { name: /sign in with google/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
    });

    it('should disable button during sign in', async () => {
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<LoginPage />);

      const button = screen.getByRole('button', { name: /sign in with google/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  // Footer
  describe('Footer', () => {
    it('should display copyright with current year', () => {
      render(<LoginPage />);

      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(new RegExp(`${currentYear} ENEOS Thailand`))
      ).toBeInTheDocument();
    });
  });

  // Story 1.4: AC6 - Signed Out Success Message
  describe('AC6: Signed Out Success Message (Story 1.4)', () => {
    it('should display success message when signedOut=true', async () => {
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      // Message appears immediately on render
      const successMessage = screen.getByTestId('signedout-message');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveTextContent('You have been signed out successfully.');
    });

    it('should have role="status" for accessibility', async () => {
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      const successMessage = screen.getByTestId('signedout-message');
      expect(successMessage).toHaveAttribute('role', 'status');
    });

    it('should show green styling for success message', async () => {
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      const successMessage = screen.getByTestId('signedout-message');
      expect(successMessage).toHaveClass('bg-green-50', 'border-green-200', 'text-green-700');
    });

    it('should NOT show success message when signedOut is not true', () => {
      render(<LoginPage />);

      expect(screen.queryByTestId('signedout-message')).not.toBeInTheDocument();
    });

    it('should NOT show success message when there is an error', () => {
      mockSearchParams.set('signedOut', 'true');
      mockSearchParams.set('error', 'AccessDenied');

      render(<LoginPage />);

      // Error takes precedence over success
      expect(screen.queryByTestId('signedout-message')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('should clean URL by calling router.replace', async () => {
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login', { scroll: false });
      });
    });

    it('should auto-dismiss success message after 5 seconds', async () => {
      // Spy on setTimeout to verify it's called with 5000ms
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      // Message should be visible initially
      expect(screen.getByTestId('signedout-message')).toBeInTheDocument();

      // Verify setTimeout was called with 5000ms for auto-dismiss
      await waitFor(() => {
        const autodismissCall = setTimeoutSpy.mock.calls.find(
          (call) => call[1] === 5000
        );
        expect(autodismissCall).toBeDefined();
      });

      setTimeoutSpy.mockRestore();
    });

    it('should NOT auto-dismiss before 5 seconds', async () => {
      vi.useFakeTimers();
      mockSearchParams.set('signedOut', 'true');

      await act(async () => {
        render(<LoginPage />);
      });

      // Message should be visible initially
      expect(screen.getByTestId('signedout-message')).toBeInTheDocument();

      // Fast-forward 4 seconds (not yet 5)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);
      });

      // Message should still be visible
      expect(screen.getByTestId('signedout-message')).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
