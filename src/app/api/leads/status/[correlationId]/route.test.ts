/**
 * Lead Status API Route Tests (Public Endpoint)
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 * AC#5: Tests (Quality Gate)
 *
 * Tests for public /api/leads/status/:correlationId endpoint
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock global fetch
global.fetch = vi.fn();

describe('GET /api/leads/status/:correlationId (Public Endpoint)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if correlationId is missing', async () => {
    const request = new NextRequest('http://localhost:3001/api/leads/status/');
    const params = Promise.resolve({ correlationId: '' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Correlation ID is required');
  });

  it('should fetch from backend successfully', async () => {
    const mockBackendResponse = {
      success: true,
      data: {
        correlationId: 'uuid-123',
        status: 'completed',
        progress: 100,
        result: {
          leadId: 'lead_550e8400',
          rowNumber: 42,
        },
        completedAt: '2026-01-27T10:00:10Z',
      },
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockBackendResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3001/api/leads/status/uuid-123');
    const params = Promise.resolve({ correlationId: 'uuid-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.correlationId).toBe('uuid-123');
    expect(data.data.status).toBe('completed');
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      'http://localhost:3000/api/leads/status/uuid-123',
      expect.objectContaining({
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should handle backend error (404 not found)', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: 'Status not found' }),
    } as Response);

    const request = new NextRequest('http://localhost:3001/api/leads/status/invalid-id');
    const params = Promise.resolve({ correlationId: 'invalid-id' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should handle network timeout', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network timeout'));

    const request = new NextRequest('http://localhost:3001/api/leads/status/uuid-123');
    const params = Promise.resolve({ correlationId: 'uuid-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Network timeout');
  });
});
