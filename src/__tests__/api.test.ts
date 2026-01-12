import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { fetchWithAuth, SessionExpiredError, ForbiddenError, apiGet, apiPost } from '@/lib/api';

describe('API Client - AC4: Session Expired Handler', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('fetchWithAuth', () => {
    it('should return response on successful request', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
      });
      mockFetch.mockResolvedValue(mockResponse);

      const response = await fetchWithAuth('/api/test');

      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should redirect to login with SessionExpired on 401 response', async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 401 }));

      await expect(fetchWithAuth('/api/test')).rejects.toThrow(SessionExpiredError);
      expect(window.location.href).toBe('/login?error=SessionExpired');
    });

    it('should NOT redirect on 401 when skipAuthCheck is true', async () => {
      const mockResponse = new Response(null, { status: 401 });
      mockFetch.mockResolvedValue(mockResponse);

      const response = await fetchWithAuth('/api/test', { skipAuthCheck: true });

      expect(response.status).toBe(401);
      expect(window.location.href).toBe('');
    });

    it('should use full URL when endpoint starts with http', async () => {
      mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await fetchWithAuth('https://external-api.com/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://external-api.com/test',
        expect.anything()
      );
    });

    it('should include Content-Type header', async () => {
      mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await fetchWithAuth('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('apiGet', () => {
    it('should return parsed JSON on success', async () => {
      const mockData = { id: 1, name: 'test' };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const result = await apiGet('/api/test');

      expect(result).toEqual(mockData);
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValue(
        new Response(null, { status: 500, statusText: 'Internal Server Error' })
      );

      await expect(apiGet('/api/test')).rejects.toThrow(
        'API error: 500 Internal Server Error'
      );
    });
  });

  describe('apiPost', () => {
    it('should send POST request with JSON body', async () => {
      const mockData = { success: true };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const result = await apiPost('/api/test', { name: 'test' });

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });
  });

  describe('SessionExpiredError', () => {
    it('should be instance of Error', () => {
      const error = new SessionExpiredError('test');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = new SessionExpiredError('test');
      expect(error.name).toBe('SessionExpiredError');
    });
  });

  describe('ForbiddenError', () => {
    it('should be instance of Error', () => {
      const error = new ForbiddenError('test');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = new ForbiddenError('test');
      expect(error.name).toBe('ForbiddenError');
    });
  });

  describe('403 Forbidden handling', () => {
    it('should throw ForbiddenError on 403 response', async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 403 }));

      await expect(fetchWithAuth('/api/test')).rejects.toThrow(ForbiddenError);
      await expect(fetchWithAuth('/api/test')).rejects.toThrow(
        'You do not have permission to access this resource'
      );
    });

    it('should NOT redirect to login on 403 (user is authenticated)', async () => {
      mockFetch.mockResolvedValue(new Response(null, { status: 403 }));

      try {
        await fetchWithAuth('/api/test');
      } catch {
        // Expected to throw
      }

      // Should not redirect - 403 means user is authenticated but not authorized
      expect(window.location.href).toBe('');
    });
  });
});
