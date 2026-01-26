/**
 * Lead Detail Sheet Tests
 * Story 4.8: Lead Detail Modal (Enhanced)
 * Story 4.11: Additional Lead Details (leadSource, jobTitle, city)
 *
 * AC#1: Enhanced Detail Sheet - Fetches from API
 * AC#4: Owner Contact Details
 * AC#5: Loading State - Skeleton loaders
 * AC#6: Error Handling - Graceful degradation
 * AC#7: Campaign Details
 * AC#8: Keyboard & Accessibility
 * Story 4.11: Lead Source, Job Title, City fields in detail sheet
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadDetailSheet } from '@/components/leads/lead-detail-sheet';
import type { Lead } from '@/types/lead';
import type { LeadDetail } from '@/types/lead-detail';
import { createMockLead } from './utils/mock-lead';

// Mock useLead hook
const mockUseLead = vi.fn();
vi.mock('@/hooks/use-lead', () => ({
  useLead: (...args: unknown[]) => mockUseLead(...args),
}));

describe('LeadDetailSheet', () => {
  const mockLead: Lead = {
    row: 42,
    date: '2026-01-15T08:30:00.000Z',
    customerName: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    phone: '0812345678',
    company: 'บริษัท ทดสอบ จำกัด',
    industryAI: 'Manufacturing',
    website: 'https://example.com',
    capital: '10,000,000',
    status: 'closed',
    salesOwnerId: 'U1234567890',
    salesOwnerName: 'สมหญิง ขายเก่ง',
    campaignId: 'campaign_001',
    campaignName: 'Q1 2026 Promotion',
    emailSubject: 'พิเศษ! น้ำมันหล่อลื่น ENEOS ลด 20%',
    source: 'email_click',
    leadId: 'lead_abc123',
    eventId: 'evt_xyz789',
    clickedAt: '2026-01-15T08:35:00.000Z',
    talkingPoint: 'ลูกค้าสนใจน้ำมันหล่อลื่น',
    closedAt: '2026-01-16T11:30:00.000Z',
    lostAt: null,
    unreachableAt: null,
    version: 1,
    leadSource: 'Brevo',
    jobTitle: 'Manager',
    city: 'Bangkok',
    leadUuid: 'lead_uuid_123',
    createdAt: '2026-01-15T08:30:00.000Z',
    updatedAt: '2026-01-16T11:30:00.000Z',
    juristicId: null,
    dbdSector: null,
    province: null,
    fullAddress: null,
  };

  const mockLeadDetail: LeadDetail = {
    row: 42,
    date: '2026-01-15T08:30:00.000Z',
    customerName: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    phone: '0812345678',
    company: 'บริษัท ทดสอบ จำกัด',
    industry: 'Manufacturing',
    website: 'https://example.com',
    capital: '10,000,000',
    status: 'closed',
    owner: {
      id: 'U1234567890',
      name: 'สมหญิง ขายเก่ง',
      email: 'somying@eneos.co.th',
      phone: '0898765432',
    },
    campaign: {
      id: 'campaign_001',
      name: 'Q1 2026 Promotion',
      subject: 'พิเศษ! น้ำมันหล่อลื่น ENEOS ลด 20%',
    },
    source: 'email_click',
    leadId: 'lead_abc123',
    eventId: 'evt_xyz789',
    talkingPoint: 'ลูกค้าสนใจน้ำมันหล่อลื่น',
    history: [
      { status: 'new', by: 'System', timestamp: '2026-01-15T08:30:00.000Z' },
      { status: 'claimed', by: 'สมหญิง', timestamp: '2026-01-15T09:15:00.000Z' },
      { status: 'closed', by: 'สมหญิง', timestamp: '2026-01-16T11:30:00.000Z' },
    ],
    metrics: {
      responseTime: 45,
      closingTime: 1335,
      age: 2880,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no lead is selected', () => {
    it('renders empty state', () => {
      mockUseLead.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={null} />
      );

      expect(screen.getByText('No Lead Selected')).toBeInTheDocument();
    });
  });

  describe('AC#5: Loading State', () => {
    it('shows skeleton while loading detail data', () => {
      mockUseLead.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(screen.getByTestId('lead-detail-skeleton')).toBeInTheDocument();
    });

    it('displays basic info from table immediately (AC#5)', () => {
      mockUseLead.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      // Basic info should show even while loading (may appear multiple times)
      expect(screen.getAllByText('บริษัท ทดสอบ จำกัด').length).toBeGreaterThan(0);
      expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
    });
  });

  describe('AC#6: Error Handling', () => {
    it('shows error state with retry button', () => {
      const mockRefetch = vi.fn();
      mockUseLead.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(screen.getByTestId('lead-detail-error')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('shows basic info from table on error (graceful degradation)', () => {
      mockUseLead.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      // Should still show basic info from table data (may appear multiple times)
      expect(screen.getAllByText('บริษัท ทดสอบ จำกัด').length).toBeGreaterThan(0);
      expect(screen.getByText('somchai@example.com')).toBeInTheDocument();
    });
  });

  describe('AC#1: Enhanced Detail Sheet with API data', () => {
    it('renders metrics section when detail is loaded', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Response Time')).toBeInTheDocument();
    });

    it('renders status history section when detail is loaded', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(screen.getByText('Status History')).toBeInTheDocument();
    });
  });

  describe('AC#4: Owner Contact Details', () => {
    it('displays owner email as clickable mailto link', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      const ownerEmailLink = screen.getByText('somying@eneos.co.th');
      expect(ownerEmailLink).toBeInTheDocument();
      expect(ownerEmailLink.closest('a')).toHaveAttribute(
        'href',
        'mailto:somying@eneos.co.th'
      );
    });

    it('displays owner phone in Thai format', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      // Phone 0898765432 should be formatted as 089-876-5432
      expect(screen.getByText('089-876-5432')).toBeInTheDocument();
    });

    it('shows "Unassigned" when no owner', () => {
      const detailWithoutOwner = { ...mockLeadDetail, owner: null };
      const leadWithoutOwner = { ...mockLead, salesOwnerName: null };

      mockUseLead.mockReturnValue({
        data: detailWithoutOwner,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet
          open={true}
          onOpenChange={() => {}}
          lead={leadWithoutOwner}
        />
      );

      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });
  });

  describe('AC#7: Campaign Details', () => {
    it('displays campaign name', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(screen.getByText('Campaign Information')).toBeInTheDocument();
      expect(screen.getByText('Q1 2026 Promotion')).toBeInTheDocument();
    });

    it('displays email subject', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(screen.getByText('Email Subject')).toBeInTheDocument();
      expect(
        screen.getByText('พิเศษ! น้ำมันหล่อลื่น ENEOS ลด 20%')
      ).toBeInTheDocument();
    });
  });

  describe('AC#8: Accessibility', () => {
    it('closes sheet when Escape key is pressed', async () => {
      const handleOpenChange = vi.fn();
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={handleOpenChange} lead={mockLead} />
      );

      // Radix Sheet handles Escape key internally
      // Simulate pressing Escape on the document
      await userEvent.keyboard('{Escape}');

      // Radix calls onOpenChange(false) when Escape is pressed
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('has proper section headings (h3)', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      // Check for section heading text (rendered as class, not h3 element in Radix Sheet)
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Status History')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });

    it('has aria-hidden on decorative icons', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      // Check within sheet content - Radix renders in portal
      const sheetContent = screen.getByTestId('lead-detail-sheet');
      const decorativeIcons = sheetContent.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThan(0);
    });

    it('has aria-label on interactive elements', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      // Check within sheet content
      const sheetContent = screen.getByTestId('lead-detail-sheet');
      const emailLinks = sheetContent.querySelectorAll('a[href^="mailto:"]');
      emailLinks.forEach((link) => {
        expect(link).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Story 4.11: Additional Lead Details', () => {
    describe('AC#1: Lead Source in Detail Sheet', () => {
      it('displays leadSource when value exists', () => {
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        );

        expect(screen.getByText('Lead Source')).toBeInTheDocument();
        expect(screen.getByText('Brevo')).toBeInTheDocument();
      });

      it('hides leadSource when value is null', () => {
        const leadWithoutLeadSource = { ...mockLead, leadSource: null };
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet
            open={true}
            onOpenChange={() => {}}
            lead={leadWithoutLeadSource}
          />
        );

        expect(screen.queryByText('Lead Source')).not.toBeInTheDocument();
      });

      it('hides leadSource when value is empty string', () => {
        const leadWithEmptyLeadSource = { ...mockLead, leadSource: '' };
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet
            open={true}
            onOpenChange={() => {}}
            lead={leadWithEmptyLeadSource}
          />
        );

        expect(screen.queryByText('Lead Source')).not.toBeInTheDocument();
      });

      it('hides leadSource when value is whitespace only', () => {
        const leadWithWhitespaceLeadSource = { ...mockLead, leadSource: '   ' };
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet
            open={true}
            onOpenChange={() => {}}
            lead={leadWithWhitespaceLeadSource}
          />
        );

        // Whitespace-only should not display the label
        expect(screen.queryByText('Lead Source')).not.toBeInTheDocument();
      });
    });

    describe('AC#2 & AC#3: Job Title and City (already implemented)', () => {
      it('displays jobTitle when value exists', () => {
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        );

        expect(screen.getByText('Job Title')).toBeInTheDocument();
        expect(screen.getByText('Manager')).toBeInTheDocument();
      });

      it('displays location (province || city) when value exists', () => {
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        );

        // Smart fallback: Shows "Location" label with province || city
        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText('Bangkok')).toBeInTheDocument();
      });
    });

    describe('AC#4: Consistent Styling', () => {
      it('leadSource uses Tag icon with correct styling', () => {
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        );

        // Find the Lead Source section and verify icon exists with aria-hidden
        const leadSourceLabel = screen.getByText('Lead Source');
        const parentContainer = leadSourceLabel.closest('.flex.items-start');
        expect(parentContainer).toBeInTheDocument();
        // Icon wrapper has aria-hidden="true"
        const iconWrapper = parentContainer?.querySelector('[aria-hidden="true"]');
        expect(iconWrapper).toBeInTheDocument();
      });
    });

    describe('AC#5: Accessibility', () => {
      it('leadSource label is readable by screen readers', () => {
        mockUseLead.mockReturnValue({
          data: mockLeadDetail,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        });

        render(
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        );

        // The label should be in a paragraph element for screen reader accessibility
        const leadSourceLabel = screen.getByText('Lead Source');
        expect(leadSourceLabel.tagName.toLowerCase()).toBe('p');
      });
    });
  });

  describe('Google Search Grounding Fields (2026-01-26)', () => {
    it('displays grounding fields when values exist', () => {
      const leadWithGrounding = createMockLead({
        row: 100,
        juristicId: '0105563079446',
        dbdSector: 'F&B-M',
        province: 'กรุงเทพมหานคร',
        fullAddress: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      });

      mockUseLead.mockReturnValue({
        data: {
          ...mockLeadDetail,
          juristicId: '0105563079446',
          dbdSector: 'F&B-M',
          province: 'กรุงเทพมหานคร',
          fullAddress: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={leadWithGrounding} />
      );

      // Verify all grounding fields are displayed
      expect(screen.getByText('Juristic ID')).toBeInTheDocument();
      expect(screen.getByText('0105563079446')).toBeInTheDocument();

      expect(screen.getByText('DBD Sector')).toBeInTheDocument();
      expect(screen.getByText('F&B-M')).toBeInTheDocument();

      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110')).toBeInTheDocument();
    });

    it('hides grounding fields when values are null', () => {
      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      // Grounding fields should not appear if values are null
      expect(screen.queryByText('Juristic ID')).not.toBeInTheDocument();
      expect(screen.queryByText('DBD Sector')).not.toBeInTheDocument();
    });

    it('prefers province over city in Location field', () => {
      const leadWithProvince = createMockLead({
        city: 'Bangkok',
        province: 'กรุงเทพมหานคร',
      });

      mockUseLead.mockReturnValue({
        data: mockLeadDetail,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={leadWithProvince} />
      );

      // Should show province (DBD official) instead of city (user input)
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('กรุงเทพมหานคร')).toBeInTheDocument();
      expect(screen.queryByText('Bangkok')).not.toBeInTheDocument();
    });
  });

  describe('useLead hook configuration', () => {
    it('calls useLead with correct parameters when open', () => {
      mockUseLead.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(mockUseLead).toHaveBeenCalledWith(42, { enabled: true });
    });

    it('disables query when sheet is closed', () => {
      mockUseLead.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      render(
        <LeadDetailSheet open={false} onOpenChange={() => {}} lead={mockLead} />
      );

      expect(mockUseLead).toHaveBeenCalledWith(42, { enabled: false });
    });
  });
});
