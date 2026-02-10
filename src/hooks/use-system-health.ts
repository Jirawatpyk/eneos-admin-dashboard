/**
 * System Health Hook
 * Story 7.5: System Health
 *
 * Fetches system health status from backend health endpoints.
 * Combines /health and /live data for complete system status.
 *
 * AC#1: Fetch health data for System Health Card
 * AC#4: Support refresh functionality
 * AC#6: Handle loading and error states
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

interface ServiceHealth {
  status: 'up' | 'down' | 'unknown';
  latency: number;
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  error?: string;
  refreshed?: boolean;
  services: {
    supabase: ServiceHealth;
    geminiAI: ServiceHealth;
    lineAPI: ServiceHealth;
  };
}

interface LiveResponse {
  alive: boolean;
  uptime: number | null; // seconds
}

export interface SystemHealthData extends HealthCheckResponse {
  uptime?: number; // seconds from /live endpoint
}

export interface UseSystemHealthReturn {
  data: SystemHealthData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format uptime seconds to human-readable string
 * Examples: "5m", "2h 30m", "1d 5h 30m"
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Shared fetch logic for health endpoints
 * @param healthEndpoint - Either '/api/health' (cached) or '/api/health/refresh' (fresh)
 */
async function fetchHealthData(healthEndpoint: '/api/health' | '/api/health/refresh'): Promise<SystemHealthData> {
  const [healthRes, liveRes] = await Promise.all([
    fetch(healthEndpoint),
    fetch('/api/live').catch(() => null), // /live is optional
  ]);

  if (!healthRes.ok) {
    throw new Error(healthEndpoint === '/api/health/refresh' ? 'Health refresh failed' : 'Health check failed');
  }

  const healthData: HealthCheckResponse = await healthRes.json();
  let uptime: number | undefined;

  if (liveRes?.ok) {
    const liveData: LiveResponse = await liveRes.json();
    if (liveData.uptime !== null) {
      uptime = liveData.uptime;
    }
  }

  return { ...healthData, uptime };
}

/** Fetch cached health data */
async function fetchSystemHealth(): Promise<SystemHealthData> {
  return fetchHealthData('/api/health');
}

/** Force refresh health data bypassing cache */
async function refreshSystemHealth(): Promise<SystemHealthData> {
  return fetchHealthData('/api/health/refresh');
}

// ============================================================================
// Hook
// ============================================================================

export function useSystemHealth(): UseSystemHealthReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchSystemHealth,
    staleTime: 30 * 1000, // 30 seconds (matches backend cache TTL)
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
    retry: 1, // Only retry once on failure
  });

  const refetch = async () => {
    const data = await refreshSystemHealth();
    queryClient.setQueryData(['system-health'], data);
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    isRefetching: query.isFetching && !query.isLoading,
  };
}
