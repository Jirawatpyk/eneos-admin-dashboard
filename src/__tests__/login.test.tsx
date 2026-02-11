/**
 * Login Page Tests
 * Story 11-1: Frontend Login & Auth Pages (AC#2, AC#3)
 *
 * Tests Email+Password login, Google OAuth, error handling, and signed-out message.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Use vi.hoisted() for mock functions
const { mockSignInWithPassword, mockSignInWithOAuth, mockSearchParams, mockReplace, mockPush, mockRefresh } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
  mockSearchParams: new URLSearchParams(),
  mockReplace: vi.fn(),
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
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
    mockSearchParams.delete('error');
    mockSearchParams.delete('signedOut');
    mockSearchParams.delete('message');
  });

  // AC#2: Email+Password Login
  describe('AC#2: Login Page Display', () => {
    it('should render login card with ENEOS branding', () => {
      render(<LoginPage />);

      expect(screen.getByAltText('ENEOS Logo')).toBeInTheDocument();
      expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
    });

    it('should render email input, password input, and Sign In button', () => {
      render(<LoginPage />);

      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('signin-button')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should render Google OAuth button below the form', () => {
      render(<LoginPage />);

      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    it('should render Forgot password link', () => {
      render(<LoginPage />);

      const link = screen.getByTestId('forgot-password-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('Forgot password?');
      expect(link).toHaveAttribute('href', '/reset-password');
    });

    it('should render "or" divider between form and Google button', () => {
      render(<LoginPage />);

      expect(screen.getByText('or')).toBeInTheDocument();
    });
  });

  // AC#2: Email+Password Flow
  describe('AC#2: Email+Password Sign In', () => {
    it('should call signInWithPassword with email and password', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      render(<LoginPage />);

      await userEvent.type(screen.getByTestId('email-input'), 'user@company.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      fireEvent.click(screen.getByTestId('signin-button'));

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'user@company.com',
          password: 'password123',
        });
      });
    });

    it('should redirect to dashboard on success', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      render(<LoginPage />);

      await userEvent.type(screen.getByTestId('email-input'), 'user@company.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      fireEvent.click(screen.getByTestId('signin-button'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should show "Invalid email or password" on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      });

      render(<LoginPage />);

      await userEvent.type(screen.getByTestId('email-input'), 'user@company.com');
      await userEvent.type(screen.getByTestId('password-input'), 'wrong');
      fireEvent.click(screen.getByTestId('signin-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email or password');
      });
    });

    it('should show "Account not found" for non-invited user', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Email not confirmed' },
      });

      render(<LoginPage />);

      await userEvent.type(screen.getByTestId('email-input'), 'nobody@company.com');
      await userEvent.type(screen.getByTestId('password-input'), 'any');
      fireEvent.click(screen.getByTestId('signin-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Account not found. Contact your admin.');
      });
    });

    it('should show loading state during sign in', async () => {
      mockSignInWithPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 1000))
      );

      render(<LoginPage />);

      await userEvent.type(screen.getByTestId('email-input'), 'user@company.com');
      await userEvent.type(screen.getByTestId('password-input'), 'password123');
      fireEvent.click(screen.getByTestId('signin-button'));

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
        expect(screen.getByTestId('signin-button')).toBeDisabled();
      });
    });
  });

  // AC#3: Google OAuth
  describe('AC#3: Google OAuth Flow', () => {
    it('should call signInWithOAuth when Google button is clicked', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      render(<LoginPage />);

      fireEvent.click(screen.getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        });
      });
    });

    it('should show error when OAuth fails', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth error' },
      });

      render(<LoginPage />);

      fireEvent.click(screen.getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Login failed. Please try again or contact your admin.'
        );
      });
    });
  });

  // AC#3: Error query params
  describe('Error Query Params', () => {
    it('should show error message for auth_error query param', () => {
      mockSearchParams.set('error', 'auth_error');

      render(<LoginPage />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Login failed. Please try again or contact your admin.'
      );
    });

    it('should show password updated message', () => {
      mockSearchParams.set('message', 'password_updated');

      render(<LoginPage />);

      expect(screen.getByTestId('password-updated-message')).toHaveTextContent(
        'Password updated. Please log in.'
      );
    });
  });

  // Signed out message (preserved from previous version)
  describe('Signed Out Message', () => {
    it('should display success message when signedOut=true', () => {
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      const successMessage = screen.getByTestId('signedout-message');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveTextContent('You have been signed out successfully.');
    });

    it('should NOT show success message when signedOut is not set', () => {
      render(<LoginPage />);

      expect(screen.queryByTestId('signedout-message')).not.toBeInTheDocument();
    });

    it('should clean URL by calling router.replace', async () => {
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login', { scroll: false });
      });
    });

    it('should auto-dismiss after 5 seconds', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      mockSearchParams.set('signedOut', 'true');

      render(<LoginPage />);

      expect(screen.getByTestId('signedout-message')).toBeInTheDocument();

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

      expect(screen.getByTestId('signedout-message')).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);
      });

      expect(screen.getByTestId('signedout-message')).toBeInTheDocument();

      vi.useRealTimers();
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
});
