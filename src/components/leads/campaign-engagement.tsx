/**
 * Campaign Engagement Component
 * Story 9.7: Campaign Engagement Timeline UI
 *
 * AC#1: Display campaign events grouped by campaignId
 * AC#2: Campaign name header + chronological events with type/timestamp/URL
 * AC#3: Return null when no events
 * AC#4: Distinct visual indicators per event type
 */
'use client';

import { Mail, Eye, ExternalLink } from 'lucide-react';
import { formatLeadDateTime } from '@/lib/format-lead';
import type { LeadCampaignEvent } from '@/types/lead-detail';

interface CampaignEngagementProps {
  events: LeadCampaignEvent[];
}

const EVENT_CONFIG: Record<string, { icon: typeof Mail; color: string; label: string }> = {
  delivered: { icon: Mail, color: 'text-gray-500', label: 'Delivered' },
  opened: { icon: Eye, color: 'text-amber-500', label: 'Opened' },
  click: { icon: ExternalLink, color: 'text-green-500', label: 'Clicked' },
};

function groupByCampaign(events: LeadCampaignEvent[]) {
  const grouped = new Map<string, { campaignName: string; events: LeadCampaignEvent[] }>();
  for (const event of events) {
    const key = event.campaignId;
    if (!grouped.has(key)) {
      grouped.set(key, { campaignName: event.campaignName, events: [] });
    }
    grouped.get(key)!.events.push(event);
  }
  return grouped;
}

export function CampaignEngagement({ events }: CampaignEngagementProps) {
  // AC#3: Return null when no events
  if (!events || events.length === 0) {
    return null;
  }

  const grouped = groupByCampaign(events);

  return (
    <div className="space-y-4" data-testid="campaign-engagement">
      {Array.from(grouped.entries()).map(([campaignId, group]) => {
        // Sort events chronologically (oldest first)
        const sortedEvents = [...group.events].sort(
          (a, b) => new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime()
        );

        return (
          <div key={campaignId} data-testid="campaign-group">
            {/* Campaign header */}
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">{group.campaignName}</span>
            </div>

            {/* Timeline */}
            <div className="relative ml-2 space-y-2">
              {/* Connecting line */}
              <div
                className="absolute left-4 top-0 bottom-0 w-px bg-border"
                aria-hidden="true"
              />

              {sortedEvents.map((event, index) => {
                const config = EVENT_CONFIG[event.event] ?? {
                  icon: Mail,
                  color: 'text-gray-500',
                  label: event.event,
                };
                const Icon = config.icon;

                return (
                  <div
                    key={`${event.event}-${event.eventAt}-${index}`}
                    className="relative pl-10"
                    data-testid="campaign-event"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-background border-2 border-primary"
                      aria-hidden="true"
                    />

                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} aria-hidden="true" />
                      <span className={config.color}>{config.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatLeadDateTime(event.eventAt)}
                      </span>
                      {event.event === 'click' && event.url && (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs flex items-center gap-0.5"
                          data-testid="campaign-event-url"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
