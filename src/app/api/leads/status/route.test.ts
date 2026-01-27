/**
 * Lead Status API Route Tests (Admin Endpoint)
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 * AC#5: Tests (Quality Gate)
 *
 * Tests for admin-only /api/leads/status endpoint
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock NextAuth JWT
const mockAdminToken = {
  idToken: 'mock-google-id-token',
  role: 'admin',
};

const mockSalesToken = {
  idToken: 'mock-google-id-token',
  role: 'sales',
};

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// Mock roles config
vi.mock('@/config/roles', () => ({
  isAdmin: vi.fn((role: string) => role === 'admin'),
}));

// Mock global fetch
global.fetch = vi.fn();

import { getToken } from 'next-auth/jwt';

describe('GET /api/leads/status (Admin Endpoint)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 403 if user is not admin', async () => {
    // Non-admin token
    vi.mocked(getToken).mockResolvedValue(mockSalesToken as any);

    const request = new NextRequest('http://localhost:3001/api/leads/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Admin access required');
  });

  it('should return 401 if no token', async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/leads/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Not authenticated');
  });

  it('should return 401 if no idToken', async () => {
    vi.mocked(getToken).mockResolvedValue({ role: 'admin' } as any); // No idToken

    const request = new NextRequest('http://localhost:3001/api/leads/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Google ID token not found. Please sign out and sign in again.');
  });

  it('should fetch from backend successfully for admin', async () => {
    vi.mocked(getToken).mockResolvedValue(mockAdminToken as any);

    const mockBackendResponse = {
      success: true,
      data: [
        {
          correlationId: 'uuid-123',
          status: 'processing',
          progress: 60,
          currentStep: 'Saving to Google Sheets',
          createdAt: '2026-01-27T10:00:00Z',
          updatedAt: '2026-01-27T10:00:05Z',
        },
      ],
      total: 1,
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockBackendResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3001/api/leads/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.total).toBe(1);
    expect(data.data).toHaveLength(1);
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      'http://localhost:3000/api/leads/status',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-google-id-token',
        },
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should handle backend error (503)', async () => {
    vi.mocked(getToken).mockResolvedValue(mockAdminToken as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ success: false, error: 'Service unavailable' }),
    } as Response);

    const request = new NextRequest('http://localhost:3001/api/leads/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
  });

  it('should handle network timeout', async () => {
    vi.mocked(getToken).mockResolvedValue(mockAdminToken as any);

    vi.mocked(global.fetch).mockRejectedValue(new Error('Network timeout'));

    const request = new NextRequest('http://localhost:3001/api/leads/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Network timeout');
  });
});
