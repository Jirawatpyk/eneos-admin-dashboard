/**
 * Lead Export Dropdown Component Tests
 * Story 4.10: Quick Export
 *
 * AC#1: Export Button in Selection Toolbar
 * AC#2: Export Format Options
 * AC#6: Export Progress Feedback
 * AC#8: Large Selection Warning
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadExportDropdown } from '@/components/leads/lead-export-dropdown';
import type { Lead } from '@/types/lead';

// Mock hooks
const mockExportLeads = vi.fn();
vi.mock('@/hooks/use-export-leads', () => ({
  useExportLeads: () => ({
    exportLeads: mockExportLeads,
    isExporting: false,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
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
});

describe('LeadExportDropdown', () => {
  const mockLeads: Lead[] = [createMockLead(1), createMockLead(2)];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#1: Export button with download icon and count
  it('renders export button with lead count', () => {
    render(<LeadExportDropdown leads={mockLeads} />);

    const button = screen.getByTestId('lead-export-dropdown-trigger');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Export (2)');
  });

  // AC#1: Disabled when no leads
  it('disables button when no leads provided', () => {
    render(<LeadExportDropdown leads={[]} />);

    const button = screen.getByTestId('lead-export-dropdown-trigger');
    expect(button).toBeDisabled();
  });

  // AC#1: Disabled when disabled prop is true
  it('disables button when disabled prop is true', () => {
    render(<LeadExportDropdown leads={mockLeads} disabled />);

    const button = screen.getByTestId('lead-export-dropdown-trigger');
    expect(button).toBeDisabled();
  });

  // AC#2: Shows format options dropdown
  it('opens dropdown with format options on click', async () => {
    const user = userEvent.setup();
    render(<LeadExportDropdown leads={mockLeads} />);

    const button = screen.getByTestId('lead-export-dropdown-trigger');
    await user.click(button);

    expect(screen.getByTestId('lead-export-option-excel')).toBeInTheDocument();
    expect(screen.getByTestId('lead-export-option-csv')).toBeInTheDocument();
  });

  // AC#2: Excel is first option
  it('shows Excel as first option', async () => {
    const user = userEvent.setup();
    render(<LeadExportDropdown leads={mockLeads} />);

    await user.click(screen.getByTestId('lead-export-dropdown-trigger'));

    const excelOption = screen.getByTestId('lead-export-option-excel');
    const csvOption = screen.getByTestId('lead-export-option-csv');

    // Excel should appear before CSV in the DOM
    expect(excelOption.compareDocumentPosition(csvOption)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  // AC#2: Excel option exports to Excel format
  it('calls exportLeads with excel format when Excel clicked', async () => {
    const user = userEvent.setup();
    render(<LeadExportDropdown leads={mockLeads} />);

    await user.click(screen.getByTestId('lead-export-dropdown-trigger'));
    await user.click(screen.getByTestId('lead-export-option-excel'));

    expect(mockExportLeads).toHaveBeenCalledWith(mockLeads, 'excel');
  });

  // AC#2: CSV option exports to CSV format
  it('calls exportLeads with csv format when CSV clicked', async () => {
    const user = userEvent.setup();
    render(<LeadExportDropdown leads={mockLeads} />);

    await user.click(screen.getByTestId('lead-export-dropdown-trigger'));
    await user.click(screen.getByTestId('lead-export-option-csv'));

    expect(mockExportLeads).toHaveBeenCalledWith(mockLeads, 'csv');
  });

  // AC#1: Singular form for 1 lead
  it('shows singular form for 1 lead', () => {
    render(<LeadExportDropdown leads={[createMockLead(1)]} />);

    const button = screen.getByTestId('lead-export-dropdown-trigger');
    expect(button).toHaveTextContent('Export (1)');
    // aria-label uses singular
    expect(button).toHaveAttribute('aria-label', 'Export 1 lead');
  });

  // AC#10: Keyboard accessibility
  it('opens dropdown with keyboard', async () => {
    const user = userEvent.setup();
    render(<LeadExportDropdown leads={mockLeads} />);

    const button = screen.getByTestId('lead-export-dropdown-trigger');
    button.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByTestId('lead-export-dropdown-content')).toBeInTheDocument();
    });
  });

  // AC#8: Large selection shows confirmation dialog
  it('shows confirmation dialog for >100 leads', async () => {
    const user = userEvent.setup();
    const manyLeads = Array.from({ length: 150 }, (_, i) => createMockLead(i + 1));
    render(<LeadExportDropdown leads={manyLeads} />);

    await user.click(screen.getByTestId('lead-export-dropdown-trigger'));
    await user.click(screen.getByTestId('lead-export-option-excel'));

    // Should show confirmation dialog
    expect(screen.getByTestId('export-confirmation-dialog')).toBeInTheDocument();
    expect(screen.getByText('Export 150 leads?')).toBeInTheDocument();
  });

  // AC#8: Confirmation dialog - confirm action
  it('exports after confirming large selection', async () => {
    const user = userEvent.setup();
    const manyLeads = Array.from({ length: 150 }, (_, i) => createMockLead(i + 1));
    render(<LeadExportDropdown leads={manyLeads} />);

    await user.click(screen.getByTestId('lead-export-dropdown-trigger'));
    await user.click(screen.getByTestId('lead-export-option-excel'));

    // Confirm
    await user.click(screen.getByTestId('export-confirmation-confirm'));

    expect(mockExportLeads).toHaveBeenCalledWith(manyLeads, 'excel');
  });

  // AC#8: Confirmation dialog - cancel action
  it('does not export when confirmation canceled', async () => {
    const user = userEvent.setup();
    const manyLeads = Array.from({ length: 150 }, (_, i) => createMockLead(i + 1));
    render(<LeadExportDropdown leads={manyLeads} />);

    await user.click(screen.getByTestId('lead-export-dropdown-trigger'));
    await user.click(screen.getByTestId('lead-export-option-excel'));

    // Cancel
    await user.click(screen.getByTestId('export-confirmation-cancel'));

    expect(mockExportLeads).not.toHaveBeenCalled();
  });

  // AC#8: Does not show confirmation for <=100 leads
  it('exports directly for <=100 leads without confirmation', async () => {
    const user = userEvent.setup();
    const leads = Array.from({ length: 100 }, (_, i) => createMockLead(i + 1));
    render(<LeadExportDropdown leads={leads} />);

    await user.click(screen.getByTestId('lead-export-dropdown-trigger'));
    await user.click(screen.getByTestId('lead-export-option-excel'));

    // Should export directly without confirmation
    expect(mockExportLeads).toHaveBeenCalledWith(leads, 'excel');
    expect(screen.queryByTestId('export-confirmation-dialog')).not.toBeInTheDocument();
  });
});

// Note: Loading state (AC#6) is tested via the useExportLeads hook tests
// The component correctly uses isExporting from the hook to disable and show spinner
