/**
 * Campaign Summary Component
 * Story 2.9: Campaign Summary on Main Dashboard
 *
 * Presentational component showing headline metrics + top campaigns
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Send, Eye, MousePointerClick, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { CampaignSummary as CampaignSummaryType } from '@/types/dashboard';

interface CampaignSummaryProps {
  data: CampaignSummaryType;
}

export function CampaignSummary({ data }: CampaignSummaryProps) {
  const maxRate = Math.max(...data.topCampaigns.map(c => c.clickRate), 1);

  return (
    <Card data-testid="campaign-summary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          Campaign Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Headline Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div data-testid="campaign-summary-metric" className="text-center">
            <Send className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
            <p className="text-2xl font-bold text-foreground">
              {data.totalDelivered.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div data-testid="campaign-summary-metric" className="text-center">
            <Eye className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
            <p className="text-2xl font-bold text-foreground">
              {data.avgOpenRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Open Rate</p>
          </div>
          <div data-testid="campaign-summary-metric" className="text-center">
            <MousePointerClick className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
            <p className="text-2xl font-bold text-foreground">
              {data.avgClickRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Click Rate</p>
          </div>
        </div>

        <Separator />

        {/* Top Campaigns */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Top Campaigns</h4>
          <div className="space-y-3">
            {data.topCampaigns.map((campaign, index) => (
              <div
                key={campaign.campaignId}
                data-testid="campaign-summary-top-item"
                className="flex items-center gap-3"
              >
                <span className="text-sm text-muted-foreground w-4">{index + 1}.</span>
                <span className="text-sm font-medium truncate flex-1">{campaign.campaignName}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(campaign.clickRate / maxRate) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {campaign.clickRate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="flex justify-end pt-2">
          <Link
            href="/campaigns"
            data-testid="campaign-summary-view-all"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            View All Campaigns
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
