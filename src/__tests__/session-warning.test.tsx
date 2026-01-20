import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';

// Mock session data
const { mockUseSession, mockSignOut, mockToast, mockReload } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockSignOut: vi.fn(),
  mockToast: vi.fn(),
  mockReload: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: mockUseSession,
  signOut: mockSignOut,
}));

// Mock use-toast - capture the action for testing
vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast,
}));

// Mock Button - render as actual button so we can test clicks
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} data-testid="extend-session-btn">{children}</button>
  ),
}));

// Import after mocks
import { SessionWarning } from '@/components/shared/session-warning';

describe('SessionWarning - AC3: Session Expiry Warning', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: mockReload },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should not show warning when session has more than 5 minutes remaining', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 10 * 60, // 10 minutes from now
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should show warning when session has less than 5 minutes remaining', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 4 * 60, // 4 minutes from now
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Session Expiring Soon',
        description: expect.stringContaining('4 minute'),
      })
    );
  });

  it('should show warning with singular "minute" when 1 minute remaining', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 45, // 45 seconds from now (rounds to 1 minute)
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('1 minute.'),
      })
    );
  });

  it('should not show warning when no session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not show warning when session has no expiresAt', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '123', email: 'test@eneos.co.th' },
        // expiresAt is undefined
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not show warning multiple times', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 4 * 60, // 4 minutes from now
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    // Warning should be shown once
    expect(mockToast).toHaveBeenCalledTimes(1);

    // Advance time by 30 seconds (check interval)
    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });

    // Should still only be called once
    expect(mockToast).toHaveBeenCalledTimes(1);
  });

  it('should include Extend Session button in toast', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 3 * 60, // 3 minutes from now
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.anything(),
      })
    );
  });

  it('should call window.location.reload when Extend Session button is clicked', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 3 * 60, // 3 minutes from now
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    // Get the action (Button) from the toast call
    const toastCall = mockToast.mock.calls[0][0];
    expect(toastCall.action).toBeDefined();

    // Render the action button and click it
    const { getByTestId } = render(toastCall.action);
    const button = getByTestId('extend-session-btn');
    fireEvent.click(button);

    // Verify reload was called
    expect(mockReload).toHaveBeenCalled();
  });

  it('should set toast duration to Infinity (no auto-dismiss)', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 2 * 60, // 2 minutes from now
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: Infinity,
      })
    );
  });

  it('should render null (no visible UI)', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 10 * 60,
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });

    const { container } = render(<SessionWarning />);

    expect(container.innerHTML).toBe('');
  });
});

describe('SessionWarning - Session Error Handling (Auth Token Fix)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show error toast when session has error', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 60 * 60, // 1 hour
        user: { id: '123', email: 'test@eneos.co.th' },
        error: 'RefreshTokenError',
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Session Error',
        description: 'Your session has expired. Please login again.',
        variant: 'destructive',
      })
    );
  });

  it('should call signOut after 2 seconds when session has error', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 60 * 60,
        user: { id: '123', email: 'test@eneos.co.th' },
        error: 'RefreshTokenError',
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    // signOut should not be called immediately
    expect(mockSignOut).not.toHaveBeenCalled();

    // Advance time by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Now signOut should be called
    expect(mockSignOut).toHaveBeenCalledWith({
      callbackUrl: '/login?error=SessionExpired',
    });
  });

  it('should not handle error multiple times', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 60 * 60,
        user: { id: '123', email: 'test@eneos.co.th' },
        error: 'RefreshTokenError',
      },
      status: 'authenticated',
    });

    const { rerender } = render(<SessionWarning />);

    // Toast should be called once
    expect(mockToast).toHaveBeenCalledTimes(1);

    // Rerender with same error
    rerender(<SessionWarning />);

    // Toast should still only be called once
    expect(mockToast).toHaveBeenCalledTimes(1);
  });

  it('should not show error toast when no session error', () => {
    const now = Math.floor(Date.now() / 1000);
    mockUseSession.mockReturnValue({
      data: {
        expiresAt: now + 60 * 60, // 1 hour - not expiring soon
        user: { id: '123', email: 'test@eneos.co.th' },
        // No error field
      },
      status: 'authenticated',
    });

    render(<SessionWarning />);

    // No toast should be called (no error, not expiring)
    expect(mockToast).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
