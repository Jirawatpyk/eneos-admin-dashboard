/**
 * Activity Item Component
 * Story 2.5: Recent Activity Feed
 *
 * AC#2: Activity Types - different types with distinct icon/color
 * AC#3: Activity Details - icon, description, timestamp
 * AC#4: Timestamp Formatting - relative vs date format
 * AC#6: Color Coding - 🟢=closed, 🔵=claimed, 📞=contacted, 📥=new_lead
 */
'use client';

import { CheckCircle2, UserCheck, Phone, Inbox, HelpCircle } from 'lucide-react';
import { formatActivityTime } from '@/lib/format-activity-time';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ActivityType = 'claimed' | 'contacted' | 'closed' | 'new_lead';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  userId?: string;
  leadId?: string;
}

interface ActivityItemProps {
  activity: Activity;
}

interface ActivityConfig {
  icon: typeof CheckCircle2;
  colorClass: string;
  label: string;
}

/**
 * Activity type configuration with icons and colors
 * AC#6: 🟢=closed, 🔵=claimed, 📞=contacted, 📥=new_lead
 */
const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  closed: {
    icon: CheckCircle2,
    colorClass: 'text-green-600',
    label: 'Closed deal',
  },
  claimed: {
    icon: UserCheck,
    colorClass: 'text-blue-600',
    label: 'Claimed lead',
  },
  contacted: {
    icon: Phone,
    colorClass: 'text-amber-600',
    label: 'Contacted',
  },
  new_lead: {
    icon: Inbox,
    colorClass: 'text-gray-600',
    label: 'New lead',
  },
};

/**
 * H-02 Fix: Default config for unknown activity types
 */
const DEFAULT_ACTIVITY_CONFIG: ActivityConfig = {
  icon: HelpCircle,
  colorClass: 'text-muted-foreground',
  label: 'Activity',
};

/**
 * Get activity config with fallback for unknown types
 */
function getActivityConfig(type: string): ActivityConfig {
  return ACTIVITY_CONFIG[type as ActivityType] ?? DEFAULT_ACTIVITY_CONFIG;
}

/**
 * Individual activity item in the feed
 * Displays icon, description, and formatted timestamp
 */
export function ActivityItem({ activity }: ActivityItemProps) {
  const config = getActivityConfig(activity.type);
  const Icon = config.icon;
  const timeDisplay = formatActivityTime(activity.timestamp);

  return (
    <div
      className="flex items-start gap-3"
      data-testid={`activity-item-${activity.id}`}
    >
      <span
        className={cn('flex-shrink-0 mt-0.5', config.colorClass)}
        data-testid={`activity-icon-${activity.id}`}
        aria-label={config.label}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        {/* L-01 Fix: Tooltip shows full description on hover */}
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-foreground truncate cursor-default">
              {activity.description}
            </p>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{activity.description}</p>
          </TooltipContent>
        </Tooltip>
        <p
          className="text-xs text-muted-foreground"
          data-testid={`activity-time-${activity.id}`}
        >
          {timeDisplay}
        </p>
      </div>
    </div>
  );
}
