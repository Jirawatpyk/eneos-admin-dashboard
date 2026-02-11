import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DashboardContent } from '@/components/dashboard';

/**
 * Dashboard Page
 * Server Component that fetches session and renders client DashboardContent
 *
 * Story 2.7: Date Filter Integration
 * - DateFilter in header syncs with URL
 * - All components receive period from URL params
 *
 * Story 11-4: Migrated from NextAuth getServerSession to Supabase getUser
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.name || user?.email || 'User';

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
