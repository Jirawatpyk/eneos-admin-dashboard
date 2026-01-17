/**
 * Lead Status Badge Tests
 * Story 4.1: Lead List Table
 *
 * Tests for AC#4: Status Badge Colors
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LeadStatusBadge } from '@/components/leads/lead-status-badge';
import type { LeadStatus } from '@/types/lead';

describe('LeadStatusBadge', () => {
  // AC#4: Status Badge Colors
  const statusColorTests: Array<{
    status: LeadStatus;
    expectedClasses: string[];
    label: string;
  }> = [
    {
      status: 'new',
      expectedClasses: ['bg-gray-100', 'text-gray-800'],
      label: 'ใหม่',
    },
    {
      status: 'claimed',
      expectedClasses: ['bg-blue-100', 'text-blue-800'],
      label: 'รับแล้ว',
    },
    {
      status: 'contacted',
      expectedClasses: ['bg-amber-100', 'text-amber-800'],
      label: 'ติดต่อแล้ว',
    },
    {
      status: 'closed',
      expectedClasses: ['bg-green-100', 'text-green-800'],
      label: 'ปิดสำเร็จ',
    },
    {
      status: 'lost',
      expectedClasses: ['bg-red-100', 'text-red-800'],
      label: 'ปิดไม่สำเร็จ',
    },
    {
      status: 'unreachable',
      expectedClasses: ['bg-gray-100', 'text-gray-500'],
      label: 'ติดต่อไม่ได้',
    },
  ];

  statusColorTests.forEach(({ status, expectedClasses, label }) => {
    describe(`status: ${status}`, () => {
      it(`displays "${label}" label`, () => {
        render(<LeadStatusBadge status={status} />);
        expect(screen.getByText(label)).toBeInTheDocument();
      });

      it(`has correct color classes`, () => {
        render(<LeadStatusBadge status={status} />);
        const badge = screen.getByTestId(`lead-status-badge-${status}`);
        expectedClasses.forEach((className) => {
          expect(badge).toHaveClass(className);
        });
      });

      it(`has aria-label for accessibility`, () => {
        render(<LeadStatusBadge status={status} />);
        const badge = screen.getByTestId(`lead-status-badge-${status}`);
        expect(badge).toHaveAttribute('aria-label', `Status: ${label}`);
      });
    });
  });

  it('accepts custom className', () => {
    render(<LeadStatusBadge status="new" className="custom-class" />);
    const badge = screen.getByTestId('lead-status-badge-new');
    expect(badge).toHaveClass('custom-class');
  });
});
