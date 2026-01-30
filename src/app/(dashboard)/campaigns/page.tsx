/**
 * Campaigns Page
 * Story 5.3: Campaign Summary Cards
 *
 * AC#1: Display 4 KPI cards for campaign metrics
 * AC#7: Responsive layout
 */

import { Suspense } from 'react';
import { CampaignKPICardsGrid, CampaignKPICardsSkeleton } from '@/components/campaigns';

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

      <Suspense fallback={<CampaignKPICardsSkeleton />}>
        <CampaignKPICardsGrid />
      </Suspense>

      {/* Future: Campaign Table (Story 5-4), Charts (Story 5-6) */}
    </div>
  );
}
