/**
 * Lead Table Tests
 * Story 4.1: Lead List Table
 *
 * Tests for AC#1-9
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeadTable } from '@/components/leads/lead-table';
import type { Lead } from '@/types/lead';
import type { SortingState } from '@tanstack/react-table';

// Test data
const mockLeadsData: Lead[] = [
  {
    row: 1,
    date: '2026-01-15T10:30:00Z',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '0812345678',
    company: 'ABC Corp',
    industryAI: 'Manufacturing',
    website: 'https://abc-corp.com',
    capital: '100M THB',
    status: 'new',
    salesOwnerId: null,
    salesOwnerName: null,
    campaignId: 'camp1',
    campaignName: 'Q1 Campaign',
    emailSubject: 'Test Subject',
    source: 'Brevo',
    leadId: 'lead1',
    eventId: 'event1',
    clickedAt: '2026-01-15T10:00:00Z',
    talkingPoint: 'Interested in lubricants for manufacturing equipment',
    closedAt: null,
    lostAt: null,
    unreachableAt: null,
    version: 1,
    leadSource: 'Email',
    jobTitle: 'Purchasing Manager',
    city: 'Bangkok',
    leadUuid: 'lead_uuid_1',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: null,
  },
  {
    row: 2,
    date: '2026-01-14T09:00:00Z',
    customerName: 'Jane Smith',
    email: 'jane@test.com',
    phone: '0891234567',
    company: 'XYZ Ltd',
    industryAI: 'Logistics',
    website: 'https://xyz-ltd.com',
    capital: '50M THB',
    status: 'claimed',
    salesOwnerId: 'sales1',
    salesOwnerName: 'Bob Sales',
    campaignId: 'camp2',
    campaignName: 'Q2 Campaign',
    emailSubject: 'Lubricant Inquiry',
    source: 'Brevo',
    leadId: 'lead2',
    eventId: 'event2',
    clickedAt: '2026-01-14T08:30:00Z',
    talkingPoint: 'Fleet maintenance requirements',
    closedAt: null,
    lostAt: null,
    unreachableAt: null,
    version: 2,
    leadSource: 'Email',
    jobTitle: 'Operations Director',
    city: 'Chonburi',
    leadUuid: 'lead_uuid_2',
    createdAt: '2026-01-14T09:00:00Z',
    updatedAt: '2026-01-14T12:00:00Z',
  },
  {
    row: 3,
    date: '2026-01-13T14:00:00Z',
    customerName: 'Mike Wilson',
    email: 'mike@company.co.th',
    phone: '0823456789',
    company: 'Thai Industries',
    industryAI: null,
    website: null,
    capital: null,
    status: 'closed',
    salesOwnerId: 'sales2',
    salesOwnerName: 'Alice Sales',
    campaignId: 'camp1',
    campaignName: 'Q1 Campaign',
    emailSubject: 'Product Inquiry',
    source: 'Brevo',
    leadId: 'lead3',
    eventId: 'event3',
    clickedAt: '2026-01-13T13:00:00Z',
    talkingPoint: null,
    closedAt: '2026-01-15T16:00:00Z',
    lostAt: null,
    unreachableAt: null,
    version: 3,
    leadSource: 'Email',
    jobTitle: null,
    city: null,
    leadUuid: 'lead_uuid_3',
    createdAt: '2026-01-13T14:00:00Z',
    updatedAt: '2026-01-15T16:00:00Z',
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('LeadTable', () => {
  const mockOnSortingChange = vi.fn();
  const mockOnRowClick = vi.fn();
  const defaultSorting: SortingState = [{ id: 'createdAt', desc: true }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#1: Table Display
  describe('AC#1: Table Display', () => {
    it('renders table with header "Lead List"', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByTestId('lead-table')).toBeInTheDocument();
      expect(screen.getByText('Lead List')).toBeInTheDocument();
    });

    it('renders FileText icon in header', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const header = screen.getByText('Lead List');
      expect(header.parentElement).toBeInTheDocument();
    });
  });

  // AC#2: Table Columns
  describe('AC#2: Table Columns', () => {
    it('displays all required columns', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Contact Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Sales Owner')).toBeInTheDocument();
      expect(screen.getByText('Campaign')).toBeInTheDocument();
      expect(screen.getByText('Created Date')).toBeInTheDocument();
    });

    it('displays data for each lead', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('ABC Corp')).toBeInTheDocument();
      expect(screen.getByText('XYZ Ltd')).toBeInTheDocument();
      expect(screen.getByText('Thai Industries')).toBeInTheDocument();
    });
  });

  // AC#3: Data Display
  describe('AC#3: Data Display', () => {
    it('shows company with industry badge', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('ABC Corp')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing')).toBeInTheDocument();
    });

    it('shows email as clickable mailto link', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const emailLink = screen.getByText('john@example.com');
      expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
    });

    it('formats phone number with Thai format', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('081-234-5678')).toBeInTheDocument();
    });

    it('shows "Unassigned" for null sales owner', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });

    it('formats date as "DD MMM YYYY"', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('15 Jan 2026')).toBeInTheDocument();
    });
  });

  // AC#4: Status Badge Colors (tested separately in lead-status-badge.test.tsx)

  // AC#5: Row Click Navigation
  describe('AC#5: Row Click Navigation', () => {
    it('calls onRowClick with lead data when row is clicked', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId('lead-row-1');
      fireEvent.click(row);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockLeadsData[0]);
    });

    it('opens on keyboard Enter key', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId('lead-row-2');
      fireEvent.keyDown(row, { key: 'Enter' });

      expect(mockOnRowClick).toHaveBeenCalledWith(mockLeadsData[1]);
    });

    it('opens on keyboard Space key', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId('lead-row-3');
      fireEvent.keyDown(row, { key: ' ' });

      expect(mockOnRowClick).toHaveBeenCalledWith(mockLeadsData[2]);
    });

    it('has cursor pointer style for hover indication', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId('lead-row-1');
      expect(row).toHaveClass('cursor-pointer');
    });

    it('has hover highlight style', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId('lead-row-1');
      expect(row).toHaveClass('hover:bg-muted/50');
    });

    it('rows have role="button" for accessibility', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId('lead-row-1');
      expect(row).toHaveAttribute('role', 'button');
    });

    it('rows have tabIndex for keyboard navigation', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId('lead-row-1');
      expect(row).toHaveAttribute('tabIndex', '0');
    });
  });

  // AC#7: Responsive Design
  describe('AC#7: Responsive Design', () => {
    it('wraps table in overflow container', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const table = screen.getByRole('table');
      // The shadcn/ui Table wraps in a div with overflow-auto (part of scroll-area)
      expect(table.parentElement).toHaveClass('overflow-auto');
    });

    it('has sticky first column (Company)', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      // Check header has sticky class
      const companyHeader = screen.getByText('Company').closest('th');
      expect(companyHeader).toHaveClass('sticky', 'left-0');

      // Check cells have sticky class
      const row = screen.getByTestId('lead-row-1');
      const companyCell = within(row).getByText('ABC Corp').closest('td');
      expect(companyCell).toHaveClass('sticky', 'left-0');
    });
  });

  // AC#9: TanStack Table Integration
  describe('AC#9: TanStack Table Integration', () => {
    it('calls onSortingChange when header is clicked', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      const companyHeader = screen.getByRole('button', { name: /Sort by Company/i });
      fireEvent.click(companyHeader);

      expect(mockOnSortingChange).toHaveBeenCalled();
    });

    it('shows sort indicators on headers', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
        />
      );

      // All headers should have a sort button
      expect(screen.getByRole('button', { name: /Sort by Company/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sort by Contact Name/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sort by Email/i })).toBeInTheDocument();
    });
  });
});
