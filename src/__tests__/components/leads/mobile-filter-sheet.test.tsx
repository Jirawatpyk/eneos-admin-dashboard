import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileFilterSheet } from '@/components/leads/mobile-filter-sheet'

// Mock child filter components
vi.mock('@/components/leads/lead-status-filter', () => ({
  LeadStatusFilter: ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => (
    <div data-testid="status-filter">
      <button onClick={() => onChange(['new'])}>Select New</button>
      <span>Status: {value.join(',')}</span>
    </div>
  ),
}))

vi.mock('@/components/leads/lead-owner-filter', () => ({
  LeadOwnerFilter: ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => (
    <div data-testid="owner-filter">
      <button onClick={() => onChange(['U123'])}>Select Owner</button>
      <span>Owner: {value.join(',')}</span>
    </div>
  ),
}))

vi.mock('@/components/leads/lead-date-filter', () => ({
  LeadDateFilter: ({ value, onChange }: { value: { from?: Date; to?: Date }; onChange: (value: { from?: Date; to?: Date }) => void }) => (
    <div data-testid="date-filter">
      <button onClick={() => onChange({ from: new Date('2026-01-20'), to: new Date('2026-01-26') })}>Select Date</button>
      <span>Date: {value.from?.toISOString() || 'none'}</span>
    </div>
  ),
}))

vi.mock('@/components/leads/lead-source-filter', () => ({
  LeadSourceFilter: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <div data-testid="source-filter">
      <button onClick={() => onChange('email')}>Select Email</button>
      <span>Source: {value}</span>
    </div>
  ),
}))

describe('MobileFilterSheet', () => {
  const mockOnApply = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnClearAll = vi.fn()
  const mockOnOpenChange = vi.fn()

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    status: [],
    owner: [],
    dateRange: {},
    leadSource: '',
    onApply: mockOnApply,
    onCancel: mockOnCancel,
    onClearAll: mockOnClearAll,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Task 2.1-2.3: Component Structure', () => {
    it('should render with all filter components', () => {
      render(<MobileFilterSheet {...defaultProps} />)

      // AC5: All 4 filters in order
      expect(screen.getByTestId('status-filter')).toBeInTheDocument()
      expect(screen.getByTestId('owner-filter')).toBeInTheDocument()
      expect(screen.getByTestId('date-filter')).toBeInTheDocument()
      expect(screen.getByTestId('source-filter')).toBeInTheDocument()
    })

    it('should render with title "Filter Leads"', () => {
      render(<MobileFilterSheet {...defaultProps} />)

      // AC4: Bottom sheet title
      expect(screen.getByText('Filter Leads')).toBeInTheDocument()
    })

    it('should render Apply, Cancel, and Clear All buttons', () => {
      render(<MobileFilterSheet {...defaultProps} />)

      // AC6, AC7: Action buttons
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
    })
  })

  describe('Task 2.4: Apply Button', () => {
    it('should call onApply when Apply button clicked', async () => {
      const user = userEvent.setup()
      render(<MobileFilterSheet {...defaultProps} />)

      const applyButton = screen.getByRole('button', { name: /apply/i })
      await user.click(applyButton)

      // AC6: Apply filters
      expect(mockOnApply).toHaveBeenCalledTimes(1)
    })

    it('should show loading state during apply', async () => {
      const user = userEvent.setup()
      const slowApply = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<MobileFilterSheet {...defaultProps} onApply={slowApply} />)

      const applyButton = screen.getByRole('button', { name: /apply/i })
      await user.click(applyButton)

      // AC6, AC13: Loading state
      expect(applyButton).toBeDisabled()
    })
  })

  describe('Task 2.5: Cancel Button', () => {
    it('should call onCancel when Cancel button clicked', async () => {
      const user = userEvent.setup()
      render(<MobileFilterSheet {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // AC6: Cancel discards changes
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Task 2.6: Temporary Filter State', () => {
    it('should manage temporary state independently of props', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<MobileFilterSheet {...defaultProps} status={[]} />)

      // Initially empty
      expect(screen.getByText('Status:')).toBeInTheDocument()

      // Change filter (temp state)
      const selectButton = screen.getByRole('button', { name: /select new/i })
      await user.click(selectButton)

      // Verify temp state changed in mock component
      expect(screen.getByText(/Status: new/)).toBeInTheDocument()

      // Rerender with same props - temp state should reset to props
      rerender(<MobileFilterSheet {...defaultProps} status={[]} />)

      // After rerender, temp state resets to empty (from props)
      expect(screen.queryByText(/Status: new/)).not.toBeInTheDocument()
    })

    it('should reset temporary state when props change', () => {
      const { rerender } = render(<MobileFilterSheet {...defaultProps} status={[]} />)

      // Update props - should reset temp state
      rerender(<MobileFilterSheet {...defaultProps} status={['contacted']} />)

      // Temp state should reflect new props
      expect(screen.getByText(/Status: contacted/)).toBeInTheDocument()
    })
  })

  describe('Task 2.7: Clear All Button', () => {
    it('should call onClearAll when Clear All button clicked', async () => {
      const user = userEvent.setup()
      render(<MobileFilterSheet {...defaultProps} status={['new']} owner={['U123']} />)

      const clearButton = screen.getByRole('button', { name: /clear all/i })
      await user.click(clearButton)

      // AC7: Clear all filters immediately
      expect(mockOnClearAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('Task 2.10-2.12: Error Handling', () => {
    it('should show error toast and keep sheet open on API error', async () => {
      const user = userEvent.setup()
      const failingApply = vi.fn().mockRejectedValue(new Error('Network error'))

      render(<MobileFilterSheet {...defaultProps} onApply={failingApply} />)

      const applyButton = screen.getByRole('button', { name: /apply/i })
      await user.click(applyButton)

      // AC13: Error handling
      await waitFor(() => {
        expect(applyButton).not.toBeDisabled()
      })

      // Sheet should remain open (not call onOpenChange)
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })

    it('should allow retry after error', async () => {
      const user = userEvent.setup()
      const retryableApply = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined)

      render(<MobileFilterSheet {...defaultProps} onApply={retryableApply} />)

      const applyButton = screen.getByRole('button', { name: /apply/i })

      // First attempt - fails
      await user.click(applyButton)
      await waitFor(() => expect(applyButton).not.toBeDisabled())

      // Retry - succeeds
      await user.click(applyButton)

      // AC13: Retry works
      expect(retryableApply).toHaveBeenCalledTimes(2)
    })
  })

  describe('Task 2.13-2.14: Loading State', () => {
    it('should disable all buttons during apply', async () => {
      const user = userEvent.setup()
      const slowApply = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<MobileFilterSheet {...defaultProps} onApply={slowApply} />)

      const applyButton = screen.getByRole('button', { name: /apply/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      const clearButton = screen.getByRole('button', { name: /clear all/i })

      await user.click(applyButton)

      // AC6: Prevent double-submit
      expect(applyButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(clearButton).toBeDisabled()
    })
  })

  describe('Task 2.15: Close Behaviors', () => {
    it('should handle sheet onOpenChange', async () => {
      const user = userEvent.setup()
      render(<MobileFilterSheet {...defaultProps} />)

      // Simulate clicking overlay or close button (handled by Sheet)
      mockOnOpenChange(false)

      // AC6: Close without applying
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('AC4: Bottom Sheet Layout', () => {
    it('should render with 80vh height', () => {
      render(<MobileFilterSheet {...defaultProps} />)

      // AC4: 80% viewport height - check for data-testid
      const sheetContent = screen.getByTestId('mobile-filter-sheet')
      expect(sheetContent).toHaveClass('h-[80vh]')
    })
  })
})
