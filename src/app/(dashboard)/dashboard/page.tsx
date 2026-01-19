import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardContent } from '@/components/dashboard';

/**
 * Dashboard Page
 * Server Component that fetches session and renders client DashboardContent
 *
 * Story 2.7: Date Filter Integration
 * - DateFilter in header syncs with URL
 * - All components receive period from URL params
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || 'User';

  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-16 bg-muted rounded" />
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent userName={userName} />
    </Suspense>
  );
}
