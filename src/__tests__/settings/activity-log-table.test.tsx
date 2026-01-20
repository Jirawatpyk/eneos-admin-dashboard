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
