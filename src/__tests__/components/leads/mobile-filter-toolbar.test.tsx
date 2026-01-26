import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileFilterToolbar } from '@/components/leads/mobile-filter-toolbar'

// Mock ExportAllButton component
vi.mock('@/components/leads/export-all-button', () => ({
  ExportAllButton: ({ iconOnly }: { iconOnly?: boolean }) => (
    <button data-testid="export-all-button" data-icon-only={iconOnly}>
      Export All
    </button>
  ),
}))

describe('MobileFilterToolbar', () => {
  const mockOnFilterClick = vi.fn()

  describe('Task 4.2: Layout structure', () => {
    it('should render Filters button and Export All button', () => {
      render(
        <MobileFilterToolbar
          activeFilterCount={0}
          onFilterClick={mockOnFilterClick}
        />
      )

      // AC2: Filters button + Export All button
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
      expect(screen.getByTestId('export-all-button')).toBeInTheDocument()
    })

    it('should have Filters button take flex-1 (grow)', () => {
      const { container } = render(
        <MobileFilterToolbar
          activeFilterCount={0}
          onFilterClick={mockOnFilterClick}
        />
      )

      const filtersButton = screen.getByRole('button', { name: /filters/i })
      expect(filtersButton).toHaveClass('flex-1')
    })
  })

  describe('Task 4.3: Active filter count badge', () => {
    it('should show just "Filters" when no active filters', () => {
      render(
        <MobileFilterToolbar
          activeFilterCount={0}
          onFilterClick={mockOnFilterClick}
        />
      )

      // AC2: No count when no filters active
      const filtersButton = screen.getByRole('button', { name: /filters/i })
      expect(filtersButton).toHaveTextContent('Filters')
      expect(filtersButton).not.toHaveTextContent(/\(\d+\)/)
    })

    it('should show "Filters (3)" when 3 filters active', () => {
      render(
        <MobileFilterToolbar
          activeFilterCount={3}
          onFilterClick={mockOnFilterClick}
        />
      )

      // AC2: Show active count badge "Filters (3)"
      const filtersButton = screen.getByRole('button', { name: /filters \(3 active\)/i })
      expect(filtersButton).toBeInTheDocument()
      expect(filtersButton).toHaveTextContent('Filters (3)')
    })

    it('should show "Filters (1)" when 1 filter active', () => {
      render(
        <MobileFilterToolbar
          activeFilterCount={1}
          onFilterClick={mockOnFilterClick}
        />
      )

      const filtersButton = screen.getByRole('button', { name: /filters \(1 active\)/i })
      expect(filtersButton).toBeInTheDocument()
      expect(filtersButton).toHaveTextContent('Filters (1)')
    })

    it('should show "Filters (10)" when 10 filters active', () => {
      render(
        <MobileFilterToolbar
          activeFilterCount={10}
          onFilterClick={mockOnFilterClick}
        />
      )

      const filtersButton = screen.getByRole('button', { name: /filters \(10 active\)/i })
      expect(filtersButton).toBeInTheDocument()
      expect(filtersButton).toHaveTextContent('Filters (10)')
    })
  })

  describe('Task 4.4: Wire up bottom sheet state', () => {
    it('should call onFilterClick when Filters button clicked', async () => {
      const user = userEvent.setup()

      render(
        <MobileFilterToolbar
          activeFilterCount={0}
          onFilterClick={mockOnFilterClick}
        />
      )

      const filtersButton = screen.getByRole('button', { name: /filters/i })
      await user.click(filtersButton)

      // AC4: Opens bottom sheet
      expect(mockOnFilterClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Task 4.5-4.6: Export All button icon-only', () => {
    it('should render Export All as icon-only', () => {
      render(
        <MobileFilterToolbar
          activeFilterCount={0}
          onFilterClick={mockOnFilterClick}
        />
      )

      // AC9: Export All button icon-only
      const exportButton = screen.getByTestId('export-all-button')
      expect(exportButton).toHaveAttribute('data-icon-only', 'true')
    })
  })

  describe('Touch-friendly sizing', () => {
    it('should have minimum 44x44px touch targets', () => {
      render(
        <MobileFilterToolbar
          activeFilterCount={0}
          onFilterClick={mockOnFilterClick}
        />
      )

      const filtersButton = screen.getByRole('button', { name: /filters/i })

      // AC11: Touch-friendly (min 44x44px)
      expect(filtersButton).toHaveClass('min-h-[44px]')
    })
  })
})
