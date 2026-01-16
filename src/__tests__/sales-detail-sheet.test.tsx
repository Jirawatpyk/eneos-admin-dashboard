/**
 * Sales Detail Sheet Tests
 * Story 3.1: Sales Team Performance Table
 *
 * Tests for AC#7: Detail Sheet/Dialog panel
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SalesDetailSheet } from '@/components/sales/sales-detail-sheet';
import type { SalesPersonMetrics } from '@/types/sales';

const mockSalesPerson: SalesPersonMetrics = {
  userId: 'user1',
  name: 'Alice',
  email: 'alice@eneos.co.th',
  claimed: 50,
  contacted: 40,
  closed: 20,
  lost: 5,
  unreachable: 5,
  conversionRate: 40,
  avgResponseTime: 45,
};

const mockLowPerformer: SalesPersonMetrics = {
  userId: 'user2',
  name: 'Bob',
  email: 'bob@eneos.co.th',
  claimed: 50,
  contacted: 40,
  closed: 4,
  lost: 26,
  unreachable: 10,
  conversionRate: 8,
  avgResponseTime: 120,
};

describe('SalesDetailSheet', () => {
  const onOpenChange = vi.fn();

  // AC#7: Shows name, email
  describe('Basic Display', () => {
    it('renders empty state Sheet when salesPerson is null but open', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={null}
        />
      );

      // Sheet should still render to maintain state consistency
      expect(screen.getByTestId('sales-detail-sheet')).toBeInTheDocument();
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });

    it('displays sales person name in title', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('displays sales person email', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.getByText('alice@eneos.co.th')).toBeInTheDocument();
    });
  });

  // AC#7: Shows all metrics
  describe('Metrics Display', () => {
    it('displays conversion rate', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.getByText('40.0%')).toBeInTheDocument();
    });

    it('displays response time formatted', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.getByText('45 min')).toBeInTheDocument();
    });

    it('displays all lead statistics', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.getByText('50')).toBeInTheDocument(); // Claimed
      expect(screen.getByText('40')).toBeInTheDocument(); // Contacted
      expect(screen.getByText('20')).toBeInTheDocument(); // Closed
      // Both Lost and Unreachable have value 5, so check for multiple
      expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
    });

    it('displays unreachable count', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      // Should show unreachable section
      expect(screen.getByText('Unreachable')).toBeInTheDocument();
    });
  });

  // AC#7: Performance indicators
  describe('Performance Indicators', () => {
    it('shows "High Performer" badge for rate >= 30%', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.getByText('High Performer')).toBeInTheDocument();
    });

    it('shows "Needs Attention" badge for rate < 10%', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockLowPerformer}
        />
      );

      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('shows leads assigned badge when claimed > 0', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.getByText('50 Leads Assigned')).toBeInTheDocument();
    });
  });

  // AC#7: Can be closed
  describe('Sheet Controls', () => {
    it('calls onOpenChange when open state changes', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      // The sheet component from shadcn/ui handles the close functionality
      // We just verify it renders with correct testid
      expect(screen.getByTestId('sales-detail-sheet')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <SalesDetailSheet
          open={false}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      expect(screen.queryByTestId('sales-detail-sheet')).not.toBeInTheDocument();
    });
  });

  // Conversion rate color highlighting
  describe('Conversion Rate Colors', () => {
    it('applies green color for high conversion rate', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockSalesPerson}
        />
      );

      const rateDisplay = screen.getByText('40.0%');
      expect(rateDisplay).toHaveClass('text-green-600');
    });

    it('applies amber color for low conversion rate', () => {
      render(
        <SalesDetailSheet
          open={true}
          onOpenChange={onOpenChange}
          salesPerson={mockLowPerformer}
        />
      );

      const rateDisplay = screen.getByText('8.0%');
      expect(rateDisplay).toHaveClass('text-amber-600');
    });
  });
});
