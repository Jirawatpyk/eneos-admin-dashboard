/**
 * Update Password Page Tests
 * Story 11-1: Frontend Login & Auth Pages (AC#4)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const { mockUpdateUser, mockSignOut, mockOnAuthStateChange, mockPush } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
  mockSignOut: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/update-password',
  redirect: vi.fn(),
}));

import UpdatePasswordPage from '@/app/(auth)/update-password/page';

// Helper: render page with PASSWORD_RECOVERY already fired
async function renderWithRecovery() {
  // Fire PASSWORD_RECOVERY synchronously during render
  mockOnAuthStateChange.mockImplementation((callback: (event: string) => void) => {
    // Use queueMicrotask for immediate async execution
    queueMicrotask(() => callback('PASSWORD_RECOVERY'));
    return {
      data: { subscription: { unsubscribe: vi.fn() } },
    };
  });

  render(<UpdatePasswordPage />);

  await waitFor(() => {
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });
}

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show verifying spinner before PASSWORD_RECOVERY event', () => {
    mockOnAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    render(<UpdatePasswordPage />);

    expect(screen.getByTestId('verifying-spinner')).toBeInTheDocument();
    expect(screen.getByText('Verifying reset link...')).toBeInTheDocument();
  });

  it('should show form after PASSWORD_RECOVERY event', async () => {
    await renderWithRecovery();

    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Update Password' })).toBeInTheDocument();
  });

  it('should show error when passwords do not match', async () => {
    await renderWithRecovery();

    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'different456' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Passwords do not match');
    });
  });

  it('should show error when password is too short', async () => {
    await renderWithRecovery();

    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'short' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'short' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Password must be at least 8 characters');
    });
  });

  it('should call updateUser and redirect on success', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({});

    await renderWithRecovery();

    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login?message=password_updated');
    });
  });

  it('should show error when updateUser fails', async () => {
    mockUpdateUser.mockResolvedValue({ error: { message: 'Token expired' } });

    await renderWithRecovery();

    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Token expired');
    });
  });

  it('should show token error after timeout if PASSWORD_RECOVERY does not fire', async () => {
    vi.useFakeTimers();

    mockOnAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    await act(async () => {
      render(<UpdatePasswordPage />);
    });

    // Advance past the 5-second timeout
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });

    expect(screen.getByTestId('token-error-message')).toBeInTheDocument();
    expect(screen.getByText('This password reset link is invalid or has expired.')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should show "Request new reset link" on token error', async () => {
    vi.useFakeTimers();

    mockOnAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    await act(async () => {
      render(<UpdatePasswordPage />);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });

    const link = screen.getByTestId('request-new-link');
    expect(link).toHaveAttribute('href', '/reset-password');

    vi.useRealTimers();
  });
});
