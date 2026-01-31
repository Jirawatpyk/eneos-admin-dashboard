/**
 * Quick Reports Hook
 * Story 6.3: Quick Reports - Task 3
 *
 * Fetches preview data for Daily, Weekly, Monthly report cards.
 * Uses existing useDashboardData and useCampaignStats hooks.
 */
import { format } from 'date-fns';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useCampaignStats } from '@/hooks/use-campaign-stats';
import { getReportDateRange } from '@/lib/report-date-utils';

interface DailyPreview {
  totalLeads: number;
  contacted: number;
  closed: number;
}

interface WeeklyPreview {
  totalLeads: number;
  conversionRate: number;
  topSalesName: string;
}

interface MonthlyPreview {
  totalLeads: number;
  conversionRate: number;
  totalCampaigns: number;
}

export interface QuickReportPreviewData {
  daily: DailyPreview | null;
  weekly: WeeklyPreview | null;
  monthly: MonthlyPreview | null;
  isLoading: { daily: boolean; weekly: boolean; monthly: boolean };
}

export function useQuickReports(): QuickReportPreviewData {
  // All 3 calls fire in parallel (TanStack Query handles deduplication and caching)
  const { data: dailyData, isLoading: dailyLoading } = useDashboardData({ period: 'today' });
  const { data: weeklyData, isLoading: weeklyLoading } = useDashboardData({ period: 'week' });
  const { data: monthlyData, isLoading: monthlyLoading } = useDashboardData({ period: 'month' });

  // Campaign stats for monthly report
  const monthRange = getReportDateRange('monthly');
  const { data: campaignData } = useCampaignStats({
    dateFrom: monthRange.from ? format(monthRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: monthRange.to ? format(monthRange.to, 'yyyy-MM-dd') : undefined,
  });

  return {
    daily: dailyData
      ? {
          totalLeads: dailyData.summary.totalLeads,
          contacted: dailyData.summary.contacted,
          closed: dailyData.summary.closed,
        }
      : null,
    weekly: weeklyData
      ? {
          totalLeads: weeklyData.summary.totalLeads,
          conversionRate: weeklyData.summary.conversionRate,
          topSalesName: weeklyData.topSales?.[0]?.name ?? '--',
        }
      : null,
    monthly: monthlyData
      ? {
          totalLeads: monthlyData.summary.totalLeads,
          conversionRate: monthlyData.summary.conversionRate,
          totalCampaigns: campaignData?.totalCampaigns ?? 0,
        }
      : null,
    isLoading: {
      daily: dailyLoading,
      weekly: weeklyLoading,
      monthly: monthlyLoading,
    },
  };
}
