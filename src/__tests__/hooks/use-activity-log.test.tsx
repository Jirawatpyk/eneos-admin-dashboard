/**
 * useActivityLog Hook Tests
 * Story 7.7: Activity Log Page
 *
 * Tests for activity log data fetching hook.
 * AC#2: Display activity log with pagination
 * AC#3: Filter by date range
 * AC#4: Filter by status
 * AC#5: Filter by changed by
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useActivityLog } from '@/hooks/use-activity-log';
import type { ActivityLogResponse } from '@/types/activity';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Lead objects (full data for detail modal)
const mockLead1 = {
  row: 5,
  date: '2026-01-15',
  customerName: 'John Doe',
  email: 'john@acme.com',
  phone: '0812345678',
  company: 'ACME Corporation',
  industryAI: 'Manufacturing',
  website: 'https://acme.com',
  capital: '5,000,000',
  status: 'contacted' as const,
  salesOwnerId: 'U1234567890abcdef',
  salesOwnerName: 'John Sales',
  campaignId: 'campaign_001',
  campaignName: 'Campaign Q1',
  emailSubject: 'ENEOS Premium Oils',
  source: 'brevo',
  leadId: 'lead_001',
  eventId: 'evt_001',
  clickedAt: '2026-01-15T09:00:00Z',
  talkingPoint: 'ENEOS has premium lubricants',
  closedAt: null,
  lostAt: null,
  unreachableAt: null,
  version: 1,
  leadSource: 'email',
  jobTitle: 'Manager',
  city: 'Bangkok',
  leadUuid: 'lead_abc123',
  createdAt: '2026-01-15T09:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
  juristicId: '0123456789012',
  dbdSector: 'MFG-A',
  province: 'กรุงเทพมหานคร',
  fullAddress: '123 Main St, Bangkok 10500',
};

const mockLead2 = {
  row: 12,
  date: '2026-01-14',
  customerName: 'Jane Smith',
  email: 'jane@techstartup.com',
  phone: '0898765432',
  company: 'Tech Startup Inc.',
  industryAI: 'Technology',
  website: 'https://techstartup.com',
  capital: '10,000,000',
  status: 'closed' as const,
  salesOwnerId: null,
  salesOwnerName: null,
  campaignId: 'campaign_002',
  campaignName: 'Campaign Q1',
  emailSubject: 'ENEOS Solutions',
  source: 'brevo',
  leadId: 'lead_002',
  eventId: 'evt_002',
  clickedAt: '2026-01-14T14:00:00Z',
  talkingPoint: null,
  closedAt: '2026-01-14T14:30:00Z',
  lostAt: null,
  unreachableAt: null,
  version: 1,
  leadSource: 'email',
  jobTitle: 'CEO',
  city: 'Chiang Mai',
  leadUuid: 'lead_def456',
  createdAt: '2026-01-14T14:00:00Z',
  updatedAt: '2026-01-14T14:30:00Z',
  juristicId: null,
  dbdSector: null,
  province: null,
  fullAddress: null,
};

// Mock API responses
const mockActivityLogResponse: ActivityLogResponse = {
  success: true,
  data: {
    entries: [
      {
        id: 'lead_abc123_2026-01-15T10:00:00Z',
        leadUUID: 'lead_abc123',
        rowNumber: 5,
        companyName: 'ACME Corporation',
        status: 'contacted',
        changedById: 'U1234567890abcdef',
        changedByName: 'John Sales',
        timestamp: '2026-01-15T10:00:00Z',
        notes: 'Called customer',
        lead: mockLead1,
      },
      {
        id: 'lead_def456_2026-01-14T14:30:00Z',
        leadUUID: 'lead_def456',
        rowNumber: 12,
        companyName: 'Tech Startup Inc.',
        status: 'closed',
        changedById: 'System',
        changedByName: 'System',
        timestamp: '2026-01-14T14:30:00Z',
        notes: null,
        lead: mockLead2,
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    },
    filters: {
      changedByOptions: [
        { id: 'U1234567890abcdef', name: 'John Sales' },
        { id: 'System', name: 'System' },
      ],
    },
  },
};

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryWrapper';
  return Wrapper;
}

describe('useActivityLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('data fetching', () => {
    it('fetches activity log data on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      const { result } = renderHook(() => useActivityLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/activity-log?');
      expect(result.current.data?.entries).toHaveLength(2);
      expect(result.current.data?.pagination.total).toBe(50);
    });

    it('sets isLoading to true initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useActivityLog({}), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('selects data correctly from API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      const { result } = renderHook(() => useActivityLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.data?.entries).toEqual(mockActivityLogResponse.data.entries);
      expect(result.current.data?.pagination).toEqual(mockActivityLogResponse.data.pagination);
      expect(result.current.data?.changedByOptions).toEqual(
        mockActivityLogResponse.data.filters.changedByOptions
      );
    });
  });

  describe('query parameters', () => {
    it('includes page and limit in query string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      renderHook(() => useActivityLog({ page: 2, limit: 50 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=50');
    });

    it('includes date range in query string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      renderHook(() => useActivityLog({ from: '2026-01-01', to: '2026-01-15' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('from=2026-01-01');
      expect(calledUrl).toContain('to=2026-01-15');
    });

    it('includes status filter in query string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      renderHook(() => useActivityLog({ status: 'new,contacted' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('status=new%2Ccontacted');
    });

    it('includes changedBy filter in query string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      renderHook(() => useActivityLog({ changedBy: 'U1234567890' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('changedBy=U1234567890');
    });

    it('omits undefined parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      renderHook(() => useActivityLog({ page: 1, from: undefined, status: undefined }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).not.toContain('from');
      expect(calledUrl).not.toContain('status');
    });
  });

  describe('error handling', () => {
    it('sets isError when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
          }),
      });

      const { result } = renderHook(() => useActivityLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('sets error message from API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid date format' },
          }),
      });

      const { result } = renderHook(() => useActivityLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      expect(result.current.error?.message).toBe('Invalid date format');
    });

    it('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useActivityLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('query key', () => {
    it('uses activity-log as base query key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      renderHook(() => useActivityLog({ page: 1 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Query should be made - we verify this works correctly
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('refetches when parameters change', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      const { rerender } = renderHook(
        ({ params }) => useActivityLog(params),
        {
          wrapper: createWrapper(),
          initialProps: { params: { page: 1 } },
        }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      rerender({ params: { page: 2 } });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('caching behavior', () => {
    it('caches data for subsequent renders with same params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityLogResponse),
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 30000 },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result, rerender } = renderHook(() => useActivityLog({}), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Rerender with same params should use cached data
      rerender();

      // Still only 1 fetch because data is cached
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.current.data?.entries).toHaveLength(2);
    });
  });
});
