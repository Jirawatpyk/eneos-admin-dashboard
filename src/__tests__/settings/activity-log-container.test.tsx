/**
 * ActivityLogContainer Component Tests
 * Story 7.7: Activity Log Page
 *
 * Tests for activity log container including createdAt fallback logic
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityLogContainer } from '@/components/settings/activity-log-container';
import * as useActivityLogHook from '@/hooks/use-activity-log';
import type { ActivityEntry } from '@/types/activity';
import type { Lead } from '@/types/lead';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
    toString: vi.fn(() => ''),
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  usePathname: vi.fn(() => '/settings/activity-log'),
}));

// Mock use-activity-log hook
vi.mock('@/hooks/use-activity-log');

// Mock LeadDetailSheet
vi.mock('@/components/leads/lead-detail-sheet', () => ({
  LeadDetailSheet: ({ open, lead }: { open: boolean; lead: Lead | null }) => {
    if (!open || !lead) return null;
    return (
      <div data-testid="lead-detail-sheet">
        <div data-testid="lead-created-at">{lead.createdAt}</div>
      </div>
    );
  },
}));

// Mock ActivityLogFilters
vi.mock('@/components/settings/activity-log-filters', () => ({
  ActivityLogFilters: () => <div data-testid="activity-log-filters">Filters</div>,
}));

// Mock ActivityLogTable
vi.mock('@/components/settings/activity-log-table', () => ({
  ActivityLogTable: ({ entries, onRowClick }: { entries: ActivityEntry[]; onRowClick: (rowNumber: number) => void }) => (
    <div data-testid="activity-log-table">
      {entries.map((entry: ActivityEntry) => (
        <div
          key={entry.id}
          data-testid={`activity-row-${entry.id}`}
          onClick={() => onRowClick(entry.rowNumber)}
          style={{ cursor: 'pointer' }}
        >
          {entry.companyName}
        </div>
      ))}
    </div>
  ),
}));

// Mock LeadPagination
vi.mock('@/components/leads/lead-pagination', () => ({
  LeadPagination: () => <div data-testid="lead-pagination">Pagination</div>,
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const mockLead: Lead = {
  row: 5,
  date: '2026-01-15',
  customerName: 'John Doe',
  email: 'john@acme.com',
  phone: '0812345678',
  company: 'ACME Corporation',
  industryAI: 'Manufacturing',
  website: 'https://acme.com',
  capital: '5,000,000',
  status: 'contacted',
  salesOwnerId: 'U1234567890abcdef',
  salesOwnerName: 'John Sales',
  campaignId: 'campaign_001',
  campaignName: 'Campaign Q1',
  emailSubject: 'ENEOS Premium Oils',
  source: 'brevo',
  leadId: 'lead_001',
  eventId: 'evt_001',
  clickedAt: '2026-01-15T09:00:00Z',
  talkingPoint: 'ENEOS has premium lubricants',
  closedAt: null,
  lostAt: null,
  unreachableAt: null,
  version: 1,
  leadSource: 'email',
  jobTitle: 'Manager',
  city: 'Bangkok',
  leadUuid: 'lead_abc123',
  createdAt: '2026-01-15T09:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
  juristicId: '0123456789012',
  dbdSector: 'MFG-A',
  province: 'กรุงเทพมหานคร',
  fullAddress: '123 Main St, Bangkok 10500',
};

describe('ActivityLogContainer - createdAt Fallback Logic', () => {
  const mockUseActivityLog = vi.mocked(useActivityLogHook.useActivityLog);

  beforeEach(() => {
    cleanup();
    mockUseActivityLog.mockReset();
  });

  it('should use lead.createdAt when available', async () => {
    const mockEntry: ActivityEntry = {
      id: 'lead_abc123_2026-01-15T10:00:00Z',
      leadUUID: 'lead_abc123',
      rowNumber: 5,
      companyName: 'ACME Corporation',
      status: 'contacted',
      changedById: 'U1234567890abcdef',
      changedByName: 'John Sales',
      timestamp: '2026-01-15T10:00:00Z',
      notes: 'Called customer',
      lead: mockLead,
    };

    mockUseActivityLog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: { changedByOptions: [] },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <ActivityLogContainer />
      </TestWrapper>
    );

    // Click row to open modal
    const row = await screen.findByTestId('activity-row-lead_abc123_2026-01-15T10:00:00Z');
    fireEvent.click(row);

    // Verify modal opens with correct createdAt
    await waitFor(() => {
      const createdAtElement = screen.getByTestId('lead-created-at');
      expect(createdAtElement).toHaveTextContent('2026-01-15T09:00:00Z');
    });
  });

  it('should fallback to timestamp when lead.createdAt is null', async () => {
    const mockEntry: ActivityEntry = {
      id: 'lead_abc123_2026-01-15T10:00:00Z',
      leadUUID: 'lead_abc123',
      rowNumber: 5,
      companyName: 'ACME Corporation',
      status: 'contacted',
      changedById: 'U1234567890abcdef',
      changedByName: 'John Sales',
      timestamp: '2026-01-15T10:00:00Z',
      notes: 'Called customer',
      lead: {
        ...mockLead,
        createdAt: null, // Legacy lead with null createdAt
      },
    };

    mockUseActivityLog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: { changedByOptions: [] },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <ActivityLogContainer />
      </TestWrapper>
    );

    // Click row to open modal
    const row = await screen.findByTestId('activity-row-lead_abc123_2026-01-15T10:00:00Z');
    fireEvent.click(row);

    // Verify modal opens with timestamp as fallback
    await waitFor(() => {
      const createdAtElement = screen.getByTestId('lead-created-at');
      expect(createdAtElement).toHaveTextContent('2026-01-15T10:00:00Z'); // Uses timestamp
    });
  });

  it('should fallback to current time when both createdAt and timestamp are null', async () => {
    const mockEntry: ActivityEntry = {
      id: 'lead_abc123_2026-01-15T10:00:00Z',
      leadUUID: 'lead_abc123',
      rowNumber: 5,
      companyName: 'ACME Corporation',
      status: 'contacted',
      changedById: 'U1234567890abcdef',
      changedByName: 'John Sales',
      timestamp: null, // Null timestamp (edge case)
      notes: 'Called customer',
      lead: {
        ...mockLead,
        createdAt: null, // Null createdAt
      },
    };

    mockUseActivityLog.mockReturnValue({
      data: {
        entries: [mockEntry],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: { changedByOptions: [] },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <TestWrapper>
        <ActivityLogContainer />
      </TestWrapper>
    );

    // Click row to open modal
    const row = await screen.findByTestId('activity-row-lead_abc123_2026-01-15T10:00:00Z');
    fireEvent.click(row);

    // Verify modal opens with current time as fallback (ISO format)
    await waitFor(() => {
      const createdAtElement = screen.getByTestId('lead-created-at');
      const createdAtValue = createdAtElement.textContent || '';
      // Verify it's a valid ISO timestamp starting with 2026 (current year)
      expect(createdAtValue).toMatch(/^2026-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
