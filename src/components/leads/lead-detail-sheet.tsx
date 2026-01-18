/**
 * Lead Detail Sheet Component
 * Story 4.1: Lead List Table
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#1: Enhanced Detail Sheet - Fetches full lead details from API
 * AC#2: Status History Section - Timeline of status changes
 * AC#3: Performance Metrics Section - Response time, Closing time, Lead age
 * AC#4: Owner Contact Details - Name, email, phone
 * AC#5: Loading State - Skeleton loaders
 * AC#6: Error Handling - Error message with retry button
 * AC#7: Campaign Details - Campaign name, ID, subject
 * AC#8: Keyboard & Accessibility - Escape closes, proper headings
 */
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Phone,
  Building2,
  Globe,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  User,
  MessageSquare,
  ExternalLink,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatThaiPhone, formatLeadDateTime } from '@/lib/format-lead';
import { LeadStatusBadge } from './lead-status-badge';
import { StatusHistory } from './status-history';
import { LeadMetrics } from './lead-metrics';
import { LeadDetailSkeleton } from './lead-detail-skeleton';
import { LeadDetailError } from './lead-detail-error';
import { useLead } from '@/hooks/use-lead';
import type { Lead } from '@/types/lead';

interface LeadDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

interface DetailItemProps {
  label: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}

function DetailItem({ label, value, icon, className }: DetailItemProps) {
  if (!value || value === '-') return null;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="p-2 rounded-lg bg-muted shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

export function LeadDetailSheet({ open, onOpenChange, lead }: LeadDetailSheetProps) {
  // AC#1: Fetch full details when sheet opens
  const {
    data: leadDetail,
    isLoading,
    isError,
    refetch,
  } = useLead(lead?.row, { enabled: open && !!lead?.row });

  // Always render Sheet to maintain proper state management
  if (!lead) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="w-full sm:max-w-lg"
          data-testid="lead-detail-sheet"
        >
          <SheetHeader>
            <SheetTitle>No Lead Selected</SheetTitle>
            <SheetDescription>Select a lead from the table to view details</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto"
        data-testid="lead-detail-sheet"
      >
        {/* Header with basic info (immediate display from table data) - AC#5 */}
        <SheetHeader className="pb-4 border-b">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <SheetTitle className="text-xl">{lead.company}</SheetTitle>
              <LeadStatusBadge status={lead.status} />
            </div>
            <SheetDescription className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" aria-hidden="true" />
              {lead.customerName}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* AC#5: Loading state for detail data */}
          {isLoading && <LeadDetailSkeleton />}

          {/* AC#6: Error state with retry - but still show basic info (graceful degradation) */}
          {isError && <LeadDetailError onRetry={refetch} />}

          {/* AC#3: Performance Metrics Section (only when detail loaded) */}
          {leadDetail && leadDetail.metrics && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" aria-hidden="true" />
                Performance Metrics
              </h3>
              <LeadMetrics metrics={leadDetail.metrics} />
            </section>
          )}

          {/* AC#2: Status History Section (only when detail loaded) */}
          {leadDetail && leadDetail.history && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Status History
              </h3>
              <StatusHistory history={leadDetail.history} />
            </section>
          )}

          {/* Contact Information - AC#6: Shows basic info from table even on error */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Contact Information
            </h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <DetailItem
                  label="Email"
                  icon={<Mail className="h-4 w-4 text-blue-500" />}
                  value={
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:underline"
                      aria-label={`Send email to ${lead.email}`}
                    >
                      {lead.email}
                    </a>
                  }
                />
                <DetailItem
                  label="Phone"
                  icon={<Phone className="h-4 w-4 text-green-500" />}
                  value={formatThaiPhone(lead.phone)}
                />
                {lead.jobTitle && (
                  <DetailItem
                    label="Job Title"
                    icon={<Briefcase className="h-4 w-4 text-purple-500" />}
                    value={lead.jobTitle}
                  />
                )}
                {lead.city && (
                  <DetailItem
                    label="City"
                    icon={<MapPin className="h-4 w-4 text-red-500" />}
                    value={lead.city}
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* Company Information */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Company Information
            </h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <DetailItem
                  label="Company"
                  icon={<Building2 className="h-4 w-4 text-blue-500" />}
                  value={lead.company}
                />
                {/* Use detail data if available, fallback to table data */}
                {(leadDetail?.industry || lead.industryAI) && (
                  <DetailItem
                    label="Industry (AI)"
                    icon={<Briefcase className="h-4 w-4 text-amber-500" />}
                    value={
                      <Badge variant="outline">{leadDetail?.industry || lead.industryAI}</Badge>
                    }
                  />
                )}
                {(leadDetail?.website || lead.website) && (
                  <DetailItem
                    label="Website"
                    icon={<Globe className="h-4 w-4 text-green-500" />}
                    value={
                      <a
                        href={(leadDetail?.website || lead.website || '').startsWith('http')
                          ? (leadDetail?.website || lead.website || '')
                          : `https://${leadDetail?.website || lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        aria-label={`Visit website ${leadDetail?.website || lead.website}`}
                      >
                        {leadDetail?.website || lead.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    }
                  />
                )}
                {(leadDetail?.capital || lead.capital) && (
                  <DetailItem
                    label="Capital"
                    icon={<Building2 className="h-4 w-4 text-gray-500" />}
                    value={leadDetail?.capital || lead.capital}
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* AC#4: Sales Information with owner contact details */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4" aria-hidden="true" />
              Sales Information
            </h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <DetailItem
                  label="Sales Owner"
                  icon={<User className="h-4 w-4 text-blue-500" />}
                  value={leadDetail?.owner?.name || lead.salesOwnerName || 'Unassigned'}
                />
                {/* AC#4: Owner email (clickable mailto:) */}
                {leadDetail?.owner?.email && (
                  <DetailItem
                    label="Owner Email"
                    icon={<Mail className="h-4 w-4 text-blue-500" />}
                    value={
                      <a
                        href={`mailto:${leadDetail.owner.email}`}
                        className="text-blue-600 hover:underline"
                        aria-label={`Send email to owner ${leadDetail.owner.email}`}
                      >
                        {leadDetail.owner.email}
                      </a>
                    }
                  />
                )}
                {/* AC#4: Owner phone in Thai format */}
                {leadDetail?.owner?.phone && (
                  <DetailItem
                    label="Owner Phone"
                    icon={<Phone className="h-4 w-4 text-green-500" />}
                    value={formatThaiPhone(leadDetail.owner.phone)}
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* AC#7: Campaign Details Section */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Campaign Information
            </h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <DetailItem
                  label="Campaign Name"
                  icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
                  value={leadDetail?.campaign?.name || lead.campaignName}
                />
                {(leadDetail?.campaign?.id || lead.campaignId) && (
                  <DetailItem
                    label="Campaign ID"
                    icon={<MessageSquare className="h-4 w-4 text-gray-500" />}
                    value={leadDetail?.campaign?.id || lead.campaignId}
                  />
                )}
                {/* AC#7: Email Subject */}
                {(leadDetail?.campaign?.subject || lead.emailSubject) && (
                  <DetailItem
                    label="Email Subject"
                    icon={<Mail className="h-4 w-4 text-amber-500" />}
                    value={leadDetail?.campaign?.subject || lead.emailSubject}
                  />
                )}
                {lead.source && (
                  <DetailItem
                    label="Source"
                    icon={<Globe className="h-4 w-4 text-gray-500" />}
                    value={lead.source}
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* Talking Point */}
          {(leadDetail?.talkingPoint || lead.talkingPoint) && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Talking Point (AI)
              </h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">
                    {leadDetail?.talkingPoint || lead.talkingPoint}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Timeline - Basic timestamps from table data (graceful degradation) */}
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

          {/* Technical Info (collapsed by default) */}
          <section className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Technical Information
            </h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Row ID: {lead.row}</p>
              {(leadDetail?.leadUuid || lead.leadUuid) && (
                <p>UUID: {leadDetail?.leadUuid || lead.leadUuid}</p>
              )}
              {(leadDetail?.leadId || lead.leadId) && (
                <p>Lead ID: {leadDetail?.leadId || lead.leadId}</p>
              )}
              {(leadDetail?.eventId || lead.eventId) && (
                <p>Event ID: {leadDetail?.eventId || lead.eventId}</p>
              )}
              <p>Version: {leadDetail?.version || lead.version}</p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
