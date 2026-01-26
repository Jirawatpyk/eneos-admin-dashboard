'use client'

import { X } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type FilterType = 'status' | 'owner' | 'date' | 'source'

interface ActiveFilterChipsProps {
  status: string[]
  owner: string[]
  dateRange: { from?: Date; to?: Date; preset?: string }
  leadSource: string
  onRemove: (filterType: FilterType) => void
  ownerNames: Record<string, string>
  className?: string
}

export function ActiveFilterChips({
  status,
  owner,
  dateRange,
  leadSource,
  onRemove,
  ownerNames,
  className,
}: ActiveFilterChipsProps) {
  // AC3: Show chips only when filters are active
  const hasFilters =
    status.length > 0 ||
    owner.length > 0 ||
    (dateRange.from && dateRange.to) ||
    leadSource.length > 0

  if (!hasFilters) {
    return null
  }

  // Format status label
  const getStatusLabel = (): string => {
    if (status.length === 0) return ''

    // Single value
    if (status.length === 1) {
      return formatStatusValue(status[0])
    }

    // 2-3 values: show all (Task 3.3b)
    if (status.length <= 3) {
      return status.map(formatStatusValue).join(', ')
    }

    // 4+ values: collapsed (Task 3.3c)
    return `${status.length} selected`
  }

  // Format owner label
  const getOwnerLabel = (): string => {
    if (owner.length === 0) return ''

    // Single value (Task 3.3a)
    if (owner.length === 1) {
      const name = ownerNames[owner[0]] || owner[0]
      return truncateText(name, 20) // Task 3.3d: max 20 chars
    }

    // Multiple values: always use "N selected" format (AC3)
    // Owner names can be long, so we don't show them all even for 2-3
    return `${owner.length} selected`
  }

  // Format date label
  const getDateLabel = (): string => {
    if (!dateRange.from || !dateRange.to) return ''

    // Check for preset
    if (dateRange.preset === 'today') return 'Today'
    if (dateRange.preset === 'last7days') return 'Last 7 Days'
    if (dateRange.preset === 'last30days') return 'Last 30 Days'
    if (dateRange.preset === 'thisMonth') return 'This Month'
    if (dateRange.preset === 'lastMonth') return 'Last Month'

    // Custom date range
    const fromStr = format(dateRange.from, 'MMM d')
    const toStr = format(dateRange.to, 'MMM d')
    return `${fromStr} - ${toStr}`
  }

  // Format lead source label
  const getSourceLabel = (): string => {
    if (!leadSource) return ''

    // Capitalize first letter
    return leadSource.charAt(0).toUpperCase() + leadSource.slice(1)
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Status chip */}
      {status.length > 0 && (
        <FilterChip
          label="Status"
          value={getStatusLabel()}
          onRemove={() => onRemove('status')}
        />
      )}

      {/* Owner chip */}
      {owner.length > 0 && (
        <FilterChip
          label="Owner"
          value={getOwnerLabel()}
          onRemove={() => onRemove('owner')}
        />
      )}

      {/* Date chip */}
      {dateRange.from && dateRange.to && (
        <FilterChip
          label="Date"
          value={getDateLabel()}
          onRemove={() => onRemove('date')}
        />
      )}

      {/* Source chip */}
      {leadSource && (
        <FilterChip
          label="Source"
          value={getSourceLabel()}
          onRemove={() => onRemove('source')}
        />
      )}
    </div>
  )
}

// Individual filter chip component
interface FilterChipProps {
  label: string
  value: string
  onRemove: () => void
}

function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className="gap-2 py-1.5 pr-1 pl-3 text-sm"
    >
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      {/* AC3, Task 3.4: X button with 44x44px touch target */}
      <button
        onClick={onRemove}
        className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
        aria-label={`Remove ${label.toLowerCase()} filter`}
        type="button"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Badge>
  )
}

// Helper functions
function formatStatusValue(status: string): string {
  const statusMap: Record<string, string> = {
    new: 'New',
    claimed: 'Claimed',
    contacted: 'Contacted',
    closed: 'Closed',
    lost: 'Lost',
    unreachable: 'Unreachable',
  }

  return statusMap[status] || status
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
