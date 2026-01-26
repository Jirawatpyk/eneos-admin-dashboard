import { useQuery } from '@tanstack/react-query';

export interface SalesOwner {
  id: string;
  name: string;
  email?: string;
}

/**
 * Fetch sales owners for filter dropdown
 * Task 5: Filter Application Logic
 */
async function fetchSalesOwners(): Promise<SalesOwner[]> {
  const response = await fetch('/api/sales-owners');

  if (!response.ok) {
    throw new Error('Failed to fetch sales owners');
  }

  const result = await response.json();

  // Backend response structure: { success: true, data: { team: [...] } }
  return result.data?.team || [];
}

export function useSalesOwners() {
  return useQuery({
    queryKey: ['sales-owners'],
    queryFn: fetchSalesOwners,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
