/**
 * Campaign Event Filter Component
 * Story 5.7: Campaign Detail Sheet
 *
 * AC#4: Event type filter tabs (All, Delivered, Opened, Clicked)
 */
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CampaignEventType } from '@/types/campaigns';

export interface CampaignEventFilterProps {
  /** Currently selected event type */
  selected: CampaignEventType;
  /** Callback when event type selection changes */
  onSelect: (type: CampaignEventType) => void;
}

const filterOptions: { label: string; value: CampaignEventType }[] = [
  { label: 'All Events', value: 'all' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Opened', value: 'opened' },
  { label: 'Clicked', value: 'click' },
];

export function CampaignEventFilter({ selected, onSelect }: CampaignEventFilterProps) {
  return (
    <div className="flex gap-2" data-testid="event-type-filter" role="group" aria-label="Filter by event type">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={selected === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(option.value)}
          className={cn(
            'min-w-[80px]',
            selected === option.value && 'pointer-events-none'
          )}
          aria-pressed={selected === option.value}
          data-testid={`filter-btn-${option.value}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
