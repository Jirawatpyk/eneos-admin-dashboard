/**
 * Debounce Hook
 * Story 4.3: Search
 *
 * AC#2: Real-time Search with Debounce
 * - Debounce delay: 300ms
 * - Cancel pending debounce on new input
 * - Return isPending state for loading indicator
 *
 * @see project-context.md → Debounce 300ms per Epic acceptance criteria
 */
'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Basic debounce hook - returns debounced value after delay
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 300ms per AC#2)
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * // debouncedSearch updates 300ms after search stops changing
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // AC#2: Set up timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // AC#2: Cancel pending debounce on new input
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Return type for useDebouncedValue hook
 */
export interface UseDebouncedValueReturn<T> {
  /** The debounced value */
  debouncedValue: T;
  /** True when waiting for debounce to complete */
  isPending: boolean;
}

/**
 * Advanced debounce hook with isPending state
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 300ms per AC#2)
 * @returns Object with debouncedValue and isPending state
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const { debouncedValue, isPending } = useDebouncedValue(search, 300);
 *
 * // Show loading indicator while pending
 * return (
 *   <div>
 *     <Input value={search} onChange={(e) => setSearch(e.target.value)} />
 *     {isPending && <Spinner />}
 *   </div>
 * );
 * ```
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = 300
): UseDebouncedValueReturn<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  // Track if this is the initial mount to avoid setting isPending on mount
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip setting isPending on initial mount (value hasn't "changed")
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // AC#2: Mark as pending when value changes (not on initial mount)
    setIsPending(true);

    // AC#2: Set up timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    // AC#2: Cancel pending debounce on new input
    return () => clearTimeout(timer);
  }, [value, delay]);

  return { debouncedValue, isPending };
}
