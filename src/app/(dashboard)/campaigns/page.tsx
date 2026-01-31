/**
 * Campaigns Page
 * Story 5.3: Campaign Summary Cards
 * Story 5.4: Campaign Table
 * Story 5.6: Campaign Performance Chart
 * Story 5.8: Campaign Date Filter
 *
 * AC#1: Display 4 KPI cards for campaign metrics
 * AC#7: Responsive layout
 * AC#1 (5.8): Date filter displayed above Campaign Table
 */

import { Suspense } from 'react';
import { CampaignsContent } from '@/components/campaigns';

export const metadata = {
  title: 'Campaigns | ENEOS Admin',
  description: 'Email campaign analytics and metrics',
};

export default function CampaignsPage() {
  return (
    <div className="space-y-6" data-testid="campaigns-page">
      {/* Page Header - consistent with other pages */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Email campaign performance metrics
          </p>
        </div>
      </div>

      {/* Story 5.8: All campaign content wrapped with date filter state */}
      <Suspense fallback={<div>Loading...</div>}>
        <CampaignsContent />
      </Suspense>
    </div>
  );
}
