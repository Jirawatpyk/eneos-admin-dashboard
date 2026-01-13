/**
 * Refresh Button Component
 * Story 2.8: Auto Refresh
 *
 * AC#4: Manual Refresh Button - immediate data reload
 */
'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
  className?: string;
}

/**
 * Manual Refresh Button
 * Shows spinning icon while refreshing
 */
export function RefreshButton({
  onClick,
  isRefreshing,
  className,
}: RefreshButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={isRefreshing}
      className={className}
      aria-label="รีเฟรชข้อมูล Dashboard"
      title="รีเฟรชข้อมูล"
      data-testid="refresh-button"
    >
      <RefreshCw
        className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
        aria-hidden="true"
      />
    </Button>
  );
}
