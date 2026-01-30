/**
 * Campaign KPI Card Component
 * Story 5.3: Campaign Summary Cards
 *
 * AC#1: Display KPI card with label and value
 * AC#3: Display rate below value (neutral color)
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, Eye, MousePointerClick, type LucideIcon } from 'lucide-react';

export type CampaignIconType = 'campaigns' | 'delivered' | 'opened' | 'clicked';

interface CampaignKPICardProps {
  title: string;
  value: number;
  rate?: number;
  rateLabel?: string;
  icon: CampaignIconType;
}

const icons: Record<CampaignIconType, LucideIcon> = {
  campaigns: Mail,
  delivered: Send,
  opened: Eye,
  clicked: MousePointerClick,
};

/**
 * Campaign KPI Card displays a single campaign metric
 * AC#1: Value with formatting (1,234,567)
 * AC#3: Rate in neutral color (not green/red)
 */
export function CampaignKPICard({
  title,
  value,
  rate,
  rateLabel,
  icon,
}: CampaignKPICardProps) {
  const Icon = icons[icon];

  return (
    <Card data-testid={`campaign-kpi-card-${icon}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`campaign-kpi-value-${icon}`}>
          {value.toLocaleString()}
        </div>
        {rate !== undefined && (
          <p
            className="text-xs text-muted-foreground flex items-center gap-1"
            data-testid={`campaign-kpi-rate-${icon}`}
          >
            <span>{rate.toFixed(1)}%</span>
            {rateLabel && <span>{rateLabel}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
