'use client'

import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportAllButton } from './export-all-button'
import type { LeadsQueryParams } from '@/types/lead'

interface MobileFilterToolbarProps {
  activeFilterCount: number
  onFilterClick: () => void
  filters?: Omit<LeadsQueryParams, 'page' | 'limit'>
  totalCount?: number
}

export function MobileFilterToolbar({
  activeFilterCount,
  onFilterClick,
  filters = {},
  totalCount = 0,
}: MobileFilterToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Task 4.2: Filters button (flex-1) + Export All icon button */}

      {/* Filters button with badge */}
      <Button
        variant="outline"
        onClick={onFilterClick}
        className="flex-1 gap-2 min-h-[44px]"
        aria-label={
          activeFilterCount > 0
            ? `Filters (${activeFilterCount} active)`
            : 'Filters'
        }
      >
        <Filter className="h-4 w-4" aria-hidden="true" />
        {/* AC2, Task 4.3: Show active count badge when > 0 */}
        {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
      </Button>

      {/* Task 4.5: Export All button - icon-only */}
      <ExportAllButton
        filters={filters}
        totalCount={totalCount}
        iconOnly
      />
    </div>
  )
}
