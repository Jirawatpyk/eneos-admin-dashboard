/**
 * Alert Item Component
 * Story 2.6: Alerts Panel
 *
 * AC#2: Alert Types - unclaimed >24h, contacted >7 days, campaign ending
 * AC#3: Alert Content - icon, description, action button
 * AC#4: View Leads Action - navigate with filters
 * AC#7: Info Alerts - info icon, different styling
 */
'use client';

import Link from 'next/link';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ApiAlert } from '@/types/dashboard';

interface AlertItemProps {
  alert: ApiAlert;
}

/**
 * Alert type configuration with icons and colors
 * warning = amber/orange (urgent)
 * info = blue (informational)
 */
const ALERT_CONFIG = {
  warning: {
    icon: AlertTriangle,
    colorClass: 'text-amber-500',
  },
  info: {
    icon: Info,
    colorClass: 'text-blue-500',
  },
};

/**
 * Individual alert item in the alerts panel
 * Displays icon, message, and optional action button
 */
export function AlertItem({ alert }: AlertItemProps) {
  const config = ALERT_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <div
      className="flex items-start gap-3"
      data-testid={`alert-item-${alert.id}`}
    >
      <span
        className={cn('flex-shrink-0 mt-0.5', config.colorClass)}
        data-testid={`alert-icon-${alert.id}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm text-foreground"
          role={alert.severity === 'warning' ? 'alert' : undefined}
          aria-live={alert.severity === 'warning' ? 'polite' : undefined}
        >
          {alert.message}
        </p>
        {alert.link && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-primary hover:underline"
            asChild
          >
            <Link href={alert.link}>View Leads</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
