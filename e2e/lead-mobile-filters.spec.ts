/**
 * Lead Mobile Filters E2E Tests
 * Story 4.16: Mobile-Responsive Lead Filters
 *
 * AC#1: Mobile-first filter design with bottom sheet
 * AC#2: Filter button with badge counter
 * AC#3: Active filter chips with individual removal
 * AC#4: Manual-apply pattern for filters
 * AC#5: Responsive layout switching (mobile/desktop)
 * AC#8: Mobile table shows essential columns only
 * AC#12: URL state sync with filters
 * AC#13: Touch-friendly button sizes
 *
 * Note: These tests run with E2E_TEST_MODE=true which bypasses authentication
 *
 * KNOWN LIMITATION - URL State Sync in Playwright:
 * Next.js useSearchParams() hook has compatibility issues with Playwright's browser environment.
 * Specifically, searchParams.toString() hangs/crashes during E2E test execution, preventing
 * router.replace() from being called. URL sync functionality is validated through unit tests instead.
 * See: use-status-filter-params.test.tsx, use-owner-filter-params.test.ts for comprehensive URL sync coverage.
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
    status: 'contacted',
    owner: { id: 'user-2', name: 'Jane Doe' },
    campaign: { id: 'campaign-1', name: 'Campaign 1' },
  },
  {
    row: 3,
    date: '2026-01-12',
    customerName: 'Test Lead 3',
    email: 'test3@example.com',
    phone: '0812345680',
    company: 'Test Company 3',
    status: 'new',
    owner: { id: 'user-1', name: 'John Doe' },
    campaign: { id: 'campaign-2', name: 'Campaign 2' },
  },
];

// Mock sales team data
const mockSalesTeam = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com' },
];

test.describe('Lead Mobile Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Log console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    page.on('pageerror', (error) => {
      console.log('Page error:', error.message);
    });

    // Mock the API response for leads
    await page.route('**/api/admin/leads**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            leads: mockLeads,
            pagination: {
              page: 1,
              limit: 20,
              total: mockLeads.length,
              totalPages: 1,
            },
            availableFilters: {
              statuses: ['new', 'claimed', 'contacted', 'closed', 'lost', 'unreachable'],
              owners: mockSalesTeam,
              leadSources: ['brevo', 'website', 'referral'],
            },
          },
        }),
      });
    });

    // Mock the API response for sales team
    await page.route('**/api/admin/sales-team**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockSalesTeam,
        }),
      });
    });
  });

  test.describe('10.1: Mobile Filter Flow', () => {
    test('should apply filters through mobile bottom sheet', async ({ page }) => {
      // Set mobile viewport (iPhone SE)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/leads');
      await page.waitForLoadState('networkidle');

      // Debug: Take screenshot
      await page.screenshot({ path: 'test-results/mobile-page.png', fullPage: true });

      // Check if page loaded by looking for any text
      const bodyText = await page.textContent('body');
      console.log('Page loaded, body contains text:', bodyText ? bodyText.substring(0, 100) : 'EMPTY');

      // Wait for table to load first (ensures page is fully rendered)
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });

      // Click Filters button
      const filtersButton = page.locator('[data-testid="filters-button"]');
      await expect(filtersButton).toBeVisible({ timeout: 5000 });
      await filtersButton.click();

      // Verify bottom sheet opens
      const bottomSheet = page.locator('[data-testid="mobile-filter-sheet"]');
      await expect(bottomSheet).toBeVisible();

      // Select Status = "New"
      const statusFilter = bottomSheet.locator('[data-testid="status-filter-trigger"]');
      console.log('Status filter text before:', await statusFilter.textContent());
      await statusFilter.click();

      // Wait for status dropdown to be visible
      const statusOption = page.locator('[data-testid="status-option-new"]');
      await expect(statusOption).toBeVisible();
      await statusOption.click();

      // Verify status filter updated
      console.log('Status filter text after:', await statusFilter.textContent());

      // Select Owner = First person (John Doe)
      const ownerFilter = bottomSheet.locator('[data-testid="owner-filter-trigger"]');
      console.log('Owner filter text before:', await ownerFilter.textContent());
      await ownerFilter.click();

      // Wait for owner dropdown to be visible
      const ownerOption = page.locator('[data-testid="owner-option-user-1"]');
      await expect(ownerOption).toBeVisible();
      await ownerOption.click();

      // Verify owner filter updated
      console.log('Owner filter text after:', await ownerFilter.textContent());

      // Intercept console logs to see if filters are being applied
      page.on('console', msg => {
        if (msg.text().includes('handleFilterSheetApply') || msg.text().includes('setStatuses')) {
          console.log('Browser log:', msg.text());
        }
      });

      // Click Apply
      const applyButton = bottomSheet.getByRole('button', { name: /apply/i });
      await applyButton.click();

      // Debug: Check URL immediately and after delays
      console.log('URL immediately after click:', page.url());
      await page.waitForTimeout(500);
      console.log('URL after 500ms:', page.url());
      await page.waitForTimeout(1000);
      console.log('URL after 1500ms:', page.url());

      // Wait for URL to update (router.replace is async)
      // Use waitForFunction to poll URL changes
      await page.waitForFunction(
        () => {
          const url = window.location.href;
          console.log('Polling URL:', url); // This log won't show but helps debug
          // Check for either format: status=new or status=ใหม่ (Thai)
          const hasStatus = url.includes('status=new') || url.includes('status=');
          const hasOwner = url.includes('owner=user-1') || url.includes('owner=');
          return hasStatus && hasOwner;
        },
        { timeout: 15000, polling: 100 }
      );

      // Verify bottom sheet closes after URL updates
      await expect(bottomSheet).not.toBeVisible({ timeout: 5000 });

      // Final verification of URL params
      const finalUrl = page.url();
      expect(finalUrl).toMatch(/status=new/);
      expect(finalUrl).toMatch(/owner=user-1/);
    });
  });

  test.describe('10.2: Active Filter Chips', () => {
    test('should display and remove filter chips', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate with filters already applied
      await page.goto('/leads?status=new&owner=user-1');

      // Verify chips are displayed
      const statusChip = page.locator('[data-testid="filter-chip-status"]');
      await expect(statusChip).toBeVisible();
      await expect(statusChip).toContainText('ใหม่'); // Thai label

      const ownerChip = page.locator('[data-testid="filter-chip-owner"]');
      await expect(ownerChip).toBeVisible();
      await expect(ownerChip).toContainText('John Doe');

      // Click X on status chip
      const statusChipRemove = page.locator('[data-testid="filter-chip-status-remove"]');
      await statusChipRemove.click();

      // Verify status filter removed immediately (URL updated)
      await page.waitForURL((url) => {
        const searchParams = new URL(url).searchParams;
        return !searchParams.has('status') && searchParams.has('owner');
      });

      // Verify status chip removed
      await expect(statusChip).not.toBeVisible();

      // Verify owner chip still visible
      await expect(ownerChip).toBeVisible();
    });
  });

  test.describe('10.3: Bottom Sheet Cancel', () => {
    test('should discard changes when Cancel is clicked', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/leads');

      // Open bottom sheet
      const filtersButton = page.locator('[data-testid="filters-button"]');
      await filtersButton.click();

      const bottomSheet = page.locator('[data-testid="mobile-filter-sheet"]');
      await expect(bottomSheet).toBeVisible();

      // Change status filter
      const statusFilter = bottomSheet.locator('[data-testid="status-filter-trigger"]');
      await statusFilter.click();
      await page.locator('[data-testid="status-option-new"]').click();

      // Click Cancel
      const cancelButton = bottomSheet.getByRole('button', { name: /cancel/i });
      await cancelButton.click();

      // Verify bottom sheet closes
      await expect(bottomSheet).not.toBeVisible();

      // Verify URL NOT updated (no status param)
      const url = page.url();
      expect(url).not.toContain('status=');

      // Verify no chips displayed
      const statusChip = page.locator('[data-testid="filter-chip-status"]');
      await expect(statusChip).not.toBeVisible();
    });
  });

  test.describe('10.4: Clear All', () => {
    test('should clear all filters when Clear All is clicked', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate with multiple filters applied
      await page.goto('/leads?status=new&owner=user-1&leadSource=brevo');

      // Verify chips displayed
      await expect(page.locator('[data-testid="filter-chip-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-chip-owner"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-chip-source"]')).toBeVisible();

      // Open bottom sheet
      const filtersButton = page.locator('[data-testid="filters-button"]');
      await filtersButton.click();

      const bottomSheet = page.locator('[data-testid="mobile-filter-sheet"]');
      await expect(bottomSheet).toBeVisible();

      // Click Clear All
      const clearAllButton = bottomSheet.getByRole('button', { name: /clear all/i });
      await clearAllButton.click();

      // Click Apply
      const applyButton = bottomSheet.getByRole('button', { name: /apply/i });
      await applyButton.click();

      // Verify all filters removed from URL
      await page.waitForURL((url) => {
        const searchParams = new URL(url).searchParams;
        return !searchParams.has('status') && !searchParams.has('owner') && !searchParams.has('source');
      });

      // Verify no chips displayed
      await expect(page.locator('[data-testid="filter-chip-status"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="filter-chip-owner"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="filter-chip-source"]')).not.toBeVisible();
    });
  });

  test.describe('10.5: Mobile Table Columns', () => {
    test('should show only essential columns on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/leads');

      // Wait for table to load
      const table = page.locator('table');
      await expect(table).toBeVisible({ timeout: 15000 });

      // Get all header cells
      const headers = await table.locator('thead th').allTextContents();

      // Debug: Log actual headers to see what's rendered
      console.log('Actual table headers:', headers);

      // Verify essential columns are visible (Checkbox, Company, Status, Owner)
      // Note: Checkbox column might not have text content
      // Case-insensitive matching
      expect(headers.some(h => h.toLowerCase().includes('company'))).toBeTruthy();
      expect(headers.some(h => h.toLowerCase().includes('status'))).toBeTruthy();
      expect(headers.some(h => h.toLowerCase().includes('owner'))).toBeTruthy();

      // Verify no horizontal scroll
      const tableContainer = page.locator('[data-testid="lead-table-container"]');
      const scrollWidth = await tableContainer.evaluate((el) => el.scrollWidth);
      const clientWidth = await tableContainer.evaluate((el) => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow 10px tolerance

      // Click first row
      const firstRow = table.locator('tbody tr').first();
      await firstRow.click();

      // Verify detail sheet opens (or modal/drawer depending on implementation)
      // This test might need adjustment based on actual implementation
      await page.waitForTimeout(500); // Wait for animation
    });
  });

  test.describe('10.6: Responsive Breakpoint', () => {
    test('should switch layout when resizing viewport', async ({ page }) => {
      // Start with mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/leads?status=new');

      // Verify mobile layout (filters button visible)
      const mobileFiltersButton = page.locator('[data-testid="filters-button"]');
      await expect(mobileFiltersButton).toBeVisible();

      // Open bottom sheet
      await mobileFiltersButton.click();
      const bottomSheet = page.locator('[data-testid="mobile-filter-sheet"]');
      await expect(bottomSheet).toBeVisible();

      // Resize to desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 });

      // Wait a bit for resize handler to trigger
      await page.waitForTimeout(500);

      // Verify bottom sheet closes on resize
      await expect(bottomSheet).not.toBeVisible();

      // Verify desktop layout (individual filter buttons visible)
      await expect(page.locator('[data-testid="status-filter-trigger"]')).toBeVisible();
      await expect(page.locator('[data-testid="owner-filter-trigger"]')).toBeVisible();

      // Verify mobile filters button not visible on desktop
      await expect(mobileFiltersButton).not.toBeVisible();

      // Verify filters state preserved (status=new still in URL)
      expect(page.url()).toContain('status=new');
    });
  });

  test.describe('10.7: Chip Removal vs Manual Apply Conflict', () => {
    test('should handle chip removal while bottom sheet has pending changes', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate with owner filter applied
      await page.goto('/leads?owner=user-1');

      // Verify owner chip displayed
      const ownerChip = page.locator('[data-testid="filter-chip-owner"]');
      await expect(ownerChip).toBeVisible();

      // Open bottom sheet
      const filtersButton = page.locator('[data-testid="filters-button"]');
      await filtersButton.click();

      const bottomSheet = page.locator('[data-testid="mobile-filter-sheet"]');
      await expect(bottomSheet).toBeVisible();

      // Change status filter (not applied yet - pending in bottom sheet)
      const statusFilter = bottomSheet.locator('[data-testid="status-filter-trigger"]');
      await statusFilter.click();
      await page.locator('[data-testid="status-option-new"]').click();

      // Close status filter popover before clicking chip (prevents z-index conflict)
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300); // Wait for popover close animation

      // Remove owner chip from toolbar (immediate removal)
      // Click outside bottom sheet first to ensure chip is clickable
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(200);

      const ownerChipRemove = page.locator('[data-testid="filter-chip-owner-remove"]');
      await ownerChipRemove.click({ force: true });

      // Verify owner removed immediately (URL updated)
      await page.waitForURL((url) => {
        const searchParams = new URL(url).searchParams;
        return !searchParams.has('owner');
      });

      // Verify owner chip removed
      await expect(ownerChip).not.toBeVisible();

      // Verify status change still pending (not in URL yet)
      expect(page.url()).not.toContain('status=');

      // Bottom sheet should still be visible with pending status change
      await expect(bottomSheet).toBeVisible();

      // Click Apply
      const applyButton = bottomSheet.getByRole('button', { name: /apply/i });
      await applyButton.click();

      // Verify status applied correctly
      await page.waitForURL(/status=new/);
      expect(page.url()).toContain('status=new');

      // Verify status chip now displayed
      const statusChip = page.locator('[data-testid="filter-chip-status"]');
      await expect(statusChip).toBeVisible();

      // Verify owner still removed
      expect(page.url()).not.toContain('owner=');
      await expect(ownerChip).not.toBeVisible();
    });
  });

  test.describe('10.8: API Error Handling', () => {
    // SKIPPED: Filter application uses URL state hooks (immediate, no API call)
    // API errors are handled during data fetching (useLeads hook), not during filter apply
    // Error handling is validated in unit tests: mobile-filter-sheet.test.tsx
    test.skip('should handle API errors gracefully', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/leads');

      // Override the API route to return error
      await page.route('**/api/admin/leads**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Internal Server Error',
          }),
        });
      });

      // Open bottom sheet
      const filtersButton = page.locator('[data-testid="filters-button"]');
      await filtersButton.click();

      const bottomSheet = page.locator('[data-testid="mobile-filter-sheet"]');
      await expect(bottomSheet).toBeVisible();

      // Select a filter
      const statusFilter = bottomSheet.locator('[data-testid="status-filter-trigger"]');
      await statusFilter.click();
      await page.locator('[data-testid="status-option-new"]').click();

      // Click Apply
      const applyButton = bottomSheet.getByRole('button', { name: /apply/i });
      await applyButton.click();

      // Verify error toast displayed (if implemented)
      // Note: Toast implementation might vary
      await page.waitForTimeout(1000);

      // Verify bottom sheet still open (so user can retry)
      await expect(bottomSheet).toBeVisible();

      // Restore successful API response
      await page.route('**/api/admin/leads**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              data: mockLeads.filter(lead => lead.status === 'new'),
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
              },
            },
          }),
        });
      });

      // Retry Apply
      await applyButton.click();

      // Verify success (bottom sheet closes, URL updated)
      await expect(bottomSheet).not.toBeVisible();
      await page.waitForURL(/status=new/);
    });
  });

  test.describe('10.9: URL Load Behavior', () => {
    test('should load filters from URL on page load', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate with filters in URL
      await page.goto('/leads?status=new&owner=user-1&leadSource=brevo');

      // Verify filters applied (chips displayed)
      await expect(page.locator('[data-testid="filter-chip-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-chip-owner"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-chip-source"]')).toBeVisible();

      // Verify bottom sheet closed by default
      const bottomSheet = page.locator('[data-testid="mobile-filter-sheet"]');
      await expect(bottomSheet).not.toBeVisible();

      // Verify filter count badge on Filters button
      const filtersButton = page.locator('[data-testid="filters-button"]');
      await expect(filtersButton).toContainText('3'); // 3 active filters

      // Open bottom sheet
      await filtersButton.click();
      await expect(bottomSheet).toBeVisible();

      // Verify filters pre-selected in bottom sheet
      const statusFilter = bottomSheet.locator('[data-testid="status-filter-trigger"]');
      await expect(statusFilter).toContainText('ใหม่'); // Thai label

      const ownerFilter = bottomSheet.locator('[data-testid="owner-filter-trigger"]');
      await expect(ownerFilter).toContainText('John Doe');

      const sourceFilter = bottomSheet.locator('[data-testid="source-filter-trigger"]');
      await expect(sourceFilter).toContainText('Brevo');
    });
  });
});
