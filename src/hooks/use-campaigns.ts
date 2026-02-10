import { useQuery } from '@tanstack/react-query';

export interface Campaign {
  id: string;
  name: string;
}

export interface UseCampaignsOptions {
  /** Filter campaigns by period (e.g. 'month', 'quarter'). Omit for backend default. */
  period?: string;
}

/**
 * Fetch campaigns from backend (leads grouped by brevoCampaignId)
 */
async function fetchCampaigns(period?: string): Promise<Campaign[]> {
  const params = period ? `?period=${period}` : '';
  const response = await fetch(`/api/admin/campaigns${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  const result = await response.json();

  // Backend response structure: { success: true, data: { campaigns: [...] } }
  return result.data?.campaigns || [];
}

export function useCampaigns(options?: UseCampaignsOptions) {
  const { period } = options || {};
  return useQuery({
    queryKey: ['campaigns', { period }],
    queryFn: () => fetchCampaigns(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
