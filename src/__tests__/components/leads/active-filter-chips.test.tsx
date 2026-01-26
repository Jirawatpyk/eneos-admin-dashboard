import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActiveFilterChips } from '@/components/leads/active-filter-chips'

describe('ActiveFilterChips', () => {
  const mockOnRemove = vi.fn()

  describe('Task 3.2: Display chips for each active filter type', () => {
    it('should render no chips when no filters active', () => {
      const { container } = render(
        <ActiveFilterChips
          status={[]}
          owner={[]}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // AC3: Show chips only when filters are active
      expect(container.firstChild).toBeNull()
    })

    it('should render status chip for single value', () => {
      render(
        <ActiveFilterChips
          status={['new']}
          owner={[]}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // AC3: "Status: New" with X button
      expect(screen.getByText(/Status:/)).toBeInTheDocument()
      expect(screen.getByText(/New/)).toBeInTheDocument()
    })

    it('should render status chip for multiple values (2-3)', () => {
      render(
        <ActiveFilterChips
          status={['new', 'contacted']}
          owner={[]}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // Task 3.3b: 2-3 values - show all
      expect(screen.getByText(/Status:/)).toBeInTheDocument()
      expect(screen.getByText(/New, Contacted/)).toBeInTheDocument()
    })

    it('should render status chip for 4+ values (collapsed)', () => {
      render(
        <ActiveFilterChips
          status={['new', 'contacted', 'closed', 'lost']}
          owner={[]}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // Task 3.3c: 4+ values - collapsed format
      expect(screen.getByText(/Status:/)).toBeInTheDocument()
      expect(screen.getByText(/4 selected/)).toBeInTheDocument()
    })

    it('should render owner chip for single value', () => {
      const ownerNames = { U123: 'John Doe' }

      render(
        <ActiveFilterChips
          status={[]}
          owner={['U123']}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={ownerNames}
        />
      )

      // AC3: "Owner: John Doe" with X button
      expect(screen.getByText(/Owner:/)).toBeInTheDocument()
      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    })

    it('should render owner chip for multiple values', () => {
      const ownerNames = {
        U123: 'John Doe',
        U456: 'Jane Smith',
        U789: 'Bob Johnson',
      }

      render(
        <ActiveFilterChips
          status={[]}
          owner={['U123', 'U456', 'U789']}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={ownerNames}
        />
      )

      // AC3: "Owner: 3 selected" with X button
      expect(screen.getByText(/Owner:/)).toBeInTheDocument()
      expect(screen.getByText(/3 selected/)).toBeInTheDocument()
    })

    it('should render date chip for preset', () => {
      const dateRange = {
        from: new Date('2026-01-20'),
        to: new Date('2026-01-26'),
        preset: 'last7days',
      }

      render(
        <ActiveFilterChips
          status={[]}
          owner={[]}
          dateRange={dateRange}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // AC3: "Date: Last 7 Days" with X button
      expect(screen.getByText(/Date:/)).toBeInTheDocument()
      expect(screen.getByText(/Last 7 Days/)).toBeInTheDocument()
    })

    it('should render date chip for custom range', () => {
      const dateRange = {
        from: new Date('2026-01-20'),
        to: new Date('2026-01-26'),
      }

      render(
        <ActiveFilterChips
          status={[]}
          owner={[]}
          dateRange={dateRange}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // Date range format
      expect(screen.getByText(/Date:/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 20 - Jan 26/)).toBeInTheDocument()
    })

    it('should render source chip', () => {
      render(
        <ActiveFilterChips
          status={[]}
          owner={[]}
          dateRange={{}}
          leadSource="email"
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // AC3: "Source: Email" with X button
      expect(screen.getByText(/Source:/)).toBeInTheDocument()
      expect(screen.getByText(/Email/)).toBeInTheDocument()
    })

    it('should render multiple chip types together', () => {
      const ownerNames = { U123: 'John Doe' }

      render(
        <ActiveFilterChips
          status={['new']}
          owner={['U123']}
          dateRange={{ from: new Date('2026-01-20'), to: new Date('2026-01-26') }}
          leadSource="email"
          onRemove={mockOnRemove}
          ownerNames={ownerNames}
        />
      )

      // All chip types
      expect(screen.getByText(/Status:/)).toBeInTheDocument()
      expect(screen.getByText(/Owner:/)).toBeInTheDocument()
      expect(screen.getByText(/Date:/)).toBeInTheDocument()
      expect(screen.getByText(/Source:/)).toBeInTheDocument()
    })
  })

  describe('Task 3.3d: Long name truncation', () => {
    it('should truncate long owner name', () => {
      const ownerNames = { U123: 'This is a very long owner name that should be truncated' }

      render(
        <ActiveFilterChips
          status={[]}
          owner={['U123']}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={ownerNames}
        />
      )

      // Max 20 chars with ellipsis
      const chipText = screen.getByText(/Owner:/).closest('div')
      expect(chipText?.textContent?.length).toBeLessThan(30) // "Owner: " + 20 chars + "..."
    })
  })

  describe('Task 3.4: X button for chip removal', () => {
    it('should have X button on each chip', () => {
      render(
        <ActiveFilterChips
          status={['new']}
          owner={[]}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      // AC3: X button (44x44px touch target)
      const removeButton = screen.getByRole('button', { name: /remove status filter/i })
      expect(removeButton).toBeInTheDocument()
    })
  })

  describe('Task 3.5: Individual chip removal', () => {
    it('should call onRemove with "status" when status chip X clicked', async () => {
      const user = userEvent.setup()

      render(
        <ActiveFilterChips
          status={['new']}
          owner={[]}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      const removeButton = screen.getByRole('button', { name: /remove status filter/i })
      await user.click(removeButton)

      // AC3: Chip removal bypasses manual-apply (immediate update)
      expect(mockOnRemove).toHaveBeenCalledWith('status')
    })

    it('should call onRemove with "owner" when owner chip X clicked', async () => {
      const user = userEvent.setup()
      const ownerNames = { U123: 'John Doe' }

      render(
        <ActiveFilterChips
          status={[]}
          owner={['U123']}
          dateRange={{}}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={ownerNames}
        />
      )

      const removeButton = screen.getByRole('button', { name: /remove owner filter/i })
      await user.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledWith('owner')
    })

    it('should call onRemove with "date" when date chip X clicked', async () => {
      const user = userEvent.setup()
      const dateRange = { from: new Date('2026-01-20'), to: new Date('2026-01-26') }

      render(
        <ActiveFilterChips
          status={[]}
          owner={[]}
          dateRange={dateRange}
          leadSource=""
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      const removeButton = screen.getByRole('button', { name: /remove date filter/i })
      await user.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledWith('date')
    })

    it('should call onRemove with "source" when source chip X clicked', async () => {
      const user = userEvent.setup()

      render(
        <ActiveFilterChips
          status={[]}
          owner={[]}
          dateRange={{}}
          leadSource="email"
          onRemove={mockOnRemove}
          ownerNames={{}}
        />
      )

      const removeButton = screen.getByRole('button', { name: /remove source filter/i })
      await user.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledWith('source')
    })
  })

  describe('Task 3.7: Mobile layout', () => {
    it('should wrap chips to multiple rows', () => {
      const ownerNames = { U123: 'John Doe' }

      const { container } = render(
        <ActiveFilterChips
          status={['new', 'contacted']}
          owner={['U123']}
          dateRange={{ from: new Date('2026-01-20'), to: new Date('2026-01-26') }}
          leadSource="email"
          onRemove={mockOnRemove}
          ownerNames={ownerNames}
        />
      )

      // Should use flex-wrap for mobile
      const chipContainer = container.firstChild as HTMLElement
      expect(chipContainer).toHaveClass('flex-wrap')
    })
  })
})
