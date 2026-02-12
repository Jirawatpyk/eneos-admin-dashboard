/**
 * Shared Auth Helper for API Proxy Routes
 * Story 12-1: Dashboard Proxy Migration (AC-1)
 *
 * Provides getSessionOrUnauthorized() for all authenticated API routes.
 * Creates Supabase server client, checks session, returns access_token.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Get Supabase session or return 401 Unauthorized response.
 *
 * Usage in API routes:
 *   const { session, response } = await getSessionOrUnauthorized();
 *   if (!session) return response;
 *   // session.access_token is the Supabase JWT to forward to Backend
 */
export async function getSessionOrUnauthorized() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      ),
    };
  }

  return { session, response: null };
}
