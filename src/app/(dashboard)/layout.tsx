import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROLES } from '@/config/roles';
import { UserNav } from '@/components/layout/user-nav';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { ThemeToggle } from '@/components/shared/theme-toggle';
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
 * Mock user for E2E tests — Supabase User shape
 */
function getMockUser() {
  return {
    id: 'e2e-test-user',
    email: 'e2e@eneos.co.th',
    app_metadata: { role: ROLES.ADMIN },
    user_metadata: { name: 'E2E Test User', avatar_url: null },
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;

  if (await isE2ETestBypass()) {
    user = getMockUser();
  } else {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    user = supabaseUser;
  }

  // Defense-in-depth: backup to proxy protection
  if (!user) {
    redirect('/login');
  }

  const role = user.app_metadata?.role || ROLES.VIEWER;
  const userName = user.user_metadata?.name || user.email;
  const userImage = user.user_metadata?.avatar_url || null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <header className="sticky top-0 z-40 bg-card border-b">
          <div className="px-4 sm:px-6 lg:px-8 h-[65px] flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <MobileSidebar />
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserNav user={{
                  name: userName,
                  email: user.email,
                  image: userImage,
                  role: role,
                }} />
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
      <PermissionErrorHandler />
    </div>
  );
}
