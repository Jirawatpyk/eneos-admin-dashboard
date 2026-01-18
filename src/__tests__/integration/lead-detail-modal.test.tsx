/**
 * Lead Detail Modal Integration Tests
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#1: Test clicking row opens Sheet and fetches detail
 * AC#9: Test data refresh after filter change
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeadDetailSheet } from '@/components/leads/lead-detail-sheet';
import * as leadsApi from '@/lib/api/leads';
import type { Lead } from '@/types/lead';
import type { LeadDetail } from '@/types/lead-detail';

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

describe('Lead Detail Modal Integration', () => {
  const mockLead: Lead = {
    row: 42,
    date: '2026-01-15T08:30:00.000Z',
    customerName: 'Test Customer',
    email: 'test@example.com',
    phone: '0812345678',
    company: 'Test Company',
    industryAI: 'Manufacturing',
    website: 'https://test.com',
    capital: '10,000,000',
    status: 'new',
    salesOwnerId: null,
    salesOwnerName: null,
    campaignId: 'campaign_001',
    campaignName: 'Test Campaign',
    emailSubject: 'Test Subject',
    source: 'email_click',
    leadId: 'lead_123',
    eventId: 'evt_456',
    clickedAt: '2026-01-15T08:35:00.000Z',
    talkingPoint: 'Test talking point',
    closedAt: null,
    lostAt: null,
    unreachableAt: null,
    version: 1,
    leadSource: 'Brevo',
    jobTitle: 'Manager',
    city: 'Bangkok',
    leadUuid: 'uuid_123',
    createdAt: '2026-01-15T08:30:00.000Z',
    updatedAt: null,
  };

  const mockLeadDetail: LeadDetail = {
    row: 42,
    date: '2026-01-15T08:30:00.000Z',
    customerName: 'Test Customer',
    email: 'test@example.com',
    phone: '0812345678',
    company: 'Test Company',
    industry: 'Manufacturing',
    website: 'https://test.com',
    capital: '10,000,000',
    status: 'new',
    owner: null,
    campaign: {
      id: 'campaign_001',
      name: 'Test Campaign',
      subject: 'Test Subject',
    },
    source: 'email_click',
    leadId: 'lead_123',
    eventId: 'evt_456',
    talkingPoint: 'Test talking point',
    history: [
      { status: 'new', by: 'System', timestamp: '2026-01-15T08:30:00.000Z' },
    ],
    metrics: {
      responseTime: 0,
      closingTime: 0,
      age: 120,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('AC#1: Fetches detail when Sheet opens', () => {
    it('calls API when sheet opens with lead', async () => {
      mockFetchLeadById.mockResolvedValue(mockLeadDetail);

      render(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledWith(42);
      });
    });

    it('displays fetched detail data', async () => {
      mockFetchLeadById.mockResolvedValue(mockLeadDetail);

      render(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Status History')).toBeInTheDocument();
      });
    });

    it('does not call API when sheet is closed', () => {
      mockFetchLeadById.mockResolvedValue(mockLeadDetail);

      render(
        <TestWrapper>
          <LeadDetailSheet open={false} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      expect(mockFetchLeadById).not.toHaveBeenCalled();
    });
  });

  describe('AC#6: Network error handling', () => {
    it('shows error state when API fails', async () => {
      mockFetchLeadById.mockRejectedValue(
        new leadsApi.LeadsApiError('Network error', 500)
      );

      render(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      // Wait for error state with longer timeout (retry attempts)
      await waitFor(
        () => {
          expect(screen.getByTestId('lead-detail-error')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('retries when retry button is clicked', async () => {
      const user = userEvent.setup();

      // First calls fail (for retry attempts), then succeeds
      mockFetchLeadById
        .mockRejectedValueOnce(new leadsApi.LeadsApiError('Network error', 500))
        .mockRejectedValueOnce(new leadsApi.LeadsApiError('Network error', 500))
        .mockRejectedValueOnce(new leadsApi.LeadsApiError('Network error', 500))
        .mockResolvedValueOnce(mockLeadDetail);

      render(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      // Wait for error state (after all retries)
      await waitFor(
        () => {
          expect(screen.getByTestId('retry-button')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Click retry
      await user.click(screen.getByTestId('retry-button'));

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      });
    });

    it('shows basic info from table even on error (graceful degradation)', async () => {
      mockFetchLeadById.mockRejectedValue(
        new leadsApi.LeadsApiError('Network error', 500)
      );

      render(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('lead-detail-error')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Basic info should still be visible
      expect(screen.getAllByText('Test Company').length).toBeGreaterThan(0);
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
    });
  });

  describe('AC#9: Cache and refresh behavior', () => {
    it('uses cached data on reopening within staleTime', async () => {
      mockFetchLeadById.mockResolvedValue(mockLeadDetail);

      const { rerender } = render(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      });

      expect(mockFetchLeadById).toHaveBeenCalledTimes(1);

      // Close and reopen sheet
      rerender(
        <TestWrapper>
          <LeadDetailSheet open={false} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      rerender(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      // Still only 1 call due to caching
      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledTimes(1);
      });
    });

    it('fetches fresh data for different lead', async () => {
      mockFetchLeadById.mockResolvedValue(mockLeadDetail);

      const { rerender } = render(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={mockLead} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledWith(42);
      });

      const differentLead = { ...mockLead, row: 99 };
      const differentDetail = { ...mockLeadDetail, row: 99 };
      mockFetchLeadById.mockResolvedValue(differentDetail);

      rerender(
        <TestWrapper>
          <LeadDetailSheet open={true} onOpenChange={() => {}} lead={differentLead} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledWith(99);
      });
    });
  });
});
