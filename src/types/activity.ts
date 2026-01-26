/**
 * Activity Log Types (Story 7-7)
 * TypeScript interfaces for activity log data from backend API
 */

import type { LeadStatus, Lead } from './lead';

/**
 * Activity Log Entry from backend
 * Combines Status_History with full Lead data for detail modal
 */
export interface ActivityEntry {
  /** Unique ID (leadUUID + timestamp) */
  id: string;
  /** Lead UUID */
  leadUUID: string;
  /** Row number in Leads sheet - for Lead Detail Modal */
  rowNumber: number;
  /** Company name from Leads sheet */
  companyName: string;
  /** Status after change */
  status: LeadStatus;
  /** LINE User ID of person who made change, or "System" */
  changedById: string;
  /** Name of person who made change */
  changedByName: string;
  /** Timestamp of change (ISO 8601) */
  timestamp: string;
  /** Optional notes */
  notes: string | null;
  /** Full lead data for detail modal (includes grounding fields) */
  lead: Lead;
}

/**
 * Changed By Option for filter dropdown
 */
export interface ChangedByOption {
  id: string;
  name: string;
}

/**
 * Pagination info from backend
 */
export interface ActivityPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Backend API response for activity log
 */
export interface ActivityLogResponse {
  success: boolean;
  data: {
    entries: ActivityEntry[];
    pagination: ActivityPagination;
    filters: {
      changedByOptions: ChangedByOption[];
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Query parameters for activity log API
 */
export interface ActivityLogQueryParams {
  page?: number;
  limit?: number;
  /** Start date filter (ISO date) */
  from?: string;
  /** End date filter (ISO date) */
  to?: string;
  /** Status filter - comma-separated values */
  status?: string;
  /** Changed by filter - LINE User ID or "System" */
  changedBy?: string;
}
