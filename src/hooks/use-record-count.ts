import { useDeferredValue, useMemo } from 'react';
import { useLeads } from '@/hooks/use-leads';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { LeadStatus } from '@/types/lead';

interface UseRecordCountParams {
  dateRange?: DateRange;
  status?: string;
  owner?: string;
}

export function useRecordCount(params: UseRecordCountParams) {
  const from = params.dateRange?.from
    ? format(params.dateRange.from, 'yyyy-MM-dd')
    : undefined;
  const to = params.dateRange?.to
    ? format(params.dateRange.to, 'yyyy-MM-dd')
    : undefined;

  // LeadStatus[] does NOT include 'all' - pass undefined for 'all'
  const statusValue = params.status && params.status !== 'all' ? params.status : undefined;
  const ownerValue = params.owner && params.owner !== 'all' ? params.owner : undefined;

  // useDeferredValue on primitives for debouncing rapid filter changes
  const deferredFrom = useDeferredValue(from);
  const deferredTo = useDeferredValue(to);
  const deferredStatus = useDeferredValue(statusValue);
  const deferredOwner = useDeferredValue(ownerValue);

  // Memoize arrays to maintain referential stability for TanStack Query's queryKey
  const statusArray = useMemo<LeadStatus[] | undefined>(
    () => (deferredStatus ? [deferredStatus as LeadStatus] : undefined),
    [deferredStatus]
  );
  const ownerArray = useMemo<string[] | undefined>(
    () => (deferredOwner ? [deferredOwner] : undefined),
    [deferredOwner]
  );

  const { pagination, isLoading } = useLeads({
    limit: 1,
    page: 1,
    from: deferredFrom,
    to: deferredTo,
    status: statusArray,
    owner: ownerArray,
  });

  return {
    count: pagination?.total,
    isLoading,
  };
}
