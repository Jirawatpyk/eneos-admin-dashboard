/**
 * Sales Trend Data Hook
 * Story 3.5: Individual Performance Trend
 *
 * TanStack Query v5 hook for fetching individual sales trend data
 * Uses mock data generator until backend endpoint is available
 */

import { useQuery } from '@tanstack/react-query';
import type {
  SalesTrendData,
  DailyMetric,
  TrendPeriod,
} from '@/types/sales';

// ===========================================
// Mock Data Generator
// ===========================================

/**
 * Seeded random number generator for deterministic mock data
 * Uses sine-based PRNG for consistent results across runs
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate mock daily metrics for development
 * Creates realistic trending data with deterministic variance based on userId + day
 */
function generateMockDailyData(days: number, userId: string): DailyMetric[] {
  const data: DailyMetric[] = [];
  const today = new Date();

  // Base values vary by user (deterministic based on userId)
  const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseClaimed = 3 + (userSeed % 5);
  const baseContacted = Math.floor(baseClaimed * 0.7);
  const baseClosed = Math.floor(baseClaimed * 0.3);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Deterministic variance (±30%) based on userSeed + day index
    const daySeed = userSeed + i;
    const variance = 0.7 + seededRandom(daySeed) * 0.6;
    const claimed = Math.max(0, Math.round(baseClaimed * variance));
    const contacted = Math.min(claimed, Math.max(0, Math.round(baseContacted * variance)));
    const closed = Math.min(contacted, Math.max(0, Math.round(baseClosed * variance)));

    data.push({
      date: date.toISOString().split('T')[0],
      claimed,
      contacted,
      closed,
      conversionRate: claimed > 0 ? Math.round((closed / claimed) * 100) : 0,
    });
  }

  return data;
}

/**
 * Generate team average mock data
 * Deterministic based on day index for consistent comparison
 */
function generateMockTeamAverage(days: number): DailyMetric[] {
  const data: DailyMetric[] = [];
  const today = new Date();
  const teamSeed = 12345; // Fixed seed for team average

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Deterministic team averages (more stable)
    const daySeed = teamSeed + i;
    const claimed = 4 + Math.round(seededRandom(daySeed) * 2);
    const contacted = Math.round(claimed * 0.75);
    const closed = Math.round(claimed * 0.35);

    data.push({
      date: date.toISOString().split('T')[0],
      claimed,
      contacted,
      closed,
      conversionRate: claimed > 0 ? Math.round((closed / claimed) * 100) : 0,
    });
  }

  return data;
}

/**
 * Fetch sales trend data from API
 * Falls back to mock data if API unavailable
 */
async function fetchSalesTrend(userId: string, days: TrendPeriod): Promise<SalesTrendData> {
  const apiUrl = `/api/admin/sales-performance/trend?userId=${userId}&days=${days}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      // API not available, use mock data
      throw new Error('API unavailable');
    }

    const result = await response.json();
    return result.data;
  } catch {
    // Fallback to mock data for development
    return {
      userId,
      name: 'Mock User',
      period: days,
      dailyData: generateMockDailyData(days, userId),
      teamAverage: generateMockTeamAverage(days),
    };
  }
}

// ===========================================
// Hook Interface
// ===========================================

interface UseSalesTrendOptions {
  enabled?: boolean;
}

export interface UseSalesTrendReturn {
  data: SalesTrendData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// ===========================================
// Main Hook
// ===========================================

/**
 * Custom hook for individual sales trend data
 *
 * @param userId - Sales person's user ID
 * @param days - Period in days (7, 30, or 90)
 * @param options - enabled flag
 * @returns Query result with trend data, loading, error states
 */
export function useSalesTrend(
  userId: string,
  days: TrendPeriod = 30,
  options: UseSalesTrendOptions = {}
): UseSalesTrendReturn {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['sales-trend', userId, days],
    queryFn: () => fetchSalesTrend(userId, days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
    retry: 1, // Only retry once since we have mock fallback
    enabled: !!userId && enabled,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
