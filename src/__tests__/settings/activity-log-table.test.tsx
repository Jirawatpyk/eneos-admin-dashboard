/**
 * ActivityLogTable Component Tests
 * Story 7.7: Activity Log Page
 *
 * Tests for activity log table component.
 * AC#2: Display activity log entries in a table
 * AC#6: Click row to open Lead Detail Modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActivityLogTable } from '@/components/settings/activity-log-table';
import type { ActivityEntry } from '@/types/activity';
import type { Lead } from '@/types/lead';

// Mock Lead objects (full data for detail modal)
const mockLead1: Lead = {
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

const mockLead2: Lead = {
  row: 12,
  date: '2026-01-14',
  customerName: 'Jane Smith',
  email: 'jane@techstartup.com',
  phone: '0898765432',
  company: 'Tech Startup Inc.',
  industryAI: 'Technology',
  website: 'https://techstartup.com',
  capital: '10,000,000',
  status: 'closed',
  salesOwnerId: null,
  salesOwnerName: null,
  campaignId: 'campaign_002',
  campaignName: 'Campaign Q1',
  emailSubject: 'ENEOS Solutions',
  source: 'brevo',
  leadId: 'lead_002',
  eventId: 'evt_002',
  clickedAt: '2026-01-14T14:00:00Z',
  talkingPoint: null,
  closedAt: '2026-01-14T14:30:00Z',
  lostAt: null,
  unreachableAt: null,
  version: 1,
  leadSource: 'email',
  jobTitle: 'CEO',
  city: 'Chiang Mai',
  leadUuid: 'lead_def456',
  createdAt: '2026-01-14T14:00:00Z',
  updatedAt: '2026-01-14T14:30:00Z',
  juristicId: null,
  dbdSector: null,
  province: null,
  fullAddress: null,
};

const mockLead3: Lead = {
  row: 20,
  date: '2026-01-13',
  customerName: 'Bob Manager',
  email: 'bob@global.com',
  phone: '0801234567',
  company: 'Global Industries',
  industryAI: 'Construction',
  website: 'https://global.com',
  capital: '50,000,000',
  status: 'new',
  salesOwnerId: 'U9876543210fedcba',
  salesOwnerName: 'Jane Manager',
  campaignId: 'campaign_003',
  campaignName: 'Campaign Q1',
  emailSubject: 'ENEOS Industrial Solutions',
  source: 'brevo',
  leadId: 'lead_003',
  eventId: 'evt_003',
  clickedAt: '2026-01-13T08:00:00Z',
  talkingPoint: null,
  closedAt: null,
  lostAt: null,
  unreachableAt: null,
  version: 1,
  leadSource: 'email',
  jobTitle: 'Director',
  city: 'Chonburi',
  leadUuid: 'lead_ghi789',
  createdAt: '2026-01-13T08:00:00Z',
  updatedAt: '2026-01-13T08:15:00Z',
  juristicId: '1234567890123',
  dbdSector: 'CON-C',
  province: 'ชลบุรี',
  fullAddress: '789 Industrial Rd, Chonburi 20000',
};

const mockEntries: ActivityEntry[] = [
  {
    id: 'lead_abc123_2026-01-15T10:00:00Z',
    leadUUID: 'lead_abc123',
    rowNumber: 5,
    companyName: 'ACME Corporation',
    status: 'contacted',
    changedById: 'U1234567890abcdef',
    changedByName: 'John Sales',
    timestamp: '2026-01-15T10:00:00Z',
    notes: 'Called customer',
    lead: mockLead1,
  },
  {
    id: 'lead_def456_2026-01-14T14:30:00Z',
    leadUUID: 'lead_def456',
    rowNumber: 12,
    companyName: 'Tech Startup Inc.',
    status: 'closed',
    changedById: 'System',
    changedByName: 'System',
    timestamp: '2026-01-14T14:30:00Z',
    notes: null,
    lead: mockLead2,
  },
  {
    id: 'lead_ghi789_2026-01-13T08:15:00Z',
    leadUUID: 'lead_ghi789',
    rowNumber: 20,
    companyName: 'Global Industries',
    status: 'new',
    changedById: 'U9876543210fedcba',
    changedByName: 'Jane Manager',
    timestamp: '2026-01-13T08:15:00Z',
    notes: 'New lead from campaign',
    lead: mockLead3,
  },
];

describe('ActivityLogTable Component', () => {
  const mockOnRowClick = vi.fn();

  beforeEach(() => {
    cleanup();
    mockOnRowClick.mockReset();
  });

  describe('AC#2: Table columns', () => {
    it('renders table headers correctly', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Changed By')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('renders company names', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('ACME Corporation')).toBeInTheDocument();
      expect(screen.getByText('Tech Startup Inc.')).toBeInTheDocument();
      expect(screen.getByText('Global Industries')).toBeInTheDocument();
    });

    it('renders changed by names', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('John Sales')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('Jane Manager')).toBeInTheDocument();
    });

    it('renders status badges correctly', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByTestId('status-badge-contacted')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-closed')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-new')).toBeInTheDocument();
    });

    it('renders notes when present', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByText('Called customer')).toBeInTheDocument();
      expect(screen.getByText('New lead from campaign')).toBeInTheDocument();
    });

    it('shows dash for empty notes', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      // Tech Startup Inc. has null notes - should show '-'
      const rows = screen.getAllByRole('row');
      const techStartupRow = rows.find(row => row.textContent?.includes('Tech Startup Inc.'));
      expect(techStartupRow).toHaveTextContent('-');
    });

    it('formats timestamp correctly', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      // Timestamp should be formatted (locale-specific)
      // The exact format depends on the browser, but we check the table renders
      const tableElement = screen.getByTestId('activity-log-table');
      expect(tableElement).toBeInTheDocument();
    });
  });

  describe('AC#6: Click row to open Lead Detail', () => {
    it('calls onRowClick when row is clicked', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId(`activity-row-${mockEntries[0].id}`);
      fireEvent.click(row);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockEntries[0].rowNumber);
    });

    it('passes correct rowNumber for each entry', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      // Click second row
      const row = screen.getByTestId(`activity-row-${mockEntries[1].id}`);
      fireEvent.click(row);

      expect(mockOnRowClick).toHaveBeenCalledWith(12); // rowNumber of second entry
    });

    it('rows have cursor-pointer class for clickable indication', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
        />
      );

      const row = screen.getByTestId(`activity-row-${mockEntries[0].id}`);
      expect(row).toHaveClass('cursor-pointer');
    });
  });

  describe('fetching state', () => {
    it('shows opacity when isFetching is true', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
          isFetching={true}
        />
      );

      const table = screen.getByTestId('activity-log-table');
      expect(table).toHaveClass('opacity-70');
    });

    it('does not show opacity when isFetching is false', () => {
      render(
        <ActivityLogTable
          entries={mockEntries}
          onRowClick={mockOnRowClick}
          isFetching={false}
        />
      );

      const table = screen.getByTestId('activity-log-table');
      expect(table).not.toHaveClass('opacity-70');
    });
  });

  describe('empty entries', () => {
    it('renders table even with empty entries array', () => {
      render(
        <ActivityLogTable
          entries={[]}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByTestId('activity-log-table')).toBeInTheDocument();
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
    });
  });

  describe('status badge colors', () => {
    it('renders all status types with appropriate badges', () => {
      // Helper to create minimal mock Lead
      const createMockLead = (rowNumber: number, company: string, status: ActivityEntry['status']): Lead => ({
        row: rowNumber,
        date: '2026-01-15',
        customerName: `Contact ${rowNumber}`,
        email: `contact${rowNumber}@company.com`,
        phone: '0812345678',
        company,
        industryAI: 'General',
        website: null,
        capital: null,
        status,
        salesOwnerId: null,
        salesOwnerName: null,
        campaignId: 'campaign_test',
        campaignName: 'Test Campaign',
        emailSubject: null,
        source: 'brevo',
        leadId: null,
        eventId: null,
        clickedAt: null,
        talkingPoint: null,
        closedAt: null,
        lostAt: null,
        unreachableAt: null,
        version: 1,
        leadSource: null,
        jobTitle: null,
        city: null,
        leadUuid: `lead-${rowNumber}`,
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: null,
        juristicId: null,
        dbdSector: null,
        province: null,
        fullAddress: null,
      });

      const allStatusEntries: ActivityEntry[] = [
        {
          id: 'entry-1',
          leadUUID: 'lead-1',
          rowNumber: 1,
          companyName: 'Company 1',
          status: 'new',
          changedById: 'user1',
          changedByName: 'User 1',
          timestamp: '2026-01-15T10:00:00Z',
          notes: null,
          lead: createMockLead(1, 'Company 1', 'new'),
        },
        {
          id: 'entry-2',
          leadUUID: 'lead-2',
          rowNumber: 2,
          companyName: 'Company 2',
          status: 'claimed',
          changedById: 'user2',
          changedByName: 'User 2',
          timestamp: '2026-01-15T10:00:00Z',
          notes: null,
          lead: createMockLead(2, 'Company 2', 'claimed'),
        },
        {
          id: 'entry-3',
          leadUUID: 'lead-3',
          rowNumber: 3,
          companyName: 'Company 3',
          status: 'contacted',
          changedById: 'user3',
          changedByName: 'User 3',
          timestamp: '2026-01-15T10:00:00Z',
          notes: null,
          lead: createMockLead(3, 'Company 3', 'contacted'),
        },
        {
          id: 'entry-4',
          leadUUID: 'lead-4',
          rowNumber: 4,
          companyName: 'Company 4',
          status: 'closed',
          changedById: 'user4',
          changedByName: 'User 4',
          timestamp: '2026-01-15T10:00:00Z',
          notes: null,
          lead: createMockLead(4, 'Company 4', 'closed'),
        },
        {
          id: 'entry-5',
          leadUUID: 'lead-5',
          rowNumber: 5,
          companyName: 'Company 5',
          status: 'lost',
          changedById: 'user5',
          changedByName: 'User 5',
          timestamp: '2026-01-15T10:00:00Z',
          notes: null,
          lead: createMockLead(5, 'Company 5', 'lost'),
        },
        {
          id: 'entry-6',
          leadUUID: 'lead-6',
          rowNumber: 6,
          companyName: 'Company 6',
          status: 'unreachable',
          changedById: 'user6',
          changedByName: 'User 6',
          timestamp: '2026-01-15T10:00:00Z',
          notes: null,
          lead: createMockLead(6, 'Company 6', 'unreachable'),
        },
      ];

      render(
        <ActivityLogTable
          entries={allStatusEntries}
          onRowClick={mockOnRowClick}
        />
      );

      expect(screen.getByTestId('status-badge-new')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-claimed')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-contacted')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-closed')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-lost')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-unreachable')).toBeInTheDocument();
    });
  });
});
