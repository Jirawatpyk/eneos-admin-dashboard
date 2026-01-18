/**
 * Lead Detail Types
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * Extended types for detailed lead view with history and metrics
 */

import type { LeadStatus } from './lead';

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
  /** Row number in Google Sheets - Primary Key */
  row: number;
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
  website: string;
  /** Company capital/size */
  capital: string;
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
  talkingPoint: string;
  /** Status change history (AC#2) */
  history: StatusHistoryItem[];
  /** Performance metrics (AC#3) */
  metrics: LeadMetrics;
  /** Contact's job title */
  jobTitle?: string;
  /** Contact's city */
  city?: string;
  /** UUID for Supabase migration */
  leadUuid?: string;
  /** Optimistic locking version */
  version?: number;
}
