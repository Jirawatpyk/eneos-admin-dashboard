/**
 * KPI Card Component
 * Story 2.1: KPI Cards
 *
 * AC#1: Display KPI card with label and value
 * AC#3: Display percentage/rate below value
 * AC#4: Visual indicators (up/down arrows with color)
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Users, UserCheck, Phone, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KPIIconType = 'leads' | 'claimed' | 'contacted' | 'closed';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: KPIIconType;
  /** When true, displays rate in neutral color (not green/red) */
  isRate?: boolean;
}

const icons = {
  leads: Users,
  claimed: UserCheck,
  contacted: Phone,
  closed: Trophy,
};

/**
 * KPI Card displays a single metric with change indicator
 */
export function KPICard({ title, value, change, changeLabel, icon, isRate = false }: KPICardProps) {
  const Icon = icons[icon];
  // For rates, always use neutral color. For changes, use green/red based on value.
  const isPositive = !isRate && change !== undefined && change > 0;
  const isNegative = !isRate && change !== undefined && change < 0;

  return (
    <Card data-testid={`kpi-card-${icon}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`kpi-value-${icon}`} suppressHydrationWarning>
          {value.toLocaleString()}
        </div>
        {change !== undefined && (
          <p
            className={cn(
              'text-xs flex items-center gap-1',
              isPositive && 'text-green-600',
              isNegative && 'text-red-600',
              (!isPositive && !isNegative) && 'text-muted-foreground'
            )}
            data-testid={`kpi-change-${icon}`}
          >
            {isPositive && <ArrowUp className="h-3 w-3" aria-label="increase" />}
            {isNegative && <ArrowDown className="h-3 w-3" aria-label="decrease" />}
            <span>
              {!isRate && change > 0 ? '+' : ''}
              {change.toFixed(1)}% {changeLabel}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
