/**
 * Leads Constants
 * Story 4.1: Lead List Table
 * Story 4.4: Filter by Status - Added LEAD_STATUS_OPTIONS and ALL_LEAD_STATUSES
 *
 * Constants for lead status colors, labels, and options
 * Matches STATUS_COLORS from project-context.md
 */

import type { LeadStatus } from '@/types/lead';

/**
 * All valid lead status values - exactly 6 as per project-context.md
 * Using readonly array for type safety and immutability
 */
export const ALL_LEAD_STATUSES: readonly LeadStatus[] = [
  'new',
  'claimed',
  'contacted',
  'closed',
  'lost',
  'unreachable',
] as const;

/**
 * Status options for filter dropdown (AC#2)
 * value: API value, label: English, labelTh: Thai
 */
export const LEAD_STATUS_OPTIONS: {
  value: LeadStatus;
  label: string;
  labelTh: string;
}[] = [
  { value: 'new', label: 'New', labelTh: 'ใหม่' },
  { value: 'claimed', label: 'Claimed', labelTh: 'รับแล้ว' },
  { value: 'contacted', label: 'Contacted', labelTh: 'ติดต่อแล้ว' },
  { value: 'closed', label: 'Closed', labelTh: 'ปิดสำเร็จ' },
  { value: 'lost', label: 'Lost', labelTh: 'ปิดไม่สำเร็จ' },
  { value: 'unreachable', label: 'Unreachable', labelTh: 'ติดต่อไม่ได้' },
];

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
