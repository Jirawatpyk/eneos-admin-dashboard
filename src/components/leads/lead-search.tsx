/**
 * Lead Search Component
 * Story 4.3: Search
 *
 * AC#1: Search input with placeholder, search icon (left), clear button (X when text entered)
 * AC#8: Keyboard shortcuts - "/" to focus, "Escape" to clear and blur
 * AC#9: Accessibility - aria-label "Search leads", live region announces result count
 *
 * @note Requires TooltipProvider in parent tree for keyboard shortcut tooltips
 */
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface LeadSearchProps {
  /** Current search input value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Whether search is pending (debounce in progress) */
  isPending?: boolean;
  /** Total number of results (for accessibility announcement) */
  resultCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Search input component for leads table
 *
 * Features:
 * - Search icon on left with tooltip showing keyboard shortcuts
 * - Clear button (X) when text is entered
 * - Loading spinner during search pending state
 * - Keyboard shortcuts: "/" to focus, "Escape" to clear
 * - Screen reader announcements for result count
 */
export function LeadSearch({
  value,
  onChange,
  isPending = false,
  resultCount,
  className,
}: LeadSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // AC#8: "/" keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not already focused on an input/textarea
      if (
        e.key === '/' &&
        document.activeElement !== inputRef.current &&
        !['INPUT', 'TEXTAREA'].includes(
          document.activeElement?.tagName || ''
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // AC#8: Escape key to clear and blur
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onChange('');
        inputRef.current?.blur();
      }
    },
    [onChange]
  );

  // AC#5: Clear search handler
  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className={cn('relative', className)}>
      {/* AC#1: Search icon with tooltip (AC#8 discoverable shortcuts) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 cursor-help">
            <Search
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>
            Press <kbd className="px-1 py-0.5 bg-muted/50 rounded text-[10px]">/</kbd> to focus,{' '}
            <kbd className="px-1 py-0.5 bg-muted/50 rounded text-[10px]">Esc</kbd> to clear
          </p>
        </TooltipContent>
      </Tooltip>

      {/* AC#1: Search input with placeholder */}
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search by company, email, or name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-16"
        aria-label="Search leads"
        data-testid="lead-search-input"
      />

      {/* AC#2: Loading indicator during debounce */}
      {isPending && (
        <div
          className="absolute right-10 top-1/2 -translate-y-1/2"
          data-testid="lead-search-loading"
        >
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      )}

      {/* AC#1: Clear button (X) when input has value */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
          onClick={handleClear}
          aria-label="Clear search"
          data-testid="lead-search-clear"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}

      {/* AC#9: Live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="lead-search-status"
      >
        {/* Announce searching state when pending */}
        {isPending && resultCount !== undefined && 'Searching...'}
        {/* Announce result count when not pending and results are available */}
        {!isPending && resultCount !== undefined && `Found ${resultCount} leads`}
        {/* When resultCount is undefined (initial load), don't announce anything */}
      </div>
    </div>
  );
}
