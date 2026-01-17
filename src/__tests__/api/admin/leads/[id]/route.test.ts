/**
 * Lead Detail API Route Tests
 * Story 4.1: Lead List Table
 *
 * Tests for single lead API proxy route
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/leads/[id]/route';

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { getToken } from 'next-auth/jwt';

describe('GET /api/admin/leads/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (id: string) => {
    return new NextRequest(`http://localhost:3001/api/admin/leads/${id}`);
  };

  const createParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const request = createRequest('1');
    const response = await GET(request, createParams('1'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when no idToken in session', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      // No idToken
    });

    const request = createRequest('1');
    const response = await GET(request, createParams('1'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NO_TOKEN');
  });

  it('forwards request to backend with lead ID', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          row: 5,
          company: 'Test Company',
          customerName: 'John Doe',
          email: 'john@test.com',
          status: 'new',
        },
      }),
    });

    const request = createRequest('5');
    const response = await GET(request, createParams('5'));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/leads/5'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-google-id-token',
        }),
      })
    );
    expect(response.status).toBe(200);
  });

  it('returns 404 when lead not found', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      }),
    });

    const request = createRequest('999');
    const response = await GET(request, createParams('999'));

    expect(response.status).toBe(404);
  });

  it('returns 500 on fetch error', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    mockFetch.mockRejectedValue(new Error('Network error'));

    const request = createRequest('1');
    const response = await GET(request, createParams('1'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROXY_ERROR');
  });

  it('returns lead data on success', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    const mockLead = {
      row: 10,
      company: 'ABC Corp',
      customerName: 'Jane Smith',
      email: 'jane@abc-corp.com',
      phone: '0812345678',
      status: 'claimed',
      salesOwnerName: 'Bob Sales',
      campaignName: 'Q1 Campaign',
      createdAt: '2026-01-15T10:00:00Z',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockLead,
      }),
    });

    const request = createRequest('10');
    const response = await GET(request, createParams('10'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.row).toBe(10);
    expect(data.data.company).toBe('ABC Corp');
  });
});
