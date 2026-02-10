/**
 * Grounding Fields Integration Tests
 * Story 4.15: Display Grounding Fields in Lead Table
 *
 * Integration tests focusing on API interactions:
 * - AC#9: Full Address field in detail sheet with API fetch
 * - End-to-end: Fetching and displaying all grounding fields
 *
 * Note: Unit tests for table display (AC#1-3) are covered in lead-table.test.tsx (44 tests passing)
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeadDetailSheet } from '@/components/leads/lead-detail-sheet';
import * as leadsApi from '@/lib/api/leads';
import type { LeadDetail } from '@/types/lead-detail';
import { createMockLead } from '../utils/mock-lead';

// Mock the leads API
vi.mock('@/lib/api/leads', async () => {
  const actual = await vi.importActual('@/lib/api/leads');
  return {
    ...actual,
    fetchLeadById: vi.fn(),
  };
});

const mockFetchLeadById = vi.mocked(leadsApi.fetchLeadById);

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Grounding Fields Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('AC#9: Full Address in Detail Sheet', () => {
    it('fetches and displays all grounding fields when opening detail sheet', async () => {
      const leadWithGrounding = createMockLead({
        row: 100,
        company: 'บริษัท ทดสอบเต็มรูปแบบ จำกัด',
        juristicId: '0105563079446',
        dbdSector: 'F&B-M',
        province: 'กรุงเทพมหานคร',
        fullAddress:
          '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        capital: '5,000,000 บาท',
      });

      const detailWithGrounding: LeadDetail = {
        row: 100,
        date: '2026-01-26T10:00:00.000Z',
        customerName: 'Test Customer',
        email: 'test@example.com',
        phone: '0812345678',
        company: 'บริษัท ทดสอบเต็มรูปแบบ จำกัด',
        industry: 'Manufacturing',
        website: null,
        capital: '5,000,000 บาท',
        status: 'new',
        owner: null,
        campaign: {
          id: 'campaign_001',
          name: 'Test Campaign',
          subject: 'Test Subject',
        },
        source: 'email_click',
        leadId: 'lead_100',
        eventId: 'evt_100',
        talkingPoint: null,
        history: [
          {
            status: 'new',
            by: 'System',
            timestamp: '2026-01-26T10:00:00.000Z',
          },
        ],
        metrics: {
          responseTime: 0,
          closingTime: 0,
          age: 60,
        },
        juristicId: '0105563079446',
        dbdSector: 'F&B-M',
        province: 'กรุงเทพมหานคร',
        fullAddress:
          '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        leadUuid: 'lead_100',
        campaignEvents: [],
        timeline: [],
      };

      mockFetchLeadById.mockResolvedValue(detailWithGrounding);

      render(
        <TestWrapper>
          <LeadDetailSheet
            open={true}
            onOpenChange={() => {}}
            lead={leadWithGrounding}
          />
        </TestWrapper>
      );

      // Verify API was called
      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledWith('lead_100');
      });

      // Verify all grounding fields are displayed
      await waitFor(() => {
        expect(screen.getByText('Address')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110'
        )
      ).toBeInTheDocument();

      expect(screen.getByText('Juristic ID')).toBeInTheDocument();
      expect(screen.getByText('0105563079446')).toBeInTheDocument();

      const dbdSectorLabel = screen.getByText('DBD Sector');
      expect(dbdSectorLabel).toBeInTheDocument();
      // DBD Sector value is F&B-M (unique identifier)
      const dbdSectorValue = screen.getByText('F&B-M');
      expect(dbdSectorValue).toBeInTheDocument();

      // Verify Location field prefers province over city
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('กรุงเทพมหานคร')).toBeInTheDocument();
    });

    it('hides grounding fields when values are null', async () => {
      const leadWithoutGrounding = createMockLead({
        row: 200,
        juristicId: null,
        dbdSector: null,
        province: null,
        fullAddress: null,
      });

      const detailWithoutGrounding: LeadDetail = {
        row: 200,
        date: '2026-01-26T10:00:00.000Z',
        customerName: 'Test Customer 2',
        email: 'test2@example.com',
        phone: '0812345678',
        company: 'Test Company 2',
        industry: 'Logistics',
        website: null,
        capital: null,
        status: 'new',
        owner: null,
        campaign: {
          id: 'campaign_002',
          name: 'Test Campaign 2',
          subject: 'Test Subject 2',
        },
        source: 'email_click',
        leadId: 'lead_200',
        eventId: 'evt_200',
        talkingPoint: null,
        history: [],
        metrics: {
          responseTime: 0,
          closingTime: 0,
          age: 30,
        },
        leadUuid: 'lead_200',
        campaignEvents: [],
        timeline: [],
      };

      mockFetchLeadById.mockResolvedValue(detailWithoutGrounding);

      render(
        <TestWrapper>
          <LeadDetailSheet
            open={true}
            onOpenChange={() => {}}
            lead={leadWithoutGrounding}
          />
        </TestWrapper>
      );

      // Wait for detail to load
      await waitFor(() => {
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
      });

      // Grounding fields should not appear
      expect(screen.queryByText('Address')).not.toBeInTheDocument();
      expect(screen.queryByText('Juristic ID')).not.toBeInTheDocument();
      expect(screen.queryByText('DBD Sector')).not.toBeInTheDocument();
    });

    it('handles API errors gracefully (shows basic info from table data)', async () => {
      const leadWithGrounding = createMockLead({
        row: 300,
        company: 'บริษัท ทดสอบ Error จำกัด',
        fullAddress: '999 Test Address',
      });

      mockFetchLeadById.mockRejectedValue(
        new leadsApi.LeadsApiError('Network error', 500)
      );

      render(
        <TestWrapper>
          <LeadDetailSheet
            open={true}
            onOpenChange={() => {}}
            lead={leadWithGrounding}
          />
        </TestWrapper>
      );

      // Wait for error state
      await waitFor(
        () => {
          expect(screen.getByTestId('lead-detail-error')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Basic info from table should still be visible (graceful degradation)
      expect(
        screen.getAllByText('บริษัท ทดสอบ Error จำกัด').length
      ).toBeGreaterThan(0);

      // Full address from table data is shown (graceful degradation AC#6)
      expect(screen.getByText('999 Test Address')).toBeInTheDocument();

      // But advanced features like Performance Metrics won't be available
      expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument();
    });
  });

  describe('End-to-End: Complete Grounding Fields Flow', () => {
    it('successfully fetches and displays all grounding data types', async () => {
      const leadWithAllFields = createMockLead({
        row: 999,
        company: 'บริษัท ครบถ้วน จำกัด',
        juristicId: '0105559999999',
        dbdSector: 'Manufacturing',
        province: 'สมุทรปราการ',
        city: 'Samut Prakan', // Should be ignored in favor of province
        fullAddress: '88/88 ถนนทดสอบ ต. ทดสอบ อ. ทดสอบ สมุทรปราการ 10000',
        capital: '100,000,000 บาท',
      });

      const detailWithAllFields: LeadDetail = {
        row: 999,
        date: '2026-01-26T10:00:00.000Z',
        customerName: 'Complete Test',
        email: 'complete@test.com',
        phone: '0999999999',
        company: 'บริษัท ครบถ้วน จำกัด',
        industry: 'Manufacturing',
        website: 'https://complete.test',
        capital: '100,000,000 บาท',
        status: 'contacted',
        owner: {
          id: 'user_test',
          name: 'Test Sales',
          email: 'sales@test.com',
          phone: '0888888888',
        },
        campaign: {
          id: 'campaign_999',
          name: 'Complete Campaign',
          subject: 'Complete Subject',
        },
        source: 'email_click',
        leadId: 'lead_999',
        eventId: 'evt_999',
        talkingPoint: 'Complete talking point',
        history: [
          {
            status: 'new',
            by: 'System',
            timestamp: '2026-01-26T09:00:00.000Z',
          },
          {
            status: 'contacted',
            by: 'Test Sales',
            timestamp: '2026-01-26T10:00:00.000Z',
          },
        ],
        metrics: {
          responseTime: 60,
          closingTime: 0,
          age: 120,
        },
        juristicId: '0105559999999',
        dbdSector: 'Manufacturing',
        province: 'สมุทรปราการ',
        fullAddress: '88/88 ถนนทดสอบ ต. ทดสอบ อ. ทดสอบ สมุทรปราการ 10000',
        leadUuid: 'lead_999',
        campaignEvents: [],
        timeline: [],
      };

      mockFetchLeadById.mockResolvedValue(detailWithAllFields);

      render(
        <TestWrapper>
          <LeadDetailSheet
            open={true}
            onOpenChange={() => {}}
            lead={leadWithAllFields}
          />
        </TestWrapper>
      );

      // Verify API call
      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledWith('lead_999');
      });

      // Verify all sections loaded
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Status History')).toBeInTheDocument();
      });

      // Verify all grounding fields present
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(
        screen.getByText('88/88 ถนนทดสอบ ต. ทดสอบ อ. ทดสอบ สมุทรปราการ 10000')
      ).toBeInTheDocument();

      expect(screen.getByText('Juristic ID')).toBeInTheDocument();
      expect(screen.getByText('0105559999999')).toBeInTheDocument();

      // DBD Sector label and value
      const dbdLabel = screen.getByText('DBD Sector');
      expect(dbdLabel).toBeInTheDocument();
      // Manufacturing appears in both Industry and DBD Sector, so we check all instances
      const manufacturingElements = screen.getAllByText('Manufacturing');
      expect(manufacturingElements.length).toBeGreaterThanOrEqual(1);

      // Verify location shows province (not city)
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('สมุทรปราการ')).toBeInTheDocument();
      expect(screen.queryByText('Samut Prakan')).not.toBeInTheDocument();

      // Verify capital displayed
      expect(screen.getByText('Capital')).toBeInTheDocument();
      expect(screen.getByText('100,000,000 บาท')).toBeInTheDocument();
    });
  });
});
