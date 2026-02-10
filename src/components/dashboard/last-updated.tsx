/**
 * Last Updated Component
 * Story 2.8: Auto Refresh
 *
 * AC#5: Last Updated Timestamp - shows relative time, updates in real-time
 */
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LastUpdatedProps {
  timestamp: Date | null;
  className?: string;
  showIcon?: boolean;
}

/**
 * Last Updated Display
 * Shows relative time that updates every 10 seconds
 * Handles null timestamp during SSR hydration
 */
export function LastUpdated({
  timestamp,
  className,
  showIcon = true,
}: LastUpdatedProps) {
  const [, setTick] = useState(0);

  // Force re-render every 10 seconds to update relative time
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle null timestamp during hydration
  if (!timestamp) {
    return (
      <div
        className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}
        data-testid="last-updated"
      >
        {showIcon && <Clock className="h-3 w-3" aria-hidden="true" />}
        <span>อัพเดตล่าสุด: กำลังโหลด...</span>
      </div>
    );
  }

  const relativeTime = formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: th,
  });

  return (
    <div
      className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}
      data-testid="last-updated"
    >
      {showIcon && (
        <Clock className="h-3 w-3" aria-hidden="true" />
      )}
      <span suppressHydrationWarning>อัพเดตล่าสุด: {relativeTime}</span>
    </div>
  );
}
