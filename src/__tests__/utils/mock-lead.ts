/**
 * Shared Mock Lead Factory
 * Used across multiple test files to create consistent test data.
 *
 * Stories: 4.9, 4.10 (and any test that needs Lead data)
 */
import type { Lead } from '@/types/lead';

/**
 * Create a mock Lead object with optional overrides
 *
 * @param overrides - Partial Lead object to override defaults
 * @returns Complete Lead object with test data
 *
 * @example
 * ```ts
 * const lead = createMockLead({ row: 5, company: 'Custom Corp' });
 * const leads = [createMockLead({ row: 1 }), createMockLead({ row: 2 })];
 * ```
 */
export function createMockLead(overrides: Partial<Lead> = {}): Lead {
  const row = overrides.row ?? 1;

  return {
    row,
    date: '2026-01-15',
    customerName: 'John Smith',
    email: 'john@example.com',
    phone: '0812345678',
    company: 'Test Company',
    industryAI: 'Manufacturing',
    website: 'https://test.com',
    capital: '10M',
    status: 'contacted',
    salesOwnerId: 'user-1',
    salesOwnerName: 'Sales Person',
    campaignId: 'camp-1',
    campaignName: 'Test Campaign',
    emailSubject: 'Test Subject',
    source: 'Brevo',
    leadId: `lead-${row}`,
    eventId: `event-${row}`,
    clickedAt: '2026-01-15T10:00:00Z',
    talkingPoint: 'Test talking point',
    closedAt: null,
    lostAt: null,
    unreachableAt: null,
    version: 1,
    leadSource: 'Brevo',
    jobTitle: 'Manager',
    city: 'Bangkok',
    leadUuid: `lead_${row}`,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: null,
    ...overrides,
  };
}

/**
 * Create an array of mock leads
 *
 * @param count - Number of leads to create
 * @param baseOverrides - Overrides applied to all leads
 * @returns Array of Lead objects
 *
 * @example
 * ```ts
 * const leads = createMockLeads(5);
 * const closedLeads = createMockLeads(3, { status: 'closed' });
 * ```
 */
export function createMockLeads(
  count: number,
  baseOverrides: Partial<Lead> = {}
): Lead[] {
  return Array.from({ length: count }, (_, i) =>
    createMockLead({ row: i + 1, ...baseOverrides })
  );
}
