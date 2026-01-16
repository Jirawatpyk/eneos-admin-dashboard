/**
 * Permission Error Handler Tests
 * Story 1.5: Role-based Access Control
 * AC: #6 - Unauthorized Access Handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock hooks - use vi.hoisted for proper mock hoisting
const { mockToast, mockReplace, mockGet } = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockReplace: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
    toString: () => '',
  }),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Import component after mocks are set up
import { PermissionErrorHandler } from '../components/shared/permission-error-handler';

describe('PermissionErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it('should show toast when error=Unauthorized is in URL', () => {
    mockGet.mockReturnValue('Unauthorized');

    render(<PermissionErrorHandler />);

    // AC#6: Toast message exactly as specified
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Access Denied',
      description: "You don't have permission to access this page.",
      variant: 'destructive',
    });
  });

  it('should clean up URL after showing toast', () => {
    mockGet.mockReturnValue('Unauthorized');

    render(<PermissionErrorHandler />);

    expect(mockReplace).toHaveBeenCalled();
  });

  it('should not show toast for other errors', () => {
    mockGet.mockReturnValue('OtherError');

    render(<PermissionErrorHandler />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not show toast when no error param', () => {
    mockGet.mockReturnValue(null);

    render(<PermissionErrorHandler />);

    expect(mockToast).not.toHaveBeenCalled();
  });
});
