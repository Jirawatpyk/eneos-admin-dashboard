import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock session data
const { mockUseSession, mockSignOut } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockSignOut: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: mockUseSession,
  signOut: mockSignOut,
}));

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  private listeners: Map<string, Set<EventListener>> = new Map();
  static channels: Map<string, Set<MockBroadcastChannel>> = new Map();

  constructor(name: string) {
    this.name = name;
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, new Set());
    }
    MockBroadcastChannel.channels.get(name)!.add(this);
  }

  postMessage(message: unknown) {
    // Broadcast to all other channels with same name
    const channels = MockBroadcastChannel.channels.get(this.name);
    channels?.forEach((channel) => {
      if (channel !== this) {
        const event = new MessageEvent('message', { data: message });
        channel.listeners.get('message')?.forEach((listener) => {
          (listener as (event: MessageEvent) => void)(event);
        });
      }
    });
  }

  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {
    MockBroadcastChannel.channels.get(this.name)?.delete(this);
    this.listeners.clear();
  }

  static reset() {
    MockBroadcastChannel.channels.clear();
  }
}

// Set up BroadcastChannel mock
(global as unknown as { BroadcastChannel: typeof MockBroadcastChannel }).BroadcastChannel = MockBroadcastChannel;

// Import after mocks
import { useSessionSync } from '@/hooks/use-session-sync';

describe('useSessionSync - AC6: Multiple Tabs Sync', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    MockBroadcastChannel.reset();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '', reload: vi.fn() },
      writable: true,
    });

    mockUseSession.mockReturnValue({
      data: {
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        user: { id: '123', email: 'test@eneos.co.th' },
      },
      status: 'authenticated',
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should create BroadcastChannel on mount', () => {
    const { unmount } = renderHook(() => useSessionSync());

    // Channel should be created
    expect(MockBroadcastChannel.channels.size).toBe(1);

    unmount();
  });

  it('should close BroadcastChannel on unmount', () => {
    const { unmount } = renderHook(() => useSessionSync());

    expect(MockBroadcastChannel.channels.get('eneos-session-sync')?.size).toBe(1);

    unmount();

    expect(MockBroadcastChannel.channels.get('eneos-session-sync')?.size).toBe(0);
  });

  it('should redirect to login when receiving LOGOUT message', async () => {
    // Create two hooks to simulate two tabs
    const { unmount: unmount1 } = renderHook(() => useSessionSync());
    const { result: result2, unmount: unmount2 } = renderHook(() => useSessionSync());

    // Broadcast logout from tab 2
    act(() => {
      result2.current.broadcastLogout();
    });

    // Tab 1 should redirect to login
    expect(window.location.href).toBe('/login?error=SessionExpired');

    unmount1();
    unmount2();
  });

  it('should redirect to login when receiving SESSION_EXPIRED message', () => {
    // Create two hooks to simulate two tabs
    const { unmount: unmount1 } = renderHook(() => useSessionSync());
    const { result: result2, unmount: unmount2 } = renderHook(() => useSessionSync());

    // Broadcast session expired from tab 2
    act(() => {
      result2.current.broadcastSessionExpired();
    });

    // Tab 1 should redirect to login
    expect(window.location.href).toBe('/login?error=SessionExpired');

    unmount1();
    unmount2();
  });

  it('should call signOut when broadcastLogout is called', async () => {
    mockSignOut.mockResolvedValue(undefined);

    const { result, unmount } = renderHook(() => useSessionSync());

    await act(async () => {
      await result.current.broadcastLogout();
    });

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });

    unmount();
  });

  it('should provide broadcastSessionExpired function', () => {
    const { result, unmount } = renderHook(() => useSessionSync());

    expect(typeof result.current.broadcastSessionExpired).toBe('function');
    expect(typeof result.current.broadcastLogout).toBe('function');

    unmount();
  });
});
