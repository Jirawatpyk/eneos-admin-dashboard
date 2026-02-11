/**
 * Reset Password Page Tests
 * Story 11-1: Frontend Login & Auth Pages (AC#4)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockResetPasswordForEmail } = vi.hoisted(() => ({
  mockResetPasswordForEmail: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/reset-password',
  redirect: vi.fn(),
}));

import ResetPasswordPage from '@/app/(auth)/reset-password/page';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the reset password form', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
  });

  it('should render Back to Login link', () => {
    render(<ResetPasswordPage />);

    const link = screen.getByTestId('back-to-login-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });

  it('should call resetPasswordForEmail on submit', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByTestId('email-input'), 'user@company.com');
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'user@company.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/update-password'),
        })
      );
    });
  });

  it('should show success message after submit (always, even non-existent email)', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByTestId('email-input'), 'nonexistent@company.com');
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toHaveTextContent(
        'Check your email for a reset link'
      );
    });
  });

  it('should show Back to Login button after success', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByTestId('email-input'), 'user@company.com');
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      const backLink = screen.getByTestId('back-to-login-link');
      expect(backLink).toHaveAttribute('href', '/login');
    });
  });

  it('should render ENEOS branding', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByAltText('ENEOS Logo')).toBeInTheDocument();
  });
});
