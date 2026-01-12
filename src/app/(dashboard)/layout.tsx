import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserNav } from '@/components/layout/user-nav';
import { SessionWarning } from '@/components/shared/session-warning';
import { SessionSync } from '@/components/shared/session-sync';
import { PermissionErrorHandler } from '@/components/shared/permission-error-handler';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

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
