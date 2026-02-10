/**
 * Lead Detail Types
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * Extended types for detailed lead view with history and metrics
 */

import type { LeadStatus } from './lead';

/** Campaign event for lead detail timeline (Story 9-5) */
export interface LeadCampaignEvent {
  campaignId: string;
  campaignName: string;
  event: string;         // 'delivered' | 'opened' | 'click'
  eventAt: string;       // ISO 8601
  url: string | null;    // URL for click events
}

/** Unified timeline entry (Story 9-5) */
export interface TimelineEntry {
  type: 'campaign_event' | 'status_change';
  timestamp: string;     // ISO 8601
  event?: string;
  campaignName?: string;
  url?: string | null;
  status?: LeadStatus;
  changedBy?: string;
}

/**
 * Status history entry for lead timeline
 * AC#2: Status History Section
 */
export interface StatusHistoryItem {
  /** Status value */
  status: LeadStatus;
  /** Name of user who made the change */
  by: string;
  /** ISO 8601 timestamp */
  timestamp: string;
}

/**
 * Performance metrics for lead
 * AC#3: Performance Metrics Section
 * All time values are in MINUTES
 */
export interface LeadMetrics {
  /** Response time in minutes (new → claimed) */
  responseTime: number;
  /** Closing time in minutes (claimed → closed) */
  closingTime: number;
  /** Lead age in minutes since creation */
  age: number;
}

/**
 * Owner information with contact details
 * AC#4: Owner Contact Details
 */
export interface LeadDetailOwner {
  /** LINE User ID */
  id: string;
  /** Sales person name */
  name: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
}

/**
 * Campaign information for lead
 * AC#7: Campaign Details
 */
export interface LeadDetailCampaign {
  /** Campaign ID */
  id: string;
  /** Campaign name */
  name: string;
  /** Email subject */
  subject: string;
}

/**
 * Full lead detail from /api/admin/leads/:id
 * Extends basic Lead with history, metrics, and enriched owner/campaign data
 */
export interface LeadDetail {
  /** @deprecated Legacy row number — always 0 in Supabase era */
  row: number;
  /** Supabase UUID — primary identifier for API calls */
  leadUuid: string;
  /** Created date (ISO string) */
  date: string;
  /** Customer/contact name */
  customerName: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Company name */
  company: string;
  /** AI-analyzed industry */
  industry: string;
  /** Company website URL */
  website: string | null;
  /** Company capital/size */
  capital: string | null;
  /** Lead status */
  status: LeadStatus;
  /** Owner details with contact info (null if unassigned) */
  owner: LeadDetailOwner | null;
  /** Campaign information */
  campaign: LeadDetailCampaign;
  /** Lead source */
  source: string;
  /** External lead ID */
  leadId: string;
  /** Event ID from tracking */
  eventId: string;
  /** AI-generated talking point */
  talkingPoint: string | null;
  /** Status change history (AC#2) */
  history: StatusHistoryItem[];
  /** Performance metrics (AC#3) */
  metrics: LeadMetrics;
  /** Contact's job title */
  jobTitle?: string;
  /** Contact's city */
  city?: string;
  /** Optimistic locking version */
  version?: number;
  // Google Search Grounding fields (added 2026-01-26)
  /** Juristic ID - เลขทะเบียนนิติบุคคล 13 หลัก */
  juristicId?: string | null;
  /** DBD Sector code (e.g., "F&B-M", "MFG-A") */
  dbdSector?: string | null;
  /** Province - จังหวัด */
  province?: string | null;
  /** Full address - ที่อยู่เต็มของบริษัท */
  fullAddress?: string | null;
  /** Campaign engagement events (Story 9-5) */
  campaignEvents: LeadCampaignEvent[];
  /** Unified timeline of campaign events and status changes (Story 9-5) */
  timeline: TimelineEntry[];
}
