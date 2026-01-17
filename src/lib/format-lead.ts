/**
 * Lead Formatting Utilities
 * Story 4.1: Lead List Table
 *
 * Utilities for formatting lead data for display
 */

import { format } from 'date-fns';

/**
 * Format Thai phone number
 * Converts 0812345678 to 081-234-5678
 * @param phone - Phone number string or null
 * @returns Formatted phone number or '-' if empty
 */
export function formatThaiPhone(phone: string | null): string {
  if (!phone || phone.trim() === '') return '-';

  // Remove non-digits
  const digits = phone.replace(/\D/g, '');

  // Format as XXX-XXX-XXXX for Thai numbers (10 digits)
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Format as XX-XXX-XXXX for Thai landline (9 digits)
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }

  // Return original if not standard format
  return phone;
}

/**
 * Format date as "DD MMM YYYY" (e.g., "15 Jan 2026")
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatLeadDate(dateString: string | null): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Format datetime as "DD MMM YYYY HH:mm" (e.g., "15 Jan 2026 14:30")
 * @param dateString - ISO date string
 * @returns Formatted datetime string
 */
export function formatLeadDateTime(dateString: string | null): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy HH:mm');
  } catch {
    return dateString;
  }
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
