/**
 * Quick Reports Hook
 * Story 6.3: Quick Reports - Task 3
 *
 * Fetches preview data for Daily, Weekly, Monthly report cards.
 * Uses existing useDashboardData and useCampaigns hooks.
 */
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useCampaigns } from '@/hooks/use-campaigns';

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

  // Campaign count from leads grouped by brevoCampaignId (GET /api/admin/campaigns?period=month)
  const { data: campaignsData } = useCampaigns({ period: 'month' });

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
          totalCampaigns: campaignsData?.length ?? 0,
        }
      : null,
    isLoading: {
      daily: dailyLoading,
      weekly: weeklyLoading,
      monthly: monthlyLoading,
    },
  };
}
