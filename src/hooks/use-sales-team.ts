/**
 * Sales Team Hook
 * Story 4.5: Filter by Owner - AC#2
 *
 * Fetches sales team members from backend API
 * Used by LeadOwnerFilter dropdown
 *
 * Features:
 * - TanStack Query v5 object syntax
 * - Long staleTime (5 min) since team rarely changes
 * - Proper error handling and loading states
 */
'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Sales team member from backend API
 */
export interface SalesTeamMember {
  id: string;
  name: string;
  email: string | null;
}

/**
 * API response format
 */
interface SalesTeamResponse {
  success: boolean;
  data: SalesTeamMember[];
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Custom error for sales team API
 */
export class SalesTeamApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SalesTeamApiError';
  }
}

/**
 * Fetch sales team from API
 */
async function fetchSalesTeam(): Promise<SalesTeamMember[]> {
  const response = await fetch('/api/admin/sales-team', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new SalesTeamApiError(
      `Failed to fetch sales team: ${response.statusText}`,
      response.status
    );
  }

  const result: SalesTeamResponse = await response.json();

  if (!result.success) {
    throw new SalesTeamApiError(
      result.error?.message || 'Unknown error occurred',
      response.status,
      result.error?.code
    );
  }

  return result.data;
}

/**
 * Return type for useSalesTeam hook
 */
export interface UseSalesTeamReturn {
  data: SalesTeamMember[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: SalesTeamApiError | null;
  refetch: () => void;
}

/**
 * Type guard for SalesTeamApiError
 */
function isSalesTeamApiError(error: unknown): error is SalesTeamApiError {
  return error instanceof SalesTeamApiError;
}

/**
 * Hook for fetching sales team members
 * Used by LeadOwnerFilter dropdown
 *
 * @example
 * ```tsx
 * const { data: salesTeam, isLoading, isError } = useSalesTeam();
 *
 * if (isLoading) return <Skeleton />;
 * if (isError) return <Error />;
 *
 * return (
 *   <select>
 *     {salesTeam?.map((member) => (
 *       <option key={member.id} value={member.id}>
 *         {member.name}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useSalesTeam(): UseSalesTeamReturn {
  const query = useQuery({
    queryKey: ['sales-team'],
    queryFn: fetchSalesTeam,
    staleTime: 5 * 60 * 1000, // 5 minutes - team rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: isSalesTeamApiError(query.error) ? query.error : null,
    refetch: query.refetch,
  };
}
