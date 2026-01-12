/**
 * Permission Error Handler Tests
 * Story 1.5: Role-based Access Control
 * AC: #6 - Unauthorized Access Handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock hooks
const mockToast = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('PermissionErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('error');
  });

  it('should show toast when error=Unauthorized is in URL', async () => {
    mockSearchParams.set('error', 'Unauthorized');

    const { PermissionErrorHandler } = await import(
      '../components/shared/permission-error-handler'
    );

    render(<PermissionErrorHandler />);

    // AC#6: Toast message exactly as specified
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Access Denied',
      description: "You don't have permission to access this page.",
      variant: 'destructive',
    });
  });

  it('should clean up URL after showing toast', async () => {
    mockSearchParams.set('error', 'Unauthorized');

    const { PermissionErrorHandler } = await import(
      '../components/shared/permission-error-handler'
    );

    render(<PermissionErrorHandler />);

    expect(mockReplace).toHaveBeenCalled();
  });

  it('should not show toast for other errors', async () => {
    mockSearchParams.set('error', 'OtherError');

    const { PermissionErrorHandler } = await import(
      '../components/shared/permission-error-handler'
    );

    render(<PermissionErrorHandler />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not show toast when no error param', async () => {
    // No error param set

    const { PermissionErrorHandler } = await import(
      '../components/shared/permission-error-handler'
    );

    render(<PermissionErrorHandler />);

    expect(mockToast).not.toHaveBeenCalled();
  });
});
