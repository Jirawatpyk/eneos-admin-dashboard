/**
 * Leads Constants
 * Story 4.1: Lead List Table
 *
 * Constants for lead status colors and labels
 * Matches STATUS_COLORS from project-context.md
 */

import type { LeadStatus } from '@/types/lead';

/**
 * Status badge colors matching project-context.md
 */
export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-gray-100 text-gray-800',
  claimed: 'bg-blue-100 text-blue-800',
  contacted: 'bg-amber-100 text-amber-800',
  closed: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
  unreachable: 'bg-gray-100 text-gray-500',
} as const;

/**
 * Status labels in Thai
 */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'ใหม่',
  claimed: 'รับแล้ว',
  contacted: 'ติดต่อแล้ว',
  closed: 'ปิดสำเร็จ',
  lost: 'ปิดไม่สำเร็จ',
  unreachable: 'ติดต่อไม่ได้',
} as const;

/**
 * Column tooltips for table headers
 */
export const LEAD_COLUMN_TOOLTIPS: Record<string, string> = {
  company: 'Company name with industry badge from AI analysis',
  customerName: 'Contact person name',
  email: 'Contact email address (click to send email)',
  phone: 'Contact phone number in Thai format',
  status: 'Current lead status in the sales pipeline',
  salesOwnerName: 'Assigned sales team member',
  campaignName: 'Marketing campaign that generated this lead',
  createdAt: 'Date and time when the lead was created',
} as const;
