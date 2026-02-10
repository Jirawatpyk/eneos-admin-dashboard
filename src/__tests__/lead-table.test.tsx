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
    juristicId: null,
    dbdSector: null,
    province: null,
    fullAddress: null,
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
    capital: '796,362,800 บาท',
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
    juristicId: '0105551234567',
    dbdSector: 'F&B-M',
    province: 'กรุงเทพมหานคร',
    fullAddress: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
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
    juristicId: null,
    dbdSector: null,
    province: null,
    fullAddress: null,
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
  const mockOnToggleSelection = vi.fn();
  const mockOnSelectAll = vi.fn();
  const defaultSorting: SortingState = [{ id: 'createdAt', desc: true }];

  // Story 4.9: Default selection props
  const defaultSelectionProps = {
    selectedIds: new Set<string>(),
    onToggleSelection: mockOnToggleSelection,
    onSelectAll: mockOnSelectAll,
    isAllSelected: false,
    isSomeSelected: false,
  };

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
          {...defaultSelectionProps}
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
          {...defaultSelectionProps}
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
          {...defaultSelectionProps}
        />
      );

      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Capital')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Sales Owner')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('displays data for each lead', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      expect(screen.getByText('ABC Corp')).toBeInTheDocument();
      expect(screen.getByText('XYZ Ltd')).toBeInTheDocument();
      expect(screen.getByText('Thai Industries')).toBeInTheDocument();
    });
  });

  // AC#3: Data Display
  describe('AC#3: Data Display', () => {
    it('shows company name in table', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      expect(screen.getByText('ABC Corp')).toBeInTheDocument();
      expect(screen.getByText('XYZ Ltd')).toBeInTheDocument();
      expect(screen.getByText('Thai Industries')).toBeInTheDocument();
    });

    it('shows email as clickable mailto link', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
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
          {...defaultSelectionProps}
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
          {...defaultSelectionProps}
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
          {...defaultSelectionProps}
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
          {...defaultSelectionProps}
        />
      );

      const row = screen.getByTestId('lead-row-lead_uuid_1');
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
          {...defaultSelectionProps}
        />
      );

      const row = screen.getByTestId('lead-row-lead_uuid_2');
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
          {...defaultSelectionProps}
        />
      );

      const row = screen.getByTestId('lead-row-lead_uuid_3');
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
          {...defaultSelectionProps}
        />
      );

      const row = screen.getByTestId('lead-row-lead_uuid_1');
      expect(row).toHaveClass('cursor-pointer');
    });

    it('has hover highlight style', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const row = screen.getByTestId('lead-row-lead_uuid_1');
      expect(row).toHaveClass('hover:bg-muted/50');
    });

    it('rows have role="button" for accessibility', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const row = screen.getByTestId('lead-row-lead_uuid_1');
      expect(row).toHaveAttribute('role', 'button');
    });

    it('rows have tabIndex for keyboard navigation', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const row = screen.getByTestId('lead-row-lead_uuid_1');
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
          {...defaultSelectionProps}
        />
      );

      const table = screen.getByRole('table');
      // The shadcn/ui Table wraps in a div with overflow-auto (part of scroll-area)
      expect(table.parentElement).toHaveClass('overflow-auto');
    });

    it('has sticky checkbox column (first) and Company column (second)', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      // Story 4.9: Check checkbox header is sticky at left-0
      const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
      const checkboxHeader = selectAllCheckbox.closest('th');
      expect(checkboxHeader).toHaveClass('sticky', 'left-0');

      // Check Company header has sticky class at left-10 (after checkbox column)
      const companyHeader = screen.getByText('Company').closest('th');
      expect(companyHeader).toHaveClass('sticky', 'left-10');

      // Check cells have sticky class
      const row = screen.getByTestId('lead-row-lead_uuid_1');
      const companyCell = within(row).getByText('ABC Corp').closest('td');
      expect(companyCell).toHaveClass('sticky', 'left-10');
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
          {...defaultSelectionProps}
        />
      );

      const companyHeader = screen.getByRole('button', { name: /Sort by Company/i });
      fireEvent.click(companyHeader);

      // Story 4.7: onSortingChange is now called with column ID
      expect(mockOnSortingChange).toHaveBeenCalledWith('company');
    });

    // Story 4.7 AC#1: Only 4 columns are sortable (company, status, salesOwnerName, createdAt)
    it('shows sort indicators only on sortable columns', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      // Sortable columns HAVE sort buttons
      expect(screen.getByRole('button', { name: /Sort by Company/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sort by Status/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sort by Sales Owner/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sort by Date/i })).toBeInTheDocument();

      // Non-sortable columns do NOT have sort buttons (they are plain text)
      expect(screen.queryByRole('button', { name: /Sort by Name/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Sort by Email/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Sort by Phone/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Sort by Location/i })).not.toBeInTheDocument();
    });
  });

  // Story 4.7: Sort Columns
  describe('Story 4.7: Sort Columns', () => {
    // AC#1: Sortable Column Headers
    it('sortable headers have pointer cursor style', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const companyHeader = screen.getByTestId('sort-header-company');
      expect(companyHeader).toHaveClass('cursor-pointer');
    });

    // AC#3: Sort Indicator Display - shows descending indicator when sorted desc
    it('shows descending indicator for sorted column', () => {
      const descSorting: SortingState = [{ id: 'createdAt', desc: true }];

      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={descSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const createdAtHeader = screen.getByTestId('sort-header-createdAt');
      // Should have text-primary class when sorted
      expect(createdAtHeader).toHaveClass('text-primary');
      // Issue #3 Fix: Verify ArrowDown icon is rendered (not ArrowUp or ArrowUpDown)
      const arrowDownIcon = createdAtHeader.querySelector('.lucide-arrow-down');
      expect(arrowDownIcon).toBeInTheDocument();
    });

    // AC#3: Sort Indicator Display - shows ascending indicator when sorted asc
    it('shows ascending indicator for sorted column', () => {
      const ascSorting: SortingState = [{ id: 'company', desc: false }];

      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={ascSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const companyHeader = screen.getByTestId('sort-header-company');
      // Should have text-primary class when sorted
      expect(companyHeader).toHaveClass('text-primary');
      // Issue #3 Fix: Verify ArrowUp icon is rendered (not ArrowDown or ArrowUpDown)
      const arrowUpIcon = companyHeader.querySelector('.lucide-arrow-up');
      expect(arrowUpIcon).toBeInTheDocument();
    });

    // AC#3: Sort Indicator Display - shows neutral indicator when not sorted
    it('shows neutral indicator for unsorted column', () => {
      const descSorting: SortingState = [{ id: 'createdAt', desc: true }];

      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={descSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      // Company is NOT sorted (createdAt is sorted)
      const companyHeader = screen.getByTestId('sort-header-company');
      // Should NOT have text-primary class
      expect(companyHeader).not.toHaveClass('text-primary');
      // Verify ArrowUpDown icon is rendered (neutral state)
      const arrowUpDownIcon = companyHeader.querySelector('.lucide-arrow-up-down');
      expect(arrowUpDownIcon).toBeInTheDocument();
    });

    // AC#9: Accessibility - aria-sort attribute
    it('sets aria-sort attribute on sorted column header (th element)', () => {
      const descSorting: SortingState = [{ id: 'createdAt', desc: true }];

      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={descSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      // AC#9: aria-sort should be on th element (columnheader), not on button
      const createdAtColumnHeader = screen.getByTestId('column-header-createdAt');
      expect(createdAtColumnHeader).toHaveAttribute('aria-sort', 'descending');

      // Unsorted columns should have aria-sort="none"
      const companyColumnHeader = screen.getByTestId('column-header-company');
      expect(companyColumnHeader).toHaveAttribute('aria-sort', 'none');
    });

    // AC#9: Accessibility - keyboard support (Enter key)
    it('responds to Enter key on sortable header', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const companyHeader = screen.getByTestId('sort-header-company');
      fireEvent.keyDown(companyHeader, { key: 'Enter' });

      expect(mockOnSortingChange).toHaveBeenCalledWith('company');
    });

    // AC#9: Accessibility - keyboard support (Space key)
    it('responds to Space key on sortable header', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const statusHeader = screen.getByTestId('sort-header-status');
      fireEvent.keyDown(statusHeader, { key: ' ' });

      expect(mockOnSortingChange).toHaveBeenCalledWith('status');
    });

    // AC#9: Accessibility - tabIndex for keyboard navigation
    it('sortable headers have tabIndex for keyboard navigation', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const companyHeader = screen.getByTestId('sort-header-company');
      expect(companyHeader).toHaveAttribute('tabIndex', '0');
    });

    // AC#2: Single Column Sort - clicking toggles sort
    it('calls onSortingChange with column ID when clicked', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const salesOwnerHeader = screen.getByTestId('sort-header-salesOwnerName');
      fireEvent.click(salesOwnerHeader);

      expect(mockOnSortingChange).toHaveBeenCalledWith('salesOwnerName');
    });

    // AC#1: Sortable columns have hover state
    it('sortable headers have hover state class', () => {
      renderWithProviders(
        <LeadTable
          data={mockLeadsData}
          sorting={defaultSorting}
          onSortingChange={mockOnSortingChange}
          onRowClick={mockOnRowClick}
          {...defaultSelectionProps}
        />
      );

      const companyHeader = screen.getByTestId('sort-header-company');
      expect(companyHeader).toHaveClass('hover:bg-muted/50');
    });
  });

  // Story 4.15: Grounding Fields Display
  describe('Story 4.15: Grounding Fields', () => {
    // AC#1: DBD Sector Badge in Company Column
    describe('AC#1: DBD Sector Badge', () => {
      it('displays DBD Sector badge when dbdSector exists', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 2 has dbdSector = 'F&B-M'
        expect(screen.getByText('F&B-M')).toBeInTheDocument();
      });

      it('does not show industry badge when dbdSector is present', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 2 has dbdSector, so industryAI 'Logistics' should NOT be displayed as badge
        // The 'Logistics' text should not appear in Company column context
        const row = screen.getByTestId('lead-row-lead_uuid_2');
        const companyCell = within(row).getByText('XYZ Ltd').closest('td');
        expect(companyCell).not.toHaveTextContent('Logistics');
      });

      it('shows no badge when dbdSector is null', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 1 has dbdSector = null, so no sector badge
        const row = screen.getByTestId('lead-row-lead_uuid_1');
        const companyCell = within(row).getByText('ABC Corp').closest('td');
        // Should only have company name, no badge
        expect(companyCell?.textContent).toBe('ABC Corp');
      });
    });

    // AC#2: Capital Column
    describe('AC#2: Capital Column', () => {
      it('displays Capital column header', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        expect(screen.getByText('Capital')).toBeInTheDocument();
      });

      it('displays capital value when exists and not "ไม่ระบุ"', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 2 has capital = '796,362,800 บาท'
        expect(screen.getByText('796,362,800 บาท')).toBeInTheDocument();
      });

      it('shows "-" placeholder when capital is null', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 3 has capital = null, should show "-"
        const row = screen.getByTestId('lead-row-lead_uuid_3');
        const cells = within(row).getAllByRole('cell');
        // Capital is the 3rd column (after checkbox, company)
        const capitalCell = cells[2];
        expect(capitalCell).toHaveTextContent('-');
      });

      it('Capital column is sortable', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Should have sort button for Capital
        expect(screen.getByRole('button', { name: /Sort by Capital/i })).toBeInTheDocument();
      });
    });

    // AC#3: Location Column
    describe('AC#3: Location Column', () => {
      it('displays Location column header', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        expect(screen.getByText('Location')).toBeInTheDocument();
      });

      it('shows province with icon when province exists', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 2 has province = 'กรุงเทพมหานคร'
        expect(screen.getByText('กรุงเทพมหานคร')).toBeInTheDocument();
      });

      it('falls back to city when province is null', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 1 has province = null, city = 'Bangkok'
        expect(screen.getByText('Bangkok')).toBeInTheDocument();
      });

      it('shows "-" when both province and city are null', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 3 has province = null, city = null
        const row = screen.getByTestId('lead-row-lead_uuid_3');
        const cells = within(row).getAllByRole('cell');
        // Location is the 4th column (after checkbox, company, capital)
        const locationCell = cells[3];
        expect(locationCell).toHaveTextContent('-');
      });
    });

    // AC#4: Column Count
    describe('AC#4: Column Count', () => {
      it('displays 9 visible columns plus checkbox column', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Expected columns: Checkbox, Company, Capital, Location, Name, Email, Phone, Status, Sales Owner, Date = 10 total
        const headerRow = screen.getAllByRole('columnheader');
        expect(headerRow).toHaveLength(10);
      });
    });

    // AC#9: Data Integrity - Null Value Handling
    describe('AC#9: Data Integrity', () => {
      it('handles legacy leads with all grounding fields null', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 1 has all grounding fields null - should not crash
        const row = screen.getByTestId('lead-row-lead_uuid_1');
        expect(row).toBeInTheDocument();

        // Row 1 should have company name visible
        expect(within(row).getByText('ABC Corp')).toBeInTheDocument();
        // Should show city fallback in location column
        expect(within(row).getByText('Bangkok')).toBeInTheDocument();
      });

      it('handles mixed null and populated grounding fields', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Row 2 has all grounding fields populated
        const row2 = screen.getByTestId('lead-row-lead_uuid_2');
        expect(within(row2).getByText('F&B-M')).toBeInTheDocument();
        expect(within(row2).getByText('796,362,800 บาท')).toBeInTheDocument();
        expect(within(row2).getByText('กรุงเทพมหานคร')).toBeInTheDocument();

        // Row 3 has all grounding fields null
        const row3 = screen.getByTestId('lead-row-lead_uuid_3');
        const cells = within(row3).getAllByRole('cell');
        expect(cells[2]).toHaveTextContent('-'); // Capital
        expect(cells[3]).toHaveTextContent('-'); // Location
      });
    });
  });

  // Story 4.16: Mobile-Responsive Lead Filters
  describe('Story 4.16: Mobile Table Column Visibility', () => {
    // AC#8: Mobile columns - show only Checkbox, Company, Status, Owner
    describe('AC#8: Mobile Column Visibility', () => {
      it('Checkbox column always visible', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Checkbox header should not have hidden class
        const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
        const checkboxHeader = selectAllCheckbox.closest('th');
        expect(checkboxHeader).not.toHaveClass('hidden');

        // Checkbox cell should not have hidden class
        const row = screen.getByTestId('lead-row-lead_uuid_1');
        const checkboxCell = within(row).getByTestId('select-checkbox-lead_uuid_1').closest('td');
        expect(checkboxCell).not.toHaveClass('hidden');
      });

      it('Company column always visible', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Company header should not have hidden class
        const companyHeader = screen.getByText('Company').closest('th');
        expect(companyHeader).not.toHaveClass('hidden');

        // Company cell should not have hidden class
        const row = screen.getByTestId('lead-row-lead_uuid_1');
        const companyCell = within(row).getByText('ABC Corp').closest('td');
        expect(companyCell).not.toHaveClass('hidden');
      });

      it('Status column always visible', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Status header should not have hidden class
        const statusHeader = screen.getByText('Status').closest('th');
        expect(statusHeader).not.toHaveClass('hidden');
      });

      it('Sales Owner column always visible', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Sales Owner header should not have hidden class
        const ownerHeader = screen.getByText('Sales Owner').closest('th');
        expect(ownerHeader).not.toHaveClass('hidden');
      });

      it('Capital column hidden on mobile (< 768px)', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Capital header should have hidden md:table-cell classes
        const capitalHeader = screen.getByText('Capital').closest('th');
        expect(capitalHeader).toHaveClass('hidden', 'md:table-cell');

        // Capital cell should have hidden md:table-cell classes
        const row = screen.getByTestId('lead-row-lead_uuid_2');
        const capitalCell = within(row).getByText('796,362,800 บาท').closest('td');
        expect(capitalCell).toHaveClass('hidden', 'md:table-cell');
      });

      it('Location column hidden on mobile', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Location header should have hidden md:table-cell classes
        const locationHeader = screen.getByText('Location').closest('th');
        expect(locationHeader).toHaveClass('hidden', 'md:table-cell');
      });

      it('Contact column hidden on mobile', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Contact header should have hidden md:table-cell classes
        const contactHeader = screen.getByText('Contact').closest('th');
        expect(contactHeader).toHaveClass('hidden', 'md:table-cell');
      });

      it('Email column hidden on mobile', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Email header should have hidden md:table-cell classes
        const emailHeader = screen.getByText('Email').closest('th');
        expect(emailHeader).toHaveClass('hidden', 'md:table-cell');
      });

      it('Phone column hidden on mobile', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Phone header should have hidden md:table-cell classes
        const phoneHeader = screen.getByText('Phone').closest('th');
        expect(phoneHeader).toHaveClass('hidden', 'md:table-cell');
      });

      it('Date column hidden on mobile', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Date header should have hidden md:table-cell classes
        const dateHeader = screen.getByText('Date').closest('th');
        expect(dateHeader).toHaveClass('hidden', 'md:table-cell');
      });

      it('row click to detail sheet works on mobile', () => {
        renderWithProviders(
          <LeadTable
            data={mockLeadsData}
            sorting={defaultSorting}
            onSortingChange={mockOnSortingChange}
            onRowClick={mockOnRowClick}
            {...defaultSelectionProps}
          />
        );

        // Click on row should still trigger onRowClick
        const row = screen.getByTestId('lead-row-lead_uuid_1');
        fireEvent.click(row);

        expect(mockOnRowClick).toHaveBeenCalledWith(mockLeadsData[0]);
      });
    });
  });
});
