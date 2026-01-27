import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
