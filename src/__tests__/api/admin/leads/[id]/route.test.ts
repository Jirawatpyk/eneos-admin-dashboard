/**
 * Lead Detail API Route Tests
 * Story 4.1: Lead List Table
 *
 * Tests for single lead API proxy route
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { GET } from '@/app/api/admin/leads/[id]/route';

function mockSession(token = 'mock-supabase-token') {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: { access_token: token, user: { app_metadata: {} } },
    response: null,
  });
}

function mockNoSession() {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: null,
    response: NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    ),
  });
}

describe('GET /api/admin/leads/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (id: string) => new NextRequest(`http://localhost:3001/api/admin/leads/${id}`);
  const createParams = (id: string) => ({ params: Promise.resolve({ id }) });

  it('returns 401 when not authenticated', async () => {
    mockNoSession();

    const response = await GET(createRequest('1'), createParams('1'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('forwards request to backend with lead ID', async () => {
    mockSession('mock-supabase-token');

    mockFetch.mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({
        success: true,
        data: { row: 5, company: 'Test Company', customerName: 'John Doe', email: 'john@test.com', status: 'new' },
      }),
    });

    const response = await GET(createRequest('5'), createParams('5'));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/leads/5'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-supabase-token',
        }),
      })
    );
    expect(response.status).toBe(200);
  });

  it('returns 404 when lead not found', async () => {
    mockSession();
    mockFetch.mockResolvedValue({
      ok: false, status: 404,
      json: async () => ({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } }),
    });

    const response = await GET(createRequest('999'), createParams('999'));
    expect(response.status).toBe(404);
  });

  it('returns 500 on fetch error', async () => {
    mockSession();
    mockFetch.mockRejectedValue(new Error('Network error'));

    const response = await GET(createRequest('1'), createParams('1'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('PROXY_ERROR');
  });

  it('returns lead data on success', async () => {
    mockSession();

    mockFetch.mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({
        success: true,
        data: { row: 10, company: 'ABC Corp', customerName: 'Jane Smith', email: 'jane@abc-corp.com', phone: '0812345678', status: 'claimed', salesOwnerName: 'Bob Sales', campaignName: 'Q1 Campaign', createdAt: '2026-01-15T10:00:00Z' },
      }),
    });

    const response = await GET(createRequest('10'), createParams('10'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.company).toBe('ABC Corp');
  });
});
