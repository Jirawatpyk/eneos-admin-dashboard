/**
 * Accessible Legend Component
 * Story 3.3: Sales Performance Bar Chart
 *
 * AC#10: Accessibility
 * - Keyboard navigation works for legend toggle (Tab to focus, Enter/Space to toggle)
 * - Custom legend with proper ARIA attributes
 */
'use client';

import { useCallback, KeyboardEvent } from 'react';
import { SALES_BAR_COLORS } from '@/lib/chart-config';

interface LegendItem {
  key: 'claimed' | 'contacted' | 'closed';
  label: string;
  color: string;
}

interface AccessibleLegendProps {
  visibleMetrics: {
    claimed: boolean;
    contacted: boolean;
    closed: boolean;
  };
  onToggle: (metric: 'claimed' | 'contacted' | 'closed') => void;
}

const LEGEND_ITEMS: LegendItem[] = [
  { key: 'claimed', label: 'Claimed', color: SALES_BAR_COLORS.claimed },
  { key: 'contacted', label: 'Contacted', color: SALES_BAR_COLORS.contacted },
  { key: 'closed', label: 'Closed', color: SALES_BAR_COLORS.closed },
];

export function AccessibleLegend({ visibleMetrics, onToggle }: AccessibleLegendProps) {
  const handleKeyDown = useCallback(
    (metric: LegendItem['key']) => (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle(metric);
      }
    },
    [onToggle]
  );

  return (
    <div
      className="flex justify-center gap-6 pt-4"
      role="group"
      aria-label="Chart legend - click or press Enter/Space to toggle metrics"
    >
      {LEGEND_ITEMS.map((item) => {
        const isVisible = visibleMetrics[item.key];
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            onKeyDown={handleKeyDown(item.key)}
            className="flex items-center gap-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1 transition-opacity"
            style={{ opacity: isVisible ? 1 : 0.5 }}
            aria-pressed={isVisible}
            aria-label={`${item.label}: ${isVisible ? 'visible' : 'hidden'}. Press to toggle.`}
            data-testid={`legend-item-${item.key}`}
          >
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className={isVisible ? 'text-foreground' : 'text-muted-foreground line-through'}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
