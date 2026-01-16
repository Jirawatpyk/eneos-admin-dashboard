/**
 * Progress Component
 * Custom progress bar component with accessible ARIA attributes
 * Story 3.7: Target vs Actual Comparison
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value (0-100) */
  value?: number;
  /** Maximum value (defaults to 100) */
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
export type { ProgressProps };
