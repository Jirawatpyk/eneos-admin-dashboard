import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { formatLeadDateTime } from '@/lib/format-lead';
import type { Lead } from '@/types/lead';

interface LeadTimelineProps {
  lead: Lead;
}

export function LeadTimeline({ lead }: LeadTimelineProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4" aria-hidden="true" />
        Timeline
      </h3>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{formatLeadDateTime(lead.createdAt)}</span>
          </div>
          {lead.clickedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
              <span className="text-muted-foreground">Clicked:</span>
              <span className="font-medium">{formatLeadDateTime(lead.clickedAt)}</span>
            </div>
          )}
          {lead.closedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-muted-foreground">Closed:</span>
              <span className="font-medium">{formatLeadDateTime(lead.closedAt)}</span>
            </div>
          )}
          {lead.lostAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-red-500" aria-hidden="true" />
              <span className="text-muted-foreground">Lost:</span>
              <span className="font-medium">{formatLeadDateTime(lead.lostAt)}</span>
            </div>
          )}
          {lead.unreachableAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" aria-hidden="true" />
              <span className="text-muted-foreground">Unreachable:</span>
              <span className="font-medium">{formatLeadDateTime(lead.unreachableAt)}</span>
            </div>
          )}
          {lead.updatedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Updated:</span>
              <span className="font-medium">{formatLeadDateTime(lead.updatedAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
