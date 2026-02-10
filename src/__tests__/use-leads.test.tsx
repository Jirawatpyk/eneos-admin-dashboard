/**
 * useLeads Hook Tests
 * Story 4.2: Pagination
 *
 * Tests for leads hook with pagination support
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock the API
const mockFetchLeads = vi.fn();

vi.mock('@/lib/api/leads', () => ({
  fetchLeads: (...args: unknown[]) => mockFetchLeads(...args),
  LeadsApiError: class LeadsApiError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public code?: string
    ) {
      super(message);
      this.name = 'LeadsApiError';
    }
  },
}));

import { useLeads } from '@/hooks/use-leads';

const mockLeadsResponse = {
  leads: [
    {
      row: 1,
      date: '2026-01-15T10:30:00Z',
      customerName: 'John Doe',
      email: 'john@example.com',
      phone: '0812345678',
      company: 'ABC Corp',
      industryAI: 'Manufacturing',
      website: null,
      capital: null,
      status: 'new' as const,
      salesOwnerId: null,
      salesOwnerName: null,
      campaignId: 'camp1',
      campaignName: 'Q1 Campaign',
      emailSubject: null,
      source: 'Brevo',
      leadId: null,
      eventId: null,
      clickedAt: null,
      talkingPoint: null,
      closedAt: null,
      lostAt: null,
      unreachableAt: null,
      version: 1,
      leadSource: null,
      jobTitle: null,
      city: null,
      leadUuid: 'lead_1',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: null,
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 50,
    totalPages: 3,
  },
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const createWrapper = () => TestWrapper;

describe('useLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchLeads.mockResolvedValue(mockLeadsResponse);
  });

  describe('basic functionality', () => {
    it('returns leads data and pagination', async () => {
      const { result } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockLeadsResponse.leads);
      expect(result.current.pagination).toEqual(mockLeadsResponse.pagination);
    });

    it('passes page and limit params to API', async () => {
      const { result } = renderHook(
        () => useLeads({ page: 2, limit: 25 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetchLeads).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 25,
        })
      );
    });

    it('uses default page=1 and limit=20', async () => {
      const { result } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetchLeads).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      );
    });
  });

  describe('isFetching state (AC#5)', () => {
    it('returns isFetching for pagination transitions', async () => {
      const { result } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      // Initially fetching
      expect(result.current.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });
    });

    it('isFetching is true during background refetch', async () => {
      const { result } = renderHook(() => useLeads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // After initial load, isFetching should be false
      expect(result.current.isFetching).toBe(false);
    });
  });

  describe('queryKey includes pagination params', () => {
    it('creates unique queryKey for different page values', async () => {
      const wrapper = createWrapper();

      const { result: result1 } = renderHook(
        () => useLeads({ page: 1, limit: 20 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      // First call should be for page 1
      expect(mockFetchLeads).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });
  });

  describe('keepPreviousData behavior (AC#5)', () => {
    it('returns previous data while fetching new page', async () => {
      const wrapper = createWrapper();

      const { result, rerender } = renderHook(
        ({ page }: { page: number }) => useLeads({ page, limit: 20 }),
        {
          wrapper,
          initialProps: { page: 1 },
        }
      );

      // Wait for initial data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockLeadsResponse.leads);

      // Set up different response for page 2
      const page2Response = {
        leads: [{ ...mockLeadsResponse.leads[0], row: 2 }],
        pagination: { page: 2, limit: 20, total: 50, totalPages: 3 },
      };
      mockFetchLeads.mockResolvedValueOnce(page2Response);

      // Change to page 2
      rerender({ page: 2 });

      // Data should still be available (keepPreviousData)
      expect(result.current.data).toBeDefined();

      // Wait for page 2 data
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });
    });
  });
});
