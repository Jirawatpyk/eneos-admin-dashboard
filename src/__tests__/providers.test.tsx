import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Use vi.hoisted() for mock functions
const { mockSessionProvider } = vi.hoisted(() => ({
  mockSessionProvider: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  )),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: mockSessionProvider,
}));

// Import after mocks
import { Providers } from '@/app/providers';

describe('Providers - Task 2: Session Provider Enhancement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC5 & AC6: Session Provider Configuration
  describe('SessionProvider Configuration', () => {
    it('should render SessionProvider with children', () => {
      const { getByText } = render(
        <Providers>
          <div>Test Child</div>
        </Providers>
      );

      expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('should configure refetchInterval for automatic session refresh', () => {
      render(
        <Providers>
          <div>Test</div>
        </Providers>
      );

      // SessionProvider should be called with refetchInterval
      expect(mockSessionProvider).toHaveBeenCalled();
      const props = mockSessionProvider.mock.calls[0][0];
      expect(props.refetchInterval).toBeDefined();
      expect(props.refetchInterval).toBe(5 * 60); // 5 minutes in seconds
    });

    it('should configure refetchOnWindowFocus for tab sync', () => {
      render(
        <Providers>
          <div>Test</div>
        </Providers>
      );

      const props = mockSessionProvider.mock.calls[0][0];
      expect(props.refetchOnWindowFocus).toBe(true);
    });

    it('should configure refetchWhenOffline to false', () => {
      render(
        <Providers>
          <div>Test</div>
        </Providers>
      );

      const props = mockSessionProvider.mock.calls[0][0];
      expect(props.refetchWhenOffline).toBe(false);
    });
  });
});
