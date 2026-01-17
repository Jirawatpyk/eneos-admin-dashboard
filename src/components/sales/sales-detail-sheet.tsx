/**
 * Sales Detail Sheet Component
 * Story 3.1: Sales Team Performance Table
 * Story 3.5: Individual Performance Trend (integrated)
 * Story 3.8: Export Individual Performance Report
 *
 * AC#7: Detail Sheet/Dialog panel showing individual metrics
 * - Shows: name, email, all metrics, and period breakdown
 * - Can be closed with X button or Escape key
 * - Story 3.5: Includes individual trend chart
 * - Story 3.8: Includes export button in header
 */
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Target,
  PhoneCall,
  CheckCircle,
  XCircle,
  PhoneOff,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  formatConversionRate,
  getConversionRateColor,
  formatResponseTime,
  getConversionRateValue,
} from '@/lib/format-sales';
import type { SalesPersonMetrics } from '@/types/sales';
import { cn } from '@/lib/utils';
import { IndividualTrendChart } from './individual-trend-chart';
import { ExportDropdown } from './export-dropdown';

interface SalesDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesPerson: SalesPersonMetrics | null;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string;
}

function MetricCard({ label, value, icon, colorClass }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn('text-xl font-semibold', colorClass)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesDetailSheet({
  open,
  onOpenChange,
  salesPerson,
}: SalesDetailSheetProps) {
  // Always render Sheet component to maintain proper state management
  // Content is conditionally rendered based on salesPerson availability
  // This prevents state inconsistency when open=true but salesPerson becomes null

  if (!salesPerson) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="w-full sm:max-w-lg"
          data-testid="sales-detail-sheet"
        >
          <SheetHeader>
            <SheetTitle>No Data</SheetTitle>
            <SheetDescription>No sales person selected</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const conversionRateValue = getConversionRateValue(
    salesPerson.closed,
    salesPerson.claimed
  );
  const conversionRateColor = getConversionRateColor(conversionRateValue);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto"
        data-testid="sales-detail-sheet"
      >
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <SheetTitle className="text-xl">{salesPerson.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {salesPerson.email}
              </SheetDescription>
            </div>
            {/* Story 3.8: Export Button */}
            <ExportDropdown
              data={salesPerson}
              disabled={salesPerson.claimed === 0}
              disabledReason="No data for this period"
            />
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Performance Summary */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Conversion Rate"
                value={formatConversionRate(
                  salesPerson.closed,
                  salesPerson.claimed
                )}
                icon={<Target className="h-4 w-4 text-primary" />}
                colorClass={conversionRateColor}
              />
              <MetricCard
                label="Avg Response Time"
                value={formatResponseTime(salesPerson.avgResponseTime)}
                icon={<Clock className="h-4 w-4 text-blue-500" />}
              />
            </div>
          </div>

          {/* Lead Statistics */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Lead Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Claimed"
                value={salesPerson.claimed}
                icon={<Target className="h-4 w-4 text-blue-500" />}
              />
              <MetricCard
                label="Contacted"
                value={salesPerson.contacted}
                icon={<PhoneCall className="h-4 w-4 text-amber-500" />}
              />
              <MetricCard
                label="Closed"
                value={salesPerson.closed}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              />
              <MetricCard
                label="Lost"
                value={salesPerson.lost}
                icon={<XCircle className="h-4 w-4 text-red-500" />}
              />
            </div>
          </div>

          {/* Additional Stats */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Additional Statistics
            </h3>
            <MetricCard
              label="Unreachable"
              value={salesPerson.unreachable}
              icon={<PhoneOff className="h-4 w-4 text-gray-500" />}
            />
          </div>

          {/* Story 3.5: Performance Trend Chart */}
          <div className="pt-4 border-t">
            <IndividualTrendChart
              userId={salesPerson.userId}
              userName={salesPerson.name}
            />
          </div>

          {/* Status Badges */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Performance Indicators
            </p>
            <div className="flex flex-wrap gap-2">
              {conversionRateValue >= 30 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  High Performer
                </Badge>
              )}
              {conversionRateValue > 0 && conversionRateValue < 10 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Needs Attention
                </Badge>
              )}
              {salesPerson.claimed > 0 && (
                <Badge variant="outline">
                  {salesPerson.claimed} Leads Assigned
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
