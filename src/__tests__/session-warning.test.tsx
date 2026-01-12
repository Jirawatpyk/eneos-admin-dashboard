import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';

// Mock session data
const { mockUseSession, mockToast, mockReload } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockToast: vi.fn(),
  mockReload: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: mockUseSession,
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
