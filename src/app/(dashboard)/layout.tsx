import { getServerSession, Session } from 'next-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserNav } from '@/components/layout/user-nav';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { SessionWarning } from '@/components/shared/session-warning';
import { SessionSync } from '@/components/shared/session-sync';
import { PermissionErrorHandler } from '@/components/shared/permission-error-handler';

/**
 * Check if E2E test bypass is enabled
 * SECURITY: Only works when x-e2e-test-bypass header is present AND NODE_ENV !== 'production'
 */
async function isE2ETestBypass(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') return false;

  const headersList = await headers();
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
  const session = (await isE2ETestBypass())
    ? getMockSession()
    : await getServerSession(authOptions);

  // Defense-in-depth: This check is backup to middleware protection.
  // Middleware handles route protection first, this catches edge cases.
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - fixed position */}
      <Sidebar />

      {/* Main content area - offset by sidebar on desktop */}
      <div className="md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b">
          <div className="px-4 sm:px-6 lg:px-8 h-[65px] flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {/* Mobile hamburger menu */}
                <MobileSidebar />
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {session.user && <UserNav user={session.user} />}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      {/* Session management components */}
      <SessionWarning />
      <SessionSync />
      <PermissionErrorHandler />
    </div>
  );
}
