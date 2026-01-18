/**
 * Lead Types
 * Story 4.1: Lead List Table
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * TypeScript interfaces for lead data from backend API
 * Matches backend response format from EPIC-00 deliverables
 */

import type { LeadDetail } from './lead-detail';

/**
 * Lead Status - Exactly 6 values as defined in project-context.md
 */
export type LeadStatus =
  | 'new'         // ใหม่
  | 'claimed'     // รับแล้ว
  | 'contacted'   // ติดต่อแล้ว
  | 'closed'      // ปิดสำเร็จ
  | 'lost'        // ปิดไม่สำเร็จ
  | 'unreachable'; // ติดต่อไม่ได้

/**
 * Lead entity from backend API
 * Row number = Primary Key (Google Sheets)
 */
export interface Lead {
  /** Row number in Google Sheets - Primary Key */
  row: number;
  /** Created date (ISO string) */
  date: string;
  /** Customer/contact name */
  customerName: string;
  /** Email address */
  email: string;
  /** Phone number (may be formatted) */
  phone: string;
  /** Company name */
  company: string;
  /** AI-analyzed industry (from Gemini) */
  industryAI: string | null;
  /** Company website URL */
  website: string | null;
  /** Company capital/size */
  capital: string | null;
  /** Lead status */
  status: LeadStatus;
  /** LINE User ID of assigned sales */
  salesOwnerId: string | null;
  /** Name of assigned sales person */
  salesOwnerName: string | null;
  /** Campaign ID */
  campaignId: string;
  /** Campaign name */
  campaignName: string;
  /** Email subject from campaign */
  emailSubject: string | null;
  /** Lead source (e.g., Brevo) */
  source: string;
  /** External lead ID */
  leadId: string | null;
  /** Event ID from tracking */
  eventId: string | null;
  /** Timestamp when email was clicked */
  clickedAt: string | null;
  /** AI-generated talking point */
  talkingPoint: string | null;
  /** Timestamp when lead was closed */
  closedAt: string | null;
  /** Timestamp when lead was marked lost */
  lostAt: string | null;
  /** Timestamp when lead was marked unreachable */
  unreachableAt: string | null;
  /** Optimistic locking version */
  version: number;
  /** Alternative lead source field */
  leadSource: string | null;
  /** Contact's job title */
  jobTitle: string | null;
  /** Contact's city */
  city: string | null;
  /** UUID for Supabase migration */
  leadUuid: string | null;
  /** Created timestamp (ISO 8601) */
  createdAt: string;
  /** Updated timestamp (ISO 8601) */
  updatedAt: string | null;
}

/**
 * Pagination info from backend
 */
export interface LeadsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Backend API response for leads list
 */
export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  pagination: LeadsPagination;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Backend API response for single lead (enhanced)
 * Story 4.8: Updated to use LeadDetail with history and metrics
 */
export interface LeadDetailResponse {
  success: boolean;
  data: LeadDetail;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Query parameters for leads API
 * Story 4.4: status changed to array for multi-select filter (AC#3)
 * Story 4.5: owner changed to array for multi-select filter (AC#3)
 * Story 4.6: from/to for date filter (AC#5)
 */
export interface LeadsQueryParams {
  page?: number;
  limit?: number;
  /** Status filter - array for multi-select (AC#3) */
  status?: LeadStatus[];
  /** @deprecated Use owner instead */
  salesOwnerId?: string;
  /** Owner filter - array for multi-select (Story 4.5 AC#3) */
  owner?: string[];
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  /** Date filter - start date YYYY-MM-DD (Story 4.6 AC#5) */
  from?: string;
  /** Date filter - end date YYYY-MM-DD (Story 4.6 AC#5) */
  to?: string;
}
