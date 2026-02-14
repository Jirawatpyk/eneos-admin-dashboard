/**
 * Team Management Hook Tests
 * Story 7-4 + 7-4b: Team Management
 * Tests for all API functions and hooks in use-team-management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useTeamList,
  useTeamMember,
  useUpdateTeamMember,
  useCreateTeamMember,
  useUnlinkedLINEAccounts,
  useLinkLINEAccount,
  useUnlinkedDashboardMembers,
  useReverseLinkAccount,
} from '../hooks/use-team-management';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useTeamList', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should fetch team list with filters', async () => {
    const mockResponse = {
      success: true,
      data: [
        { lineUserId: 'U001', name: 'Rep 1', status: 'active' },
        { lineUserId: 'U002', name: 'Rep 2', status: 'active' },
      ],
      total: 2,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(
      () => useTeamList({ status: 'active', role: 'all' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.members).toHaveLength(2);
    expect(result.current.data?.total).toBe(2);
  });

  it('[P1] should include filter params in URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [], total: 0 }),
    });

    renderHook(
      () => useTeamList({ status: 'inactive', role: 'admin' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('status=inactive');
    expect(calledUrl).toContain('role=admin');
  });

  it('[P1] should handle error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Server error' } }),
    });

    const { result } = renderHook(
      () => useTeamList({ status: 'active', role: 'all' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('Server error');
  });
});

describe('useTeamMember', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should fetch single team member', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { lineUserId: 'U001', name: 'Rep 1', role: 'viewer' },
      }),
    });

    const { result } = renderHook(
      () => useTeamMember('U001'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('Rep 1');
  });

  it('[P1] should not fetch when lineUserId is null', () => {
    const { result } = renderHook(
      () => useTeamMember(null),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useUpdateTeamMember', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should call PATCH endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { email: 'updated@co.th' } }),
    });

    const { result } = renderHook(
      () => useUpdateTeamMember(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({ lineUserId: 'U001', updates: { email: 'updated@co.th' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/sales-team/U001',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ email: 'updated@co.th' }),
      })
    );
  });
});

describe('useCreateTeamMember', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should call POST endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { name: 'New Rep' } }),
    });

    const { result } = renderHook(
      () => useCreateTeamMember(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({ name: 'New Rep', email: 'new@co.th' } as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/sales-team',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('[P1] should handle creation error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already exists' }),
    });

    const { result } = renderHook(
      () => useCreateTeamMember(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({ name: 'New Rep', email: 'dup@co.th' } as never);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('Email already exists');
  });
});

describe('useUnlinkedLINEAccounts', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should fetch unlinked accounts', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { lineUserId: 'U-new1', displayName: 'LINE User 1' },
          { lineUserId: 'U-new2', displayName: 'LINE User 2' },
        ],
      }),
    });

    const { result } = renderHook(
      () => useUnlinkedLINEAccounts(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it('[P1] should respect enabled option', () => {
    const { result } = renderHook(
      () => useUnlinkedLINEAccounts({ enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useLinkLINEAccount', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should call link endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { linked: true } }),
    });

    const { result } = renderHook(
      () => useLinkLINEAccount(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({ email: 'rep@co.th', targetLineUserId: 'U-new1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/sales-team/email/rep%40co.th/link'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});

describe('useUnlinkedDashboardMembers', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should fetch unlinked dashboard members', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ email: 'unlinked@co.th', name: 'Unlinked User' }],
      }),
    });

    const { result } = renderHook(
      () => useUnlinkedDashboardMembers(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('[P1] should respect enabled option', () => {
    const { result } = renderHook(
      () => useUnlinkedDashboardMembers({ enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useReverseLinkAccount', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.resetAllMocks(); });

  it('[P1] should call link endpoint with reversed params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(
      () => useReverseLinkAccount(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({ lineUserId: 'U-line', targetEmail: 'target@co.th' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should use the same endpoint but with reversed parameters
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/sales-team/email/target%40co.th/link'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ targetLineUserId: 'U-line' }),
      })
    );
  });
});
