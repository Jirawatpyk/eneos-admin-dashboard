/**
 * Lead Metrics Component
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#3: Performance Metrics Section
 * - Response Time (new → claimed) formatted as "X hours Y minutes" or "X days"
 * - Closing Time (claimed → closed) if lead is closed
 * - Lead Age (time since created)
 * - Shows "-" when not applicable
 */
'use client';

import { Clock, Timer, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/lib/format-duration';
import type { LeadMetrics as LeadMetricsType } from '@/types/lead-detail';

interface LeadMetricsProps {
  metrics: LeadMetricsType;
}

interface MetricItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function MetricItem({ label, value, icon, description }: MetricItemProps) {
  return (
    <div className="flex items-start gap-3" data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="p-2 rounded-lg bg-muted shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-base" title={description}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function LeadMetrics({ metrics }: LeadMetricsProps) {
  return (
    <Card>
      <CardContent className="p-4 grid gap-4 sm:grid-cols-3">
        <MetricItem
          label="Response Time"
          value={formatDuration(metrics.responseTime)}
          icon={<Timer className="h-4 w-4 text-blue-500" />}
          description="Time from new to claimed"
        />
        <MetricItem
          label="Closing Time"
          value={formatDuration(metrics.closingTime)}
          icon={<Clock className="h-4 w-4 text-green-500" />}
          description="Time from claimed to closed"
        />
        <MetricItem
          label="Lead Age"
          value={formatDuration(metrics.age)}
          icon={<Calendar className="h-4 w-4 text-amber-500" />}
          description="Time since lead was created"
        />
      </CardContent>
    </Card>
  );
}
