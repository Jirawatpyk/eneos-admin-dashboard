/**
 * Selection Toolbar Tests
 * Story 4.9: Bulk Select - AC#4, AC#5
 * Story 4.10: Quick Export - AC#1
 *
 * Tests:
 * - AC#4: Display selection count "{count} leads selected"
 * - AC#4: Show "Clear selection" button
 * - AC#5: Clear all selections when button clicked
 * - Story 4.10 AC#1: Export button in toolbar
 * - Accessibility attributes
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectionToolbar } from '@/components/leads/selection-toolbar';
import type { Lead } from '@/types/lead';

// Mock LeadExportDropdown to avoid complex mocking
vi.mock('@/components/leads/lead-export-dropdown', () => ({
  LeadExportDropdown: ({ leads }: { leads: Lead[] }) => (
    <button data-testid="lead-export-dropdown-mock">Export ({leads.length})</button>
  ),
}));

// Sample lead data
const createMockLead = (row: number): Lead => ({
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
  leadId: 'lead-1',
  eventId: 'event-1',
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
  juristicId: null,
  dbdSector: null,
  province: null,
  fullAddress: null,
});

describe('SelectionToolbar', () => {
  const mockOnClearSelection = vi.fn();
  const mockSelectedLeads: Lead[] = [createMockLead(1), createMockLead(2)];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#4: Display selection count
  describe('AC#4: Selection count display', () => {
    it('displays single lead selection correctly', () => {
      render(
        <SelectionToolbar
          selectedCount={1}
          selectedLeads={[createMockLead(1)]}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-count')).toHaveTextContent('1 lead selected');
    });

    it('displays plural leads selection correctly', () => {
      render(
        <SelectionToolbar
          selectedCount={5}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-count')).toHaveTextContent('5 leads selected');
    });

    it('displays 10 leads selection correctly', () => {
      render(
        <SelectionToolbar
          selectedCount={10}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-count')).toHaveTextContent('10 leads selected');
    });
  });

  // AC#4: Show clear selection button
  describe('AC#4: Clear selection button', () => {
    it('renders clear selection button', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('clear-selection-button')).toBeInTheDocument();
      expect(screen.getByText('Clear selection')).toBeInTheDocument();
    });
  });

  // AC#5: Clear selection functionality
  describe('AC#5: Clear selection', () => {
    it('calls onClearSelection when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SelectionToolbar
          selectedCount={5}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      await user.click(screen.getByTestId('clear-selection-button'));

      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  // Conditional rendering
  describe('conditional rendering', () => {
    it('does not render when selectedCount is 0', () => {
      render(
        <SelectionToolbar
          selectedCount={0}
          selectedLeads={[]}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByTestId('selection-toolbar')).not.toBeInTheDocument();
    });

    it('renders when selectedCount is greater than 0', () => {
      render(
        <SelectionToolbar
          selectedCount={1}
          selectedLeads={[createMockLead(1)]}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByTestId('selection-toolbar')).toBeInTheDocument();
    });
  });

  // Accessibility
  describe('accessibility', () => {
    it('has role="toolbar" attribute', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('has aria-label for toolbar', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Selection actions');
    });

    it('clear button has type="button"', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      const button = screen.getByTestId('clear-selection-button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  // Styling
  describe('styling', () => {
    it('has background styling classes', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      const toolbar = screen.getByTestId('selection-toolbar');
      expect(toolbar).toHaveClass('bg-blue-50');
    });

    it('has animation classes', () => {
      render(
        <SelectionToolbar
          selectedCount={3}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      const toolbar = screen.getByTestId('selection-toolbar');
      expect(toolbar).toHaveClass('animate-in');
      expect(toolbar).toHaveClass('slide-in-from-top-2');
    });
  });

  // Story 4.10 AC#1: Export button in toolbar
  describe('Story 4.10: Export functionality', () => {
    it('renders export dropdown with selected leads', () => {
      render(
        <SelectionToolbar
          selectedCount={2}
          selectedLeads={mockSelectedLeads}
          onClearSelection={mockOnClearSelection}
        />
      );

      // The mocked dropdown should show the count
      expect(screen.getByTestId('lead-export-dropdown-mock')).toBeInTheDocument();
      expect(screen.getByText('Export (2)')).toBeInTheDocument();
    });

    it('passes correct leads to export dropdown', () => {
      const leads = [createMockLead(1), createMockLead(2), createMockLead(3)];
      render(
        <SelectionToolbar
          selectedCount={3}
          selectedLeads={leads}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('Export (3)')).toBeInTheDocument();
    });
  });
});
