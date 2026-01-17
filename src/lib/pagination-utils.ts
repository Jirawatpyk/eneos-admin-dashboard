/**
 * Pagination Utilities
 * Story 4.2: Pagination - AC#1, AC#8
 *
 * Utility functions for pagination logic
 * Handles ellipsis for large page counts and responsive display
 */

/** Page item - either a page number or an ellipsis marker */
export type PageItem = number | 'ellipsis';

/**
 * Calculate which page numbers to display with ellipsis
 *
 * @param currentPage - The currently active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum number of page buttons to show (default: 5)
 * @returns Array of page numbers and 'ellipsis' markers
 *
 * @example
 * getVisiblePages(1, 10, 5) // [1, 2, 3, 'ellipsis', 10]
 * getVisiblePages(5, 10, 5) // [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 * getVisiblePages(10, 10, 5) // [1, 'ellipsis', 8, 9, 10]
 * getVisiblePages(1, 3, 5) // [1, 2, 3] (no ellipsis needed)
 */
export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): PageItem[] {
  // If total pages is less than or equal to max visible, show all
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Edge case: no pages
  if (totalPages <= 0) {
    return [];
  }

  // Ensure currentPage is within bounds
  const page = Math.max(1, Math.min(currentPage, totalPages));

  const pages: PageItem[] = [];
  const halfVisible = Math.floor((maxVisible - 2) / 2); // Subtract 2 for first and last page

  // Always include first page
  pages.push(1);

  // Calculate the range of visible pages around current page
  let start = Math.max(2, page - halfVisible);
  let end = Math.min(totalPages - 1, page + halfVisible);

  // Adjust range if we're near the edges
  if (page <= halfVisible + 2) {
    // Near the start: show more pages at the beginning
    end = Math.min(totalPages - 1, maxVisible - 1);
    start = 2;
  } else if (page >= totalPages - halfVisible - 1) {
    // Near the end: show more pages at the end
    start = Math.max(2, totalPages - maxVisible + 2);
    end = totalPages - 1;
  }

  // Add ellipsis before the range if needed
  if (start > 2) {
    pages.push('ellipsis');
  }

  // Add the visible range
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis after the range if needed
  if (end < totalPages - 1) {
    pages.push('ellipsis');
  }

  // Always include last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Calculate the range of items being displayed
 *
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Object with start and end item numbers
 *
 * @example
 * getDisplayRange(1, 20, 50) // { start: 1, end: 20 }
 * getDisplayRange(2, 20, 50) // { start: 21, end: 40 }
 * getDisplayRange(3, 20, 50) // { start: 41, end: 50 }
 */
export function getDisplayRange(
  page: number,
  limit: number,
  total: number
): { start: number; end: number } {
  if (total === 0) {
    return { start: 0, end: 0 };
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return { start, end };
}
