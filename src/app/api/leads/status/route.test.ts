/**
 * Lead Status API Route Tests (Admin Endpoint)
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 *
 * Tests for admin-only /api/leads/status endpoint
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock getSessionOrUnauthorized
const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

import { GET } from './route';

// Mock global fetch
global.fetch = vi.fn();

function mockAdminSession(token = 'mock-supabase-token') {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: {
      access_token: token,
      user: { app_metadata: { role: 'admin' } },
    },
    response: null,
  });
}

function mockViewerSession() {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: {
      access_token: 'viewer-token',
      user: { app_metadata: { role: 'viewer' } },
    },
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

describe('GET /api/leads/status (Admin Endpoint)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 403 if user is not admin', async () => {
    mockViewerSession();

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FORBIDDEN');
    expect(data.error.message).toBe('Admin access required');
  });

  it('should return 401 if no session', async () => {
    mockNoSession();

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('should fetch from backend successfully for admin', async () => {
    mockAdminSession();

    const mockBackendResponse = {
      success: true,
      data: [
        { correlationId: 'uuid-123', status: 'processing', progress: 60, currentStep: 'Saving to Google Sheets', createdAt: '2026-01-27T10:00:00Z', updatedAt: '2026-01-27T10:00:05Z' },
      ],
      total: 1,
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockBackendResponse,
    } as Response);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.total).toBe(1);
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/api/leads/status'),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-supabase-token',
        },
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should handle backend error (503)', async () => {
    mockAdminSession();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false, status: 503,
      json: async () => ({ success: false, error: 'Service unavailable' }),
    } as Response);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
  });

  it('should handle network timeout', async () => {
    mockAdminSession();

    vi.mocked(global.fetch).mockRejectedValue(new Error('Network timeout'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROXY_ERROR');
    expect(data.error.message).toBe('Network timeout');
  });
});
