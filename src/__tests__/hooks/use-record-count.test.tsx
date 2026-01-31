/**
 * useRecordCount Hook Tests
 * Story 6.4: Custom Date Range - AC#5, AC#9
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useLeads
const { mockUseLeads } = vi.hoisted(() => ({
  mockUseLeads: vi.fn().mockReturnValue({
    data: undefined,
    pagination: { total: 42, page: 1, limit: 1, totalPages: 42 },
    availableFilters: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-leads', () => ({
  useLeads: mockUseLeads,
}));

import { useRecordCount } from '@/hooks/use-record-count';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRecordCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns count from pagination.total', () => {
    const { result } = renderHook(() => useRecordCount({}), {
      wrapper: createWrapper(),
    });
    expect(result.current.count).toBe(42);
  });

  it('returns isLoading state', () => {
    mockUseLeads.mockReturnValue({
      data: undefined,
      pagination: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useRecordCount({}), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.count).toBeUndefined();
  });

  it('returns undefined count when pagination is undefined', () => {
    mockUseLeads.mockReturnValue({
      data: undefined,
      pagination: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useRecordCount({}), {
      wrapper: createWrapper(),
    });
    expect(result.current.count).toBeUndefined();
  });

  it('passes date range as YYYY-MM-DD strings to useLeads', () => {
    const dateRange = {
      from: new Date(2026, 0, 1),
      to: new Date(2026, 0, 31),
    };

    renderHook(() => useRecordCount({ dateRange }), {
      wrapper: createWrapper(),
    });

    expect(mockUseLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '2026-01-01',
        to: '2026-01-31',
        limit: 1,
        page: 1,
      })
    );
  });

  it('passes undefined from/to when no dateRange', () => {
    renderHook(() => useRecordCount({}), {
      wrapper: createWrapper(),
    });

    expect(mockUseLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        from: undefined,
        to: undefined,
      })
    );
  });

  it('converts status "all" to undefined (LeadStatus[] does not include "all")', () => {
    renderHook(() => useRecordCount({ status: 'all' }), {
      wrapper: createWrapper(),
    });

    expect(mockUseLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        status: undefined,
      })
    );
  });

  it('converts specific status to array', () => {
    renderHook(() => useRecordCount({ status: 'contacted' }), {
      wrapper: createWrapper(),
    });

    expect(mockUseLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['contacted'],
      })
    );
  });

  it('converts owner "all" to undefined', () => {
    renderHook(() => useRecordCount({ owner: 'all' }), {
      wrapper: createWrapper(),
    });

    expect(mockUseLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: undefined,
      })
    );
  });

  it('converts specific owner to array', () => {
    renderHook(() => useRecordCount({ owner: 'U1234' }), {
      wrapper: createWrapper(),
    });

    expect(mockUseLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: ['U1234'],
      })
    );
  });

  it('uses limit=1 and page=1 for minimal data transfer', () => {
    renderHook(() => useRecordCount({}), {
      wrapper: createWrapper(),
    });

    expect(mockUseLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 1,
        page: 1,
      })
    );
  });
});
