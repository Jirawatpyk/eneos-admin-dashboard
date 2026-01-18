/**
 * Lead Source Filter Component
 * Story 4.14: Filter by Lead Source
 *
 * AC#1: Filter Dropdown Display
 * - Shows "Lead Source" filter dropdown in filter toolbar
 * - "All Sources" selected by default
 * - Filter icon displayed
 *
 * AC#2: Source Options
 * - All available lead sources from API
 * - "All Sources" option to clear
 * - Sources listed alphabetically
 *
 * AC#3: Single-Select Filter
 * - Select one source at a time
 * - Selecting another replaces current
 *
 * AC#8: Empty Source Handling
 * - "Unknown" option for leads with null leadSource
 *
 * AC#9: Accessibility
 * - Keyboard navigation (Enter/Space/Arrow)
 * - Screen reader announcements
 */
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadSourceFilterProps {
  /** Currently selected source (null = all sources) */
  value: string | null;
  /** Available sources from API */
  sources: string[];
  /** Callback when selection changes */
  onChange: (value: string | null) => void;
  /** Whether sources are loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

// Special values for filtering
const ALL_SOURCES = '__all__';
const UNKNOWN_SOURCE = '__unknown__';

export function LeadSourceFilter({
  value,
  sources,
  onChange,
  isLoading = false,
  className,
  disabled = false,
}: LeadSourceFilterProps) {
  // AC#3: Handle source selection
  const handleChange = (newValue: string) => {
    if (newValue === ALL_SOURCES) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  // Get display value - convert null to ALL_SOURCES for select
  const selectValue = value ?? ALL_SOURCES;

  // AC#1: Get display text
  const getDisplayText = () => {
    if (!value || value === ALL_SOURCES) return 'All Sources';
    if (value === UNKNOWN_SOURCE) return 'Unknown';
    return value;
  };

  return (
    <div
      className={cn('flex items-center', className)}
      data-testid="lead-source-filter"
    >
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          className={cn(
            'w-[180px] h-9 border-dashed gap-2',
            value && value !== ALL_SOURCES && 'border-primary bg-primary/5'
          )}
          aria-label={`Filter by lead source${value ? `, ${getDisplayText()} selected` : ''}`}
          data-testid="source-filter-trigger"
        >
          <Filter
            className="h-4 w-4 text-muted-foreground shrink-0"
            aria-hidden="true"
          />
          <SelectValue placeholder="All Sources">
            {isLoading ? 'Loading...' : getDisplayText()}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {/* AC#2: All Sources option at top */}
          <SelectItem
            value={ALL_SOURCES}
            data-testid="source-option-all"
          >
            All Sources
          </SelectItem>

          {/* AC#8: Unknown option for null sources */}
          <SelectItem
            value={UNKNOWN_SOURCE}
            data-testid="source-option-unknown"
          >
            Unknown
          </SelectItem>

          {/* AC#2: Available sources alphabetically sorted */}
          {sources.map((source) => (
            <SelectItem
              key={source}
              value={source}
              data-testid={`source-option-${source.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
