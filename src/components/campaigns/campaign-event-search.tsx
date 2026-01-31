/**
 * Campaign Event Search Component
 * Story 5.7: Campaign Detail Sheet
 *
 * AC#11: Debounced email search (300ms) with case-insensitive partial match
 */
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface CampaignEventSearchProps {
  /** Current search value (debounced) */
  value: string;
  /** Callback when search value changes (after debounce) */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
}

/** Debounce delay in milliseconds */
const DEBOUNCE_MS = 300;

export function CampaignEventSearch({
  value,
  onChange,
  placeholder = 'Search by email...',
}: CampaignEventSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative flex-1 max-w-sm" data-testid="event-email-search">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label="Search events by email"
        data-testid="event-search-input"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          aria-label="Clear search"
          data-testid="event-search-clear"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
