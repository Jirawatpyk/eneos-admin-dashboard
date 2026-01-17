/**
 * Lead Status Badge Component
 * Story 4.1: Lead List Table
 *
 * AC#4: Status Badge Colors
 * - 'new' shows gray badge (bg-gray-100)
 * - 'claimed' shows blue badge (bg-blue-100)
 * - 'contacted' shows amber badge (bg-amber-100)
 * - 'closed' shows green badge (bg-green-100)
 * - 'lost' shows red badge (bg-red-100)
 * - 'unreachable' shows muted gray badge
 */
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '@/lib/leads-constants';
import type { LeadStatus } from '@/types/lead';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const colorClass = LEAD_STATUS_COLORS[status] || LEAD_STATUS_COLORS.new;
  const label = LEAD_STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="secondary"
      className={cn(colorClass, 'font-medium', className)}
      aria-label={`Status: ${label}`}
      data-testid={`lead-status-badge-${status}`}
    >
      {label}
    </Badge>
  );
}
