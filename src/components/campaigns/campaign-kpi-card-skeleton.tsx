/**
 * Campaign KPI Card Skeleton Component
 * Story 5.3: Campaign Summary Cards
 *
 * AC#4: Loading state with skeleton loaders
 * Matches dimensions of actual CampaignKPICard
 */
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for Campaign KPI Card
 * Displays while data is being fetched
 * AC#4: Skeleton matches dimensions of actual card
 */
export function CampaignKPICardSkeleton() {
  return (
    <Card
      data-testid="campaign-kpi-card-skeleton"
      aria-busy="true"
      aria-label="Loading campaign KPI data"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Grid of skeleton cards for loading state
 * AC#4: 4 skeleton cards matching actual grid layout
 */
export function CampaignKPICardsSkeleton() {
  return (
    <div
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      data-testid="campaign-kpi-cards-skeleton"
    >
      {[...Array(4)].map((_, i) => (
        <CampaignKPICardSkeleton key={i} />
      ))}
    </div>
  );
}
