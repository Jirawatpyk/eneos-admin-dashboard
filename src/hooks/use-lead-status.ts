/**
 * Lead Status Hooks
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 * AC#2: Lead Status Hooks (Core)
 *
 * Hooks for fetching lead processing status from background processor.
 * - useLeadStatus: Get specific lead status by correlation ID (public)
 * - useAllLeadStatus: Get all active processing status (admin only)
 */
import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types (AC#2 requirement)
// ============================================================================

export type LeadProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface LeadStatusData {
  correlationId: string;
  status: LeadProcessingStatus;
  progress: number; // 0-100
  currentStep?: string;
  result?: {
    leadId?: string;
    rowNumber?: number;
    error?: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface LeadStatusResponse {
  success: boolean;
  data?: LeadStatusData;
  error?: string;
}

export interface AllLeadStatusResponse {
  success: boolean;
  data?: LeadStatusData[];
  total?: number;
  error?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Shared fetch logic for status endpoints
 * @param endpoint - Either '/api/leads/status' or '/api/leads/status/:id'
 */
async function fetchStatusData(endpoint: string): Promise<unknown> {
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Status fetch failed: ${response.status}`);
  }

  return response.json();
}

/** Fetch specific lead status by correlation ID (public endpoint) */
async function fetchLeadStatus(correlationId: string): Promise<LeadStatusResponse> {
  return fetchStatusData(`/api/leads/status/${correlationId}`) as Promise<LeadStatusResponse>;
}

/** Fetch all active lead processing status (admin-only endpoint) */
async function fetchAllLeadStatus(): Promise<AllLeadStatusResponse> {
  return fetchStatusData('/api/leads/status') as Promise<AllLeadStatusResponse>;
}

// ============================================================================
// Hooks
// ============================================================================

export interface UseLeadStatusOptions {
  /**
   * Enable auto-refresh while status is pending/processing
   * @default true
   */
  enablePolling?: boolean;
  /**
   * Polling interval in milliseconds
   * @default 2000 (2 seconds)
   */
  pollingInterval?: number;
}

/**
 * Hook to fetch specific lead status by correlation ID
 * AC#2: Auto-polls every 2s while pending/processing, stops when completed/failed
 */
export function useLeadStatus(
  correlationId: string | null | undefined,
  options: UseLeadStatusOptions = {}
) {
  const { enablePolling = true, pollingInterval = 2000 } = options;

  const query = useQuery({
    queryKey: ['lead-status', correlationId],
    queryFn: () => fetchLeadStatus(correlationId!),
    enabled: !!correlationId,
    // AC#2: Auto-polling while pending/processing
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (enablePolling && (status === 'pending' || status === 'processing')) {
        return pollingInterval;
      }
      return false; // Stop polling when completed/failed
    },
    retry: 1, // Only retry once on failure
  });

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // AC#2: Convenience flags
    isPending: query.data?.data?.status === 'pending',
    isProcessing: query.data?.data?.status === 'processing',
    isCompleted: query.data?.data?.status === 'completed',
    isFailed: query.data?.data?.status === 'failed',
  };
}

/**
 * Hook to fetch all active lead processing status (admin only)
 * AC#2: Auto-refreshes every 5 seconds
 */
export function useAllLeadStatus() {
  const query = useQuery({
    queryKey: ['all-lead-status'],
    queryFn: fetchAllLeadStatus,
    refetchInterval: 5000, // AC#2: Auto-refresh every 5 seconds
    retry: 1,
  });

  return {
    data: query.data?.data || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
