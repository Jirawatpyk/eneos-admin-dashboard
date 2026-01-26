import { useQuery } from '@tanstack/react-query';

export interface Campaign {
  id: string;
  name: string;
}

/**
 * Fetch campaigns for filter dropdown
 * Task 5: Filter Application Logic
 */
async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch('/api/admin/campaigns');

  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  const result = await response.json();

  // Backend response structure: { success: true, data: { campaigns: [...] } }
  return result.data?.campaigns || [];
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
