/**
 * ATDD Tests - Story 6-5: Select Data Fields (buildQueryParams + fields)
 * RED Phase: Tests for `fields` param in buildQueryParams and ExportParams.
 *
 * AC#5: Fields Passed to Backend Export API
 *
 * All tests should FAIL because ExportParams doesn't include `fields` yet.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { LEAD_EXPORT_COLUMNS } from '@/lib/export-leads';

// ===========================================
// Mock Setup
// ===========================================

const { mockToast } = vi.hoisted(() => ({
  mockToast: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocking
import { useExport } from '@/hooks/use-export';
import type { ExportParams } from '@/hooks/use-export';

// ===========================================
// Test Helpers
// ===========================================

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

// Mock successful fetch response
const mockSuccessResponse = () => {
  const blob = new Blob(['test'], { type: 'text/csv' });
  mockFetch.mockResolvedValue(
    new Response(blob, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename=leads_export_2026-01-15.csv',
        'Content-Type': 'text/csv',
      },
    })
  );
};

// Extract URLSearchParams from the fetch call URL
const getCalledSearchParams = (): URLSearchParams => {
  const calledUrl = mockFetch.mock.calls[0][0] as string;
  const url = new URL(calledUrl, 'http://localhost');
  return url.searchParams;
};

// ===========================================
// Tests
// ===========================================

describe('Story 6-5: buildQueryParams with fields (AC#5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuccessResponse();

    // Mock DOM APIs for download
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    // Mock URL methods without overwriting the constructor
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  // -------------------------------------------
  // AC#5: Fields param serialization
  // -------------------------------------------

  // GIVEN I have selected specific fields (Company, Email, Status)
  // WHEN I click Export
  // THEN the `fields` query param is sent as comma-separated column headers
  it('should include fields param as comma-separated headers', async () => {
    const { result } = renderHook(() => useExport(), {
      wrapper: createWrapper(),
    });

    const params: ExportParams = {
      format: 'csv',
      status: 'all',
      owner: 'all',
      campaign: 'all',
      fields: ['Company', 'Email', 'Status'],
    };

    await act(async () => {
      try {
        await result.current.exportData(params);
      } catch {
        // Ignore errors - we're testing the URL
      }
    });

    const searchParams = getCalledSearchParams();
    expect(searchParams.get('fields')).toBe('Company,Email,Status');
  });

  // GIVEN all fields are selected
  // WHEN I click Export
  // THEN the `fields` param is omitted entirely (optimization)
  it('should omit fields param when all fields are selected', async () => {
    const { result } = renderHook(() => useExport(), {
      wrapper: createWrapper(),
    });

    const allHeaders = LEAD_EXPORT_COLUMNS.map((c) => c.header);
    const params: ExportParams = {
      format: 'csv',
      status: 'all',
      owner: 'all',
      campaign: 'all',
      fields: allHeaders,
    };

    await act(async () => {
      try {
        await result.current.exportData(params);
      } catch {
        // Ignore errors
      }
    });

    const searchParams = getCalledSearchParams();
    expect(searchParams.has('fields')).toBe(false);
  });

  // GIVEN no fields param (undefined)
  // WHEN I click Export
  // THEN no fields param in the URL (backward compatible)
  it('should not include fields param when undefined', async () => {
    const { result } = renderHook(() => useExport(), {
      wrapper: createWrapper(),
    });

    const params: ExportParams = {
      format: 'csv',
      status: 'all',
      owner: 'all',
      campaign: 'all',
      // No fields
    };

    await act(async () => {
      try {
        await result.current.exportData(params);
      } catch {
        // Ignore errors
      }
    });

    const searchParams = getCalledSearchParams();
    expect(searchParams.has('fields')).toBe(false);
  });

  // GIVEN partial field selection (3 of 16)
  // WHEN buildQueryParams is called
  // THEN fields param contains exactly the selected headers
  it('should serialize field headers in correct format', async () => {
    const { result } = renderHook(() => useExport(), {
      wrapper: createWrapper(),
    });

    const params: ExportParams = {
      format: 'xlsx',
      status: 'all',
      owner: 'all',
      campaign: 'all',
      fields: ['Contact Name', 'Phone', 'Sales Owner'],
    };

    await act(async () => {
      try {
        await result.current.exportData(params);
      } catch {
        // Ignore errors
      }
    });

    const searchParams = getCalledSearchParams();
    expect(searchParams.get('fields')).toBe('Contact Name,Phone,Sales Owner');
  });
});
