'use client';

/**
 * QuickReports Component
 * Story 6.3: Quick Reports - Task 1
 *
 * Quick report presets section with Daily, Weekly, Monthly report cards.
 * Sits above the Custom Export form on the Export page.
 */
import type { LucideIcon } from 'lucide-react';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { useQuickReports } from '@/hooks/use-quick-reports';
import { ReportCard } from '@/components/export/report-card';
import type { ReportType } from '@/lib/report-date-utils';
import type { DashboardPeriod } from '@/types/dashboard';

export interface ReportPreset {
  type: ReportType;
  title: string;
  description: string;
  icon: LucideIcon;
  period: DashboardPeriod;
  stats: { label: string; key: string }[];
}

const REPORT_PRESETS: ReportPreset[] = [
  {
    type: 'daily',
    title: 'Daily Summary',
    description: "Today's leads and activity",
    icon: CalendarDays,
    period: 'today',
    stats: [
      { label: 'New Leads', key: 'totalLeads' },
      { label: 'Contacted', key: 'contacted' },
      { label: 'Closed', key: 'closed' },
    ],
  },
  {
    type: 'weekly',
    title: 'Weekly Summary',
    description: "This week's performance overview",
    icon: CalendarRange,
    period: 'week',
    stats: [
      { label: 'Total Leads', key: 'totalLeads' },
      { label: 'Conversion', key: 'conversionRate' },
      { label: 'Top Performer', key: 'topSalesName' },
    ],
  },
  {
    type: 'monthly',
    title: 'Monthly Summary',
    description: 'Full month metrics and trends',
    icon: Calendar,
    period: 'month',
    stats: [
      { label: 'Total Leads', key: 'totalLeads' },
      { label: 'Conversion', key: 'conversionRate' },
      { label: 'Campaigns', key: 'totalCampaigns' },
    ],
  },
];

export function QuickReports() {
  const previewData = useQuickReports();

  const getStats = (type: ReportType): Record<string, string | number> | null => {
    return previewData[type] as Record<string, string | number> | null;
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Quick Reports</h2>
        <p className="text-sm text-muted-foreground">
          One-click preset reports with today&apos;s data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_PRESETS.map((preset) => (
          <ReportCard
            key={preset.type}
            preset={preset}
            stats={getStats(preset.type)}
            isLoading={previewData.isLoading[preset.type]}
          />
        ))}
      </div>
    </div>
  );
}
