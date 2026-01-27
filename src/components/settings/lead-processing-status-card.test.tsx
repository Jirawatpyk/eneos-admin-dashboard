/**
 * Lead Processing Status Card Component Tests
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 * AC#5: Tests (Quality Gate)
 *
 * Tests for LeadProcessingStatusCard component
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LeadProcessingStatusCard } from './lead-processing-status-card';

// Mock the hook
const mockRefetch = vi.fn();
const mockUseAllLeadStatus = vi.fn();

vi.mock('@/hooks/use-lead-status', () => ({
  useAllLeadStatus: () => mockUseAllLeadStatus(),
}));

// Mock data
const mockActiveLeads = [
  {
    correlationId: 'uuid-123',
    status: 'processing' as const,
    progress: 60,
    currentStep: 'Saving to Google Sheets',
    createdAt: '2026-01-27T10:00:00Z',
    updatedAt: '2026-01-27T10:00:05Z',
  },
  {
    correlationId: 'uuid-456',
    status: 'pending' as const,
    progress: 0,
    createdAt: '2026-01-27T10:01:00Z',
    updatedAt: '2026-01-27T10:01:00Z',
  },
];

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryWrapper';
  return Wrapper;
}

describe('LeadProcessingStatusCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockReset();
  });

  describe('AC#3: Loading State', () => {
    it('shows skeleton when loading', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: [],
        total: 0,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('lead-processing-status-skeleton')).toBeInTheDocument();
    });
  });

  describe('AC#4: Error State', () => {
    it('shows error message when fetch fails', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: [],
        total: 0,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('lead-processing-status-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Unable to fetch processing status'
      );
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', async () => {
      mockRefetch.mockResolvedValue(undefined);
      mockUseAllLeadStatus.mockReturnValue({
        data: [],
        total: 0,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('AC#3: Empty State', () => {
    it('shows empty state when no active processing', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: [],
        total: 0,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('lead-processing-status-empty')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No active lead processing')).toBeInTheDocument();
      expect(screen.getByText('All leads processed successfully')).toBeInTheDocument();
    });
  });

  describe('AC#3: Success State with Data', () => {
    it('renders card with active leads', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: mockActiveLeads,
        total: 2,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('lead-processing-status-card')).toBeInTheDocument();
      expect(screen.getByTestId('total-count-badge')).toHaveTextContent('2 active');
    });

    it('displays status rows for each lead', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: mockActiveLeads,
        total: 2,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });

      // Check both rows exist
      expect(screen.getByTestId('status-row-uuid-123')).toBeInTheDocument();
      expect(screen.getByTestId('status-row-uuid-456')).toBeInTheDocument();

      // Check status badges
      const badges = screen.getAllByTestId('status-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('Processing');
      expect(badges[1]).toHaveTextContent('Pending');
    });

    it('shows progress bar for non-completed status', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: [mockActiveLeads[0]], // Processing status with progress
        total: 1,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('status-progress')).toBeInTheDocument();
      expect(screen.getByTestId('status-step')).toHaveTextContent(
        'Saving to Google Sheets'
      );
    });

    it('shows relative time for each lead', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: mockActiveLeads,
        total: 2,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });

      const times = screen.getAllByTestId('status-time');
      expect(times).toHaveLength(2);
      // formatDistanceToNow generates relative time like "5 seconds ago"
      expect(times[0]).toBeInTheDocument();
      expect(times[1]).toBeInTheDocument();
    });
  });

  describe('AC#3: Refresh Button', () => {
    it('renders refresh button', () => {
      mockUseAllLeadStatus.mockReturnValue({
        data: mockActiveLeads,
        total: 2,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('calls refetch when refresh button is clicked', async () => {
      mockRefetch.mockResolvedValue(undefined);
      mockUseAllLeadStatus.mockReturnValue({
        data: mockActiveLeads,
        total: 2,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });
      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('AC#3: Status Badge Colors', () => {
    it('shows correct badge variant for each status', () => {
      const leadsWithAllStatuses = [
        { ...mockActiveLeads[0], status: 'pending' as const },
        { ...mockActiveLeads[0], correlationId: 'uuid-789', status: 'processing' as const },
        {
          ...mockActiveLeads[0],
          correlationId: 'uuid-abc',
          status: 'completed' as const,
          progress: 100,
        },
        {
          ...mockActiveLeads[0],
          correlationId: 'uuid-def',
          status: 'failed' as const,
          progress: 50,
        },
      ];

      mockUseAllLeadStatus.mockReturnValue({
        data: leadsWithAllStatuses,
        total: 4,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<LeadProcessingStatusCard />, { wrapper: createWrapper() });

      const badges = screen.getAllByTestId('status-badge');
      expect(badges).toHaveLength(4);
      expect(badges[0]).toHaveTextContent('Pending'); // Gray
      expect(badges[1]).toHaveTextContent('Processing'); // Blue
      expect(badges[2]).toHaveTextContent('Completed'); // Green
      expect(badges[3]).toHaveTextContent('Failed'); // Red
    });
  });
});
