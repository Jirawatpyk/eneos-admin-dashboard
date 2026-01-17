/**
 * Lead Detail Sheet Component
 * Story 4.1: Lead List Table
 *
 * AC#5: Row Click Navigation
 * - Detail Sheet/Dialog panel shows full lead information
 * - Shows all lead fields including: Company, Contact, Industry_AI, Website, Talking_Point, Timeline
 * - Can be closed with X button or Escape key
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatThaiPhone, formatLeadDateTime } from '@/lib/format-lead';
import { LeadStatusBadge } from './lead-status-badge';
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
      <div className="p-2 rounded-lg bg-muted shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

export function LeadDetailSheet({ open, onOpenChange, lead }: LeadDetailSheetProps) {
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
          {/* Contact Information */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" />
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
              <Building2 className="h-4 w-4" />
              Company Information
            </h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <DetailItem
                  label="Company"
                  icon={<Building2 className="h-4 w-4 text-blue-500" />}
                  value={lead.company}
                />
                {lead.industryAI && (
                  <DetailItem
                    label="Industry (AI)"
                    icon={<Briefcase className="h-4 w-4 text-amber-500" />}
                    value={
                      <Badge variant="outline">{lead.industryAI}</Badge>
                    }
                  />
                )}
                {lead.website && (
                  <DetailItem
                    label="Website"
                    icon={<Globe className="h-4 w-4 text-green-500" />}
                    value={
                      <a
                        href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {lead.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    }
                  />
                )}
                {lead.capital && (
                  <DetailItem
                    label="Capital"
                    icon={<Building2 className="h-4 w-4 text-gray-500" />}
                    value={lead.capital}
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* Sales Information */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Sales Information
            </h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <DetailItem
                  label="Sales Owner"
                  icon={<User className="h-4 w-4 text-blue-500" />}
                  value={lead.salesOwnerName || 'Unassigned'}
                />
                <DetailItem
                  label="Campaign"
                  icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
                  value={lead.campaignName}
                />
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
          {lead.talkingPoint && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Talking Point (AI)
              </h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{lead.talkingPoint}</p>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatLeadDateTime(lead.createdAt)}</span>
                </div>
                {lead.clickedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Clicked:</span>
                    <span className="font-medium">{formatLeadDateTime(lead.clickedAt)}</span>
                  </div>
                )}
                {lead.closedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Closed:</span>
                    <span className="font-medium">{formatLeadDateTime(lead.closedAt)}</span>
                  </div>
                )}
                {lead.lostAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="text-muted-foreground">Lost:</span>
                    <span className="font-medium">{formatLeadDateTime(lead.lostAt)}</span>
                  </div>
                )}
                {lead.unreachableAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-muted-foreground">Unreachable:</span>
                    <span className="font-medium">{formatLeadDateTime(lead.unreachableAt)}</span>
                  </div>
                )}
                {lead.updatedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
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
              {lead.leadUuid && <p>UUID: {lead.leadUuid}</p>}
              {lead.leadId && <p>Lead ID: {lead.leadId}</p>}
              {lead.eventId && <p>Event ID: {lead.eventId}</p>}
              <p>Version: {lead.version}</p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
