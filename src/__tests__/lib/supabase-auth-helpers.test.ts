/**
 * Tests for getSessionOrUnauthorized() auth helper
 * Story 12-1: Dashboard Proxy Migration (AC-1, AC-3)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. vi.hoisted() FIRST — create mock objects
const { mockGetSession } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  return { mockGetSession };
});

// 2. vi.mock() SECOND — uses hoisted mocks
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

// 3. Imports THIRD — after mocks are set up
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

describe('getSessionOrUnauthorized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return session when authenticated', async () => {
    // GIVEN: Valid Supabase session
    const mockSession = {
      access_token: 'mock-supabase-jwt',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'auth-user-uuid',
        email: 'test@eneos.co.th',
        app_metadata: { role: 'admin' },
      },
    };

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // WHEN: getSessionOrUnauthorized is called
    const result = await getSessionOrUnauthorized();

    // THEN: Returns session with null response
    expect(result.session).toBe(mockSession);
    expect(result.response).toBeNull();
    expect(result.session!.access_token).toBe('mock-supabase-jwt');
  });

  it('should return 401 when no session exists', async () => {
    // GIVEN: No Supabase session (user not logged in)
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // WHEN: getSessionOrUnauthorized is called
    const result = await getSessionOrUnauthorized();

    // THEN: Returns null session with 401 response
    expect(result.session).toBeNull();
    expect(result.response).not.toBeNull();

    const responseData = await result.response!.json();
    expect(result.response!.status).toBe(401);
    expect(responseData.success).toBe(false);
    expect(responseData.error.code).toBe('UNAUTHORIZED');
    expect(responseData.error.message).toBe('Not authenticated');
  });

  it('should return 401 when session has error', async () => {
    // GIVEN: Supabase returns error (e.g., expired refresh token)
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Session expired', status: 401 },
    });

    // WHEN: getSessionOrUnauthorized is called
    const result = await getSessionOrUnauthorized();

    // THEN: Returns null session with 401 response
    expect(result.session).toBeNull();
    expect(result.response).not.toBeNull();

    const responseData = await result.response!.json();
    expect(result.response!.status).toBe(401);
    expect(responseData.error.code).toBe('UNAUTHORIZED');
  });

  it('should extract access_token from valid session', async () => {
    // GIVEN: Session with access_token
    const mockSession = {
      access_token: 'supabase-jwt-for-backend',
      refresh_token: 'refresh-token',
      user: {
        id: 'user-uuid',
        email: 'admin@eneos.co.th',
        app_metadata: { role: 'viewer' },
      },
    };

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // WHEN: Session is retrieved
    const { session } = await getSessionOrUnauthorized();

    // THEN: access_token can be forwarded as Bearer token
    expect(session).not.toBeNull();
    expect(session!.access_token).toBe('supabase-jwt-for-backend');
    expect(session!.user.app_metadata.role).toBe('viewer');
  });
});
