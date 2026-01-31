/**
 * Dashboard Period Hook
 * Reads period and custom date range from URL search params
 *
 * Single source of truth for dashboard period state.
 * Eliminates prop drilling — containers call useDashboardData()
 * which internally uses this hook to resolve the current period.
 */
'use client';

import { useSearchParams } from 'next/navigation';
import type { DashboardPeriod } from '@/types/dashboard';

const VALID_PERIODS: DashboardPeriod[] = [
  'today', 'yesterday', 'week', 'lastWeek',
  'month', 'lastMonth', 'quarter', 'year', 'custom',
];

export interface DashboardPeriodInfo {
  period: DashboardPeriod;
  startDate?: string;
  endDate?: string;
}

/**
 * Reads the current dashboard period from URL search params.
 * - Validates period against allowed values (defaults to 'month')
 * - Extracts from/to params for custom period
 */
export function useDashboardPeriod(): DashboardPeriodInfo {
  const searchParams = useSearchParams();

  const urlPeriod = searchParams.get('period') as DashboardPeriod | null;
  const period: DashboardPeriod =
    urlPeriod && VALID_PERIODS.includes(urlPeriod) ? urlPeriod : 'month';

  const startDate = period === 'custom' ? searchParams.get('from') ?? undefined : undefined;
  const endDate = period === 'custom' ? searchParams.get('to') ?? undefined : undefined;

  return { period, startDate, endDate };
}
