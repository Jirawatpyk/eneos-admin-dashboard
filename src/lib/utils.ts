import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe date formatter — returns formatted string or fallback on invalid date.
 * Uses fixed Bangkok timezone to prevent SSR/Client hydration mismatch.
 */
export function formatDateSafe(
  dateStr: string | null | undefined,
  fallback: string = '-'
): string {
  if (!dateStr) return fallback;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  }).format(date);
}

/**
 * Mask LINE User ID for display (Story 7-4, 7-4b)
 * Shows first 4 chars + ... + last 4 chars for privacy
 * @param lineUserId - The LINE User ID to mask
 * @returns Masked string like "Uabc...xyz" or original if too short
 */
export function maskLineUserId(lineUserId: string): string {
  if (!lineUserId || lineUserId.length <= 8) return lineUserId;
  return `${lineUserId.slice(0, 4)}...${lineUserId.slice(-4)}`;
}
