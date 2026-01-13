/**
 * Recent Activity Container
 * Story 2.5: Recent Activity Feed
 *
 * Container component that fetches data and transforms API response
 * to the format expected by RecentActivity presentational component
 */
'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { RecentActivity } from './recent-activity';
import { DashboardError } from './dashboard-error';
import type { Activity, ActivityType } from './activity-item';
import type { ApiActivityItem, DashboardPeriod } from '@/types/dashboard';

interface RecentActivityContainerProps {
  period?: DashboardPeriod;
}

/**
 * Map API activity type to frontend activity type
 * Backend uses 'new', frontend expects 'new_lead'
 * All 6 status types: new, claimed, contacted, closed, lost, unreachable
 */
function mapActivityType(apiType: ApiActivityItem['type']): ActivityType {
  switch (apiType) {
    case 'new':
      return 'new_lead';
    case 'claimed':
    case 'contacted':
    case 'closed':
    case 'lost':
    case 'unreachable':
      return apiType;
    default:
      return 'new_lead';
  }
}

/**
 * Generate description from API activity item
 * Format: "{salesName} {action} {company}"
 */
function generateDescription(item: ApiActivityItem): string {
  const actionMap: Record<ApiActivityItem['type'], string> = {
    new: 'New lead from',
    claimed: 'claimed',
    contacted: 'contacted',
    closed: 'closed deal with',
    lost: 'lost',
    unreachable: 'marked unreachable',
  };

  const action = actionMap[item.type] || item.type;

  if (item.type === 'new') {
    return `${action} ${item.company || item.customerName}`;
  }

  return `${item.salesName} ${action} ${item.company || item.customerName}`;
}

/**
 * Transform API activity items to frontend Activity format
 */
function transformActivities(apiActivities: ApiActivityItem[]): Activity[] {
  return apiActivities.map((item) => ({
    id: item.id,
    type: mapActivityType(item.type),
    description: generateDescription(item),
    timestamp: item.timestamp,
    userId: item.salesId || undefined,
    leadId: item.leadId?.toString(),
  }));
}

/**
 * Recent Activity Container Component
 * Fetches dashboard data and renders RecentActivity with transformed data
 */
export function RecentActivityContainer({ period = 'month' }: RecentActivityContainerProps) {
  const { data, isLoading, isError, error, refetch } = useDashboardData({ period });

  // Error state
  if (isError && error) {
    return (
      <DashboardError
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  // Transform API data to component format
  const activities = data?.recentActivity
    ? transformActivities(data.recentActivity)
    : [];

  return (
    <RecentActivity
      activities={activities}
      isLoading={isLoading}
    />
  );
}
