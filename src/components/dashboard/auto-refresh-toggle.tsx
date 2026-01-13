/**
 * Auto Refresh Toggle Component
 * Story 2.8: Auto Refresh
 *
 * AC#1: Auto Refresh Toggle - toggle in header, default OFF
 */
'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AutoRefreshToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

/**
 * Auto Refresh Toggle
 * Shows toggle switch for enabling/disabling auto-refresh
 * Note: Removed RefreshCw icon to avoid visual clutter with adjacent RefreshButton
 */
export function AutoRefreshToggle({
  enabled,
  onToggle,
  className,
}: AutoRefreshToggleProps) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-testid="auto-refresh-toggle"
    >
      <Switch
        id="auto-refresh"
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="Toggle auto-refresh"
        data-testid="auto-refresh-switch"
      />
      <Label
        htmlFor="auto-refresh"
        className={cn(
          'text-sm cursor-pointer',
          enabled ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        Auto-refresh
      </Label>
    </div>
  );
}
