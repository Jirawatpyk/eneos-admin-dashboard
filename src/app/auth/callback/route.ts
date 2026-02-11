import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validate redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with / (no protocol-relative or absolute URLs).
 */
function getSafeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('://') || next.includes('@')) {
    return '/dashboard';
  }
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}

// Exported for testing
export const _testOnly = { getSafeRedirectPath };
