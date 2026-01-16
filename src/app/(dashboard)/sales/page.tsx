import { Suspense } from 'react';
import { Metadata } from 'next';
import { PerformanceTableContainer, PerformanceTableSkeleton } from '@/components/sales';

/**
 * Sales Performance Page
 * Story 3.1: Sales Team Performance Table
 *
 * Server Component that renders the Sales Performance content
 * Protected by middleware authentication
 */

export const metadata: Metadata = {
  title: 'Sales Performance - ENEOS Admin',
  description: 'View and analyze sales team performance metrics',
};

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Sales Team Performance
        </h1>
        <p className="text-muted-foreground">
          View individual performance metrics and track your team&apos;s success
        </p>
      </div>
      <Suspense fallback={<PerformanceTableSkeleton />}>
        <PerformanceTableContainer />
      </Suspense>
    </div>
  );
}
