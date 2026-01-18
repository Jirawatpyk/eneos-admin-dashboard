/**
 * Status History Component Tests
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#2: Status History Section
 * - Timeline of all status changes
 * - Each entry shows: Status badge, Changed by (name), Timestamp
 * - Entries sorted chronologically (newest first)
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusHistory } from '@/components/leads/status-history';
import type { StatusHistoryItem } from '@/types/lead-detail';

describe('StatusHistory', () => {
  const mockHistory: StatusHistoryItem[] = [
    { status: 'new', by: 'System', timestamp: '2026-01-15T08:30:00.000Z' },
    { status: 'claimed', by: 'สมหญิง', timestamp: '2026-01-15T09:15:00.000Z' },
    { status: 'contacted', by: 'สมหญิง', timestamp: '2026-01-15T14:00:00.000Z' },
    { status: 'closed', by: 'สมหญิง', timestamp: '2026-01-16T11:30:00.000Z' },
  ];

  it('renders empty state when history is empty', () => {
    render(<StatusHistory history={[]} />);
    expect(screen.getByText('No status history available')).toBeInTheDocument();
  });

  it('renders empty state when history is undefined', () => {
    render(<StatusHistory history={undefined as unknown as StatusHistoryItem[]} />);
    expect(screen.getByText('No status history available')).toBeInTheDocument();
  });

  it('renders all history items', () => {
    render(<StatusHistory history={mockHistory} />);
    const items = screen.getAllByTestId('status-history-item');
    expect(items).toHaveLength(4);
  });

  it('displays status badges for each entry', () => {
    render(<StatusHistory history={mockHistory} />);
    // Check for Thai status labels
    expect(screen.getByText('ใหม่')).toBeInTheDocument();
    expect(screen.getByText('รับแล้ว')).toBeInTheDocument();
    expect(screen.getByText('ติดต่อแล้ว')).toBeInTheDocument();
    expect(screen.getByText('ปิดสำเร็จ')).toBeInTheDocument();
  });

  it('displays "by" attribution for each entry', () => {
    render(<StatusHistory history={mockHistory} />);
    expect(screen.getByText('by System')).toBeInTheDocument();
    // สมหญิง appears 3 times
    const bySmying = screen.getAllByText('by สมหญิง');
    expect(bySmying).toHaveLength(3);
  });

  it('sorts entries newest first (AC#2)', () => {
    render(<StatusHistory history={mockHistory} />);
    const items = screen.getAllByTestId('status-history-item');

    // First item should be "closed" (newest)
    expect(items[0]).toHaveTextContent('ปิดสำเร็จ');
    // Last item should be "new" (oldest)
    expect(items[3]).toHaveTextContent('ใหม่');
  });

  it('displays formatted timestamps', () => {
    render(<StatusHistory history={mockHistory} />);
    // Check for time elements
    const timeElements = screen.getAllByRole('time');
    expect(timeElements.length).toBeGreaterThan(0);
    // Each should have datetime attribute
    timeElements.forEach((el) => {
      expect(el).toHaveAttribute('datetime');
    });
  });

  it('handles entries without "by" field gracefully', () => {
    const historyWithoutBy: StatusHistoryItem[] = [
      { status: 'new', by: '', timestamp: '2026-01-15T08:30:00.000Z' },
    ];
    render(<StatusHistory history={historyWithoutBy} />);
    expect(screen.getByText('ใหม่')).toBeInTheDocument();
    expect(screen.queryByText(/^by /)).not.toBeInTheDocument();
  });

  // Filter duplicate statuses - keep only first (newest) occurrence of each status
  it('filters out duplicate statuses, keeping only newest occurrence', () => {
    const historyWithDuplicates: StatusHistoryItem[] = [
      { status: 'new', by: 'System', timestamp: '2026-01-15T08:30:00.000Z' },
      { status: 'contacted', by: 'สมหญิง', timestamp: '2026-01-15T09:00:00.000Z' },
      { status: 'closed', by: 'สมหญิง', timestamp: '2026-01-15T10:00:00.000Z' },
      { status: 'contacted', by: 'สมหญิง', timestamp: '2026-01-15T11:00:00.000Z' }, // duplicate (older)
      { status: 'closed', by: 'สมหญิง', timestamp: '2026-01-15T12:00:00.000Z' }, // newest closed
    ];

    render(<StatusHistory history={historyWithDuplicates} />);
    const items = screen.getAllByTestId('status-history-item');

    // Should show only 3 unique statuses: closed, contacted, new
    expect(items).toHaveLength(3);

    // Verify order (newest first): closed (12:00) → contacted (11:00) → new (08:30)
    expect(items[0]).toHaveTextContent('ปิดสำเร็จ');
    expect(items[1]).toHaveTextContent('ติดต่อแล้ว');
    expect(items[2]).toHaveTextContent('ใหม่');
  });
});
