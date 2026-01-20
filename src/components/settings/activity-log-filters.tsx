/**
 * Activity Log Filters Component (Story 7-7)
 * Provides filtering UI for activity log
 *
 * AC#3: Filter by date range
 * AC#4: Filter by status
 * AC#5: Filter by changed by
 */
'use client';

import { useState, useCallback } from 'react';
import { Filter, X, Check, CalendarIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/lead';
import type { ChangedByOption } from '@/types/activity';

// ===========================================
// Lead Status Options (Same as leads page)
// ===========================================

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
  { value: 'lost', label: 'Lost' },
  { value: 'unreachable', label: 'Unreachable' },
];

// ===========================================
// Date Range Type
// ===========================================

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// ===========================================
// Status Filter Component
// ===========================================

interface StatusFilterProps {
  value: LeadStatus[];
  onChange: (statuses: LeadStatus[]) => void;
  disabled?: boolean;
}

function StatusFilter({ value, onChange, disabled = false }: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedCount = value.length;
  const hasSelection = selectedCount > 0;

  const toggleStatus = useCallback(
    (status: LeadStatus) => {
      if (value.includes(status)) {
        onChange(value.filter((s) => s !== status));
      } else {
        onChange([...value, status]);
      }
    },
    [value, onChange]
  );

  const clearAll = useCallback(() => {
    onChange([]);
    setOpen(false);
  }, [onChange]);

  const getButtonText = () => {
    if (!hasSelection) return 'Status';
    if (selectedCount === 1) {
      const status = STATUS_OPTIONS.find((o) => o.value === value[0]);
      return status?.label || 'Status';
    }
    return `${selectedCount} statuses`;
  };

  return (
    <div className="flex items-center gap-2" data-testid="activity-status-filter">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('h-9 border-dashed gap-2', hasSelection && 'border-primary bg-primary/5')}
            disabled={disabled}
            data-testid="status-filter-trigger"
          >
            <Filter className="h-4 w-4" />
            <span>{getButtonText()}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              onClick={clearAll}
              data-testid="status-option-all"
            >
              <span className="flex-1 text-left font-medium">All Statuses</span>
              {!hasSelection && <Check className="h-4 w-4 text-primary" />}
            </button>

            <div className="my-1 h-px bg-border" />

            {STATUS_OPTIONS.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => toggleStatus(option.value)}
                  data-testid={`status-option-${option.value}`}
                >
                  <span className="flex-1">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {hasSelection && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onChange([])}
          data-testid="status-filter-clear"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

// ===========================================
// Date Range Filter Component
// ===========================================

interface DateRangeFilterProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  disabled?: boolean;
}

/**
 * Get date range presets
 */
function getDateRangePresets() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // This Week (Monday to Sunday)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
  startOfWeek.setDate(today.getDate() - diff);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // This Month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return {
    today: { from: today, to: endOfDay },
    thisWeek: { from: startOfWeek, to: endOfWeek },
    thisMonth: { from: startOfMonth, to: endOfMonth },
  };
}

function DateRangeFilter({ value, onChange, disabled = false }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const hasSelection = value?.from || value?.to;

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getButtonText = () => {
    if (!hasSelection) return 'Date range';
    if (value?.from && value?.to) {
      return `${formatDate(value.from)} - ${formatDate(value.to)}`;
    }
    if (value?.from) return `From ${formatDate(value.from)}`;
    if (value?.to) return `Until ${formatDate(value.to)}`;
    return 'Date range';
  };

  const handlePresetClick = (preset: 'today' | 'thisWeek' | 'thisMonth') => {
    const presets = getDateRangePresets();
    onChange(presets[preset]);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2" data-testid="activity-date-filter">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('h-9 border-dashed gap-2', hasSelection && 'border-primary bg-primary/5')}
            disabled={disabled}
            data-testid="date-filter-trigger"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="max-w-[200px] truncate">{getButtonText()}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          {/* Date Range Presets */}
          <div className="p-3 border-b flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick('today')}
              data-testid="date-preset-today"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick('thisWeek')}
              data-testid="date-preset-this-week"
            >
              This Week
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick('thisMonth')}
              data-testid="date-preset-this-month"
            >
              This Month
            </Button>
          </div>

          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={{ from: value?.from, to: value?.to }}
            onSelect={(range) => {
              if (range?.from || range?.to) {
                onChange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={2}
          />
          <div className="p-3 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              data-testid="date-filter-clear"
            >
              Clear
            </Button>
            <Button type="button" size="sm" onClick={() => setOpen(false)} data-testid="date-filter-apply">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasSelection && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onChange(null)}
          data-testid="date-filter-quick-clear"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

// ===========================================
// Changed By Filter Component
// ===========================================

interface ChangedByFilterProps {
  value: string | null;
  options: ChangedByOption[];
  onChange: (changedBy: string | null) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

function ChangedByFilter({
  value,
  options,
  onChange,
  disabled = false,
  isLoading = false,
}: ChangedByFilterProps) {
  return (
    <div className="flex items-center gap-2" data-testid="activity-changed-by-filter">
      <Select
        value={value || 'all'}
        onValueChange={(v) => onChange(v === 'all' ? null : v)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          className={cn('w-[180px] h-9', value && 'border-primary bg-primary/5')}
          data-testid="changed-by-trigger"
        >
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder={isLoading ? 'Loading...' : 'Changed by'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" data-testid="changed-by-option-all">
            All users
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id} data-testid={`changed-by-option-${option.id}`}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onChange(null)}
          data-testid="changed-by-filter-clear"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

// ===========================================
// Main Filters Export
// ===========================================

export interface ActivityLogFiltersProps {
  statusValue: LeadStatus[];
  dateRangeValue: DateRange | null;
  changedByValue: string | null;
  changedByOptions: ChangedByOption[];
  onStatusChange: (statuses: LeadStatus[]) => void;
  onDateRangeChange: (range: DateRange | null) => void;
  onChangedByChange: (changedBy: string | null) => void;
  onClearAll: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ActivityLogFilters({
  statusValue,
  dateRangeValue,
  changedByValue,
  changedByOptions,
  onStatusChange,
  onDateRangeChange,
  onChangedByChange,
  onClearAll,
  disabled = false,
  isLoading = false,
}: ActivityLogFiltersProps) {
  const hasAnyFilter = statusValue.length > 0 || dateRangeValue !== null || changedByValue !== null;

  return (
    <div className="flex flex-wrap items-center gap-4" data-testid="activity-log-filters">
      <StatusFilter value={statusValue} onChange={onStatusChange} disabled={disabled} />

      <DateRangeFilter value={dateRangeValue} onChange={onDateRangeChange} disabled={disabled} />

      <ChangedByFilter
        value={changedByValue}
        options={changedByOptions}
        onChange={onChangedByChange}
        disabled={disabled}
        isLoading={isLoading}
      />

      {hasAnyFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 text-muted-foreground hover:text-foreground"
          onClick={onClearAll}
          data-testid="clear-all-filters"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}

// Export date range type for use in container
export type { DateRange };
