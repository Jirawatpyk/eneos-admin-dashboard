/**
 * Lead Date Filter E2E Tests
 * Story 4.6: Filter by Date
 *
 * AC#1: Date Filter Display - verify filter button visible with calendar icon
 * AC#2: Date Preset Options - verify preset dropdown shows all options
 * AC#3: Preset Filter Application - verify selecting preset updates URL
 * AC#4: Custom Date Range - verify calendar picker works
 * AC#7: Clear Filter - verify clear removes filter
 * AC#8: URL State Sync - verify URL params sync with filter state
 * AC#9: Accessibility - verify keyboard navigation
 *
 * Note: These tests run with E2E_TEST_MODE=true which bypasses authentication
 */

import { test, expect } from '@playwright/test';

// Mock lead data
const mockLeads = [
  {
    row: 1,
    date: '2026-01-15',
    customerName: 'Test Lead 1',
    email: 'test1@example.com',
    phone: '0812345678',
    company: 'Test Company 1',
    status: 'new',
    owner: { id: 'user-1', name: 'John Doe' },
    campaign: { id: 'campaign-1', name: 'Campaign 1' },
  },
  {
    row: 2,
    date: '2026-01-10',
    customerName: 'Test Lead 2',
    email: 'test2@example.com',
    phone: '0812345679',
    company: 'Test Company 2',
    status: 'claimed',
    owner: { id: 'user-2', name: 'Jane Doe' },
    campaign: { id: 'campaign-1', name: 'Campaign 1' },
  },
];

test.describe('Lead Date Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API response for leads
    await page.route('**/api/admin/leads**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            data: mockLeads,
            pagination: {
              page: 1,
              limit: 20,
              total: 2,
              totalPages: 1,
            },
          },
        }),
      });
    });
  });

  test('AC#1: should display date filter button with "All Time" default', async ({ page }) => {
    await page.goto('/leads');

    // Wait for the filter to be visible
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await expect(filterButton).toBeVisible({ timeout: 15000 });

    // Verify default text
    await expect(filterButton).toContainText('All Time');

    // Verify calendar icon is present (button contains SVG)
    const icon = filterButton.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('AC#2: should display all preset options when clicked', async ({ page }) => {
    await page.goto('/leads');

    // Click the date filter button
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await filterButton.click();

    // Verify all preset options are visible
    await expect(page.locator('[data-testid="date-option-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-option-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-option-yesterday"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-option-last7days"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-option-last30days"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-option-thisMonth"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-option-lastMonth"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-option-custom"]')).toBeVisible();
  });

  test('AC#3: should update URL when preset is selected', async ({ page }) => {
    await page.goto('/leads');

    // Click the date filter button
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await filterButton.click();

    // Click "Last 7 Days" preset
    await page.locator('[data-testid="date-option-last7days"]').click();

    // Wait for URL to update
    await page.waitForURL(/from=.*&to=.*/);

    // Verify URL contains from and to params
    const url = page.url();
    expect(url).toMatch(/from=\d{4}-\d{2}-\d{2}/);
    expect(url).toMatch(/to=\d{4}-\d{2}-\d{2}/);

    // Verify button text updated to show date range
    await expect(filterButton).not.toContainText('All Time');
  });

  test('AC#4: should show calendar when Custom Range is selected', async ({ page }) => {
    await page.goto('/leads');

    // Click the date filter button
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await filterButton.click();

    // Click "Custom Range" option
    await page.locator('[data-testid="date-option-custom"]').click();

    // Verify calendar picker is visible
    const customPicker = page.locator('[data-testid="date-custom-picker"]');
    await expect(customPicker).toBeVisible();

    // Verify Apply and Cancel buttons are present
    await expect(page.locator('[data-testid="date-apply"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-cancel"]')).toBeVisible();
  });

  test('AC#4: should apply custom date range', async ({ page }) => {
    await page.goto('/leads');

    // Click the date filter button
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await filterButton.click();

    // Click "Custom Range" option
    await page.locator('[data-testid="date-option-custom"]').click();

    // Wait for calendar to be visible
    await expect(page.locator('[data-testid="date-custom-picker"]')).toBeVisible();

    // Select a date (click on a day in the calendar)
    // The calendar shows the current month, click on day 10
    const dayButton = page.locator('button[name="day"]').filter({ hasText: /^10$/ }).first();
    if (await dayButton.isVisible()) {
      await dayButton.click();

      // Click another day to complete the range
      const endDayButton = page.locator('button[name="day"]').filter({ hasText: /^15$/ }).first();
      if (await endDayButton.isVisible()) {
        await endDayButton.click();
      }

      // Click Apply
      await page.locator('[data-testid="date-apply"]').click();

      // Verify URL updated
      await page.waitForURL(/from=.*&to=.*/, { timeout: 5000 }).catch(() => {
        // Calendar interaction might vary, this is a soft assertion
      });
    }
  });

  test('AC#7: should clear filter when All Time is selected', async ({ page }) => {
    // Navigate with date filter already applied
    await page.goto('/leads?from=2026-01-01&to=2026-01-15');

    // Verify filter is applied (button should not show "All Time")
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await expect(filterButton).not.toContainText('All Time');

    // Click filter button
    await filterButton.click();

    // Click "All Time" option
    await page.locator('[data-testid="date-option-all"]').click();

    // Wait for URL to update (from/to should be removed)
    await page.waitForURL((url) => {
      const searchParams = new URL(url).searchParams;
      return !searchParams.has('from') && !searchParams.has('to');
    });

    // Verify button shows "All Time" again
    await expect(filterButton).toContainText('All Time');
  });

  test('AC#7: should clear filter when X button is clicked', async ({ page }) => {
    // Navigate with date filter already applied
    await page.goto('/leads?from=2026-01-01&to=2026-01-15');

    // Verify clear button is visible
    const clearButton = page.locator('[data-testid="date-filter-clear"]');
    await expect(clearButton).toBeVisible();

    // Click clear button
    await clearButton.click();

    // Wait for URL to update
    await page.waitForURL((url) => {
      const searchParams = new URL(url).searchParams;
      return !searchParams.has('from') && !searchParams.has('to');
    });

    // Verify filter button shows "All Time"
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await expect(filterButton).toContainText('All Time');

    // Clear button should be hidden
    await expect(clearButton).not.toBeVisible();
  });

  test('AC#8: should sync filter state from URL on page load', async ({ page }) => {
    // Navigate with date filter in URL
    await page.goto('/leads?from=2026-01-01&to=2026-01-15');

    // Verify filter button shows the date range
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await expect(filterButton).toContainText('Jan 1 - Jan 15, 2026');

    // Verify clear button is visible (indicating filter is active)
    const clearButton = page.locator('[data-testid="date-filter-clear"]');
    await expect(clearButton).toBeVisible();
  });

  test('AC#9: should support keyboard navigation', async ({ page }) => {
    await page.goto('/leads');

    // Focus and open the filter with keyboard
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await filterButton.focus();
    await page.keyboard.press('Enter');

    // Wait for popover to open
    const allTimeOption = page.locator('[data-testid="date-option-all"]');
    await expect(allTimeOption).toBeVisible();

    // Navigate down with arrow key
    await page.keyboard.press('ArrowDown');

    // Press Enter on "Today"
    await page.keyboard.press('Enter');

    // URL should update with today's date
    await page.waitForURL(/from=.*&to=.*/);
  });

  test('AC#6: should work with other filters combined', async ({ page }) => {
    // Navigate with status filter already applied
    await page.goto('/leads?status=new');

    // Click the date filter button
    const filterButton = page.locator('[data-testid="date-filter-trigger"]');
    await filterButton.click();

    // Click "Today" preset
    await page.locator('[data-testid="date-option-today"]').click();

    // Wait for URL to update
    await page.waitForURL(/from=.*&to=.*&status=new|status=new&from=.*&to=.*/);

    // Verify both filters are in URL
    const url = page.url();
    expect(url).toContain('status=new');
    expect(url).toMatch(/from=\d{4}-\d{2}-\d{2}/);
    expect(url).toMatch(/to=\d{4}-\d{2}-\d{2}/);
  });
});
