/**
 * Single Lead Hook
 * Story 4.1: Lead List Table
 *
 * TanStack Query v5 hook for fetching single lead details
 * Used by LeadDetailSheet component
 */

import { useQuery } from '@tanstack/react-query';
import { fetchLeadById, LeadsApiError } from '@/lib/api/leads';
import type { Lead } from '@/types/lead';

export interface UseLeadOptions {
  enabled?: boolean;
}

export interface UseLeadReturn {
  data: Lead | undefined;
  isLoading: boolean;
  isError: boolean;
  error: LeadsApiError | null;
  refetch: () => void;
}

/**
 * Type guard for LeadsApiError
 */
function isLeadsApiError(error: unknown): error is LeadsApiError {
  return error instanceof LeadsApiError;
}

/**
 * Custom hook for single lead data
 * @param id - Lead row number (undefined to skip query)
 * @param options - Query options
 * @returns Query result with lead data, loading, error states
 */
export function useLead(
  id: number | undefined,
  options: UseLeadOptions = {}
): UseLeadReturn {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id!),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: enabled && id !== undefined,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: isLeadsApiError(query.error) ? query.error : null,
    refetch: query.refetch,
  };
}
