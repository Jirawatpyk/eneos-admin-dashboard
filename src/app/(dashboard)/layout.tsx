import { getServerSession, Session } from 'next-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserNav } from '@/components/layout/user-nav';
import { SessionWarning } from '@/components/shared/session-warning';
import { SessionSync } from '@/components/shared/session-sync';
import { PermissionErrorHandler } from '@/components/shared/permission-error-handler';

/**
 * Check if E2E test bypass is enabled
 * SECURITY: Only works when x-e2e-test-bypass header is present AND NODE_ENV !== 'production'
 */
function isE2ETestBypass(): boolean {
  if (process.env.NODE_ENV === 'production') return false;

  const headersList = headers();
  return headersList.get('x-e2e-test-bypass') === 'true';
}

/**
 * Mock session for E2E tests
 */
function getMockSession(): Session {
  return {
    user: {
      id: 'e2e-test-user',
      name: 'E2E Test User',
      email: 'e2e@eneos.co.th',
      image: null,
      role: 'admin',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // E2E Test Bypass - use mock session in test mode
  const session = isE2ETestBypass()
    ? getMockSession()
    : await getServerSession(authOptions);

  // Defense-in-depth: This check is backup to middleware protection.
  // Middleware handles route protection first, this catches edge cases.
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 bg-eneos-red rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">ENEOS</span>
              </div>
              <span className="text-lg font-semibold text-gray-800">
                Sales Dashboard
              </span>
            </div>
            {session.user && <UserNav user={session.user} />}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <SessionWarning />
      <SessionSync />
      <PermissionErrorHandler />
    </div>
  );
}
