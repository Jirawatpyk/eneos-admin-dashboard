'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { LeadStatusFilter } from './lead-status-filter'
import { LeadOwnerFilter } from './lead-owner-filter'
import { LeadDateFilter } from './lead-date-filter'
import { LeadSourceFilter } from './lead-source-filter'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

import type { LeadStatus } from '@/types/lead'
import type { DateRange } from '@/hooks/use-date-filter'

interface MobileFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: LeadStatus[]
  owner: string[]
  dateRange: DateRange | null
  leadSource: string | null
  availableLeadSources?: string[]
  onApply: (filters: {
    status: LeadStatus[]
    owner: string[]
    dateRange: DateRange | null
    leadSource: string | null
  }) => Promise<void> | void
  onCancel: () => void
  onClearAll: () => void
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  status,
  owner,
  dateRange,
  leadSource,
  availableLeadSources = [],
  onApply,
  onCancel,
  onClearAll,
}: MobileFilterSheetProps) {
  const { toast } = useToast()

  // Temporary filter state (AC6: Manual Apply)
  const [tempStatus, setTempStatus] = useState<LeadStatus[]>(status)
  const [tempOwner, setTempOwner] = useState<string[]>(owner)
  const [tempDateRange, setTempDateRange] = useState<DateRange | null>(dateRange)
  const [tempLeadSource, setTempLeadSource] = useState<string | null>(leadSource)

  // Loading state (AC6, AC13)
  const [isApplying, setIsApplying] = useState(false)

  // Sync temp state with props when they change
  useEffect(() => {
    setTempStatus(status)
    setTempOwner(owner)
    setTempDateRange(dateRange)
    setTempLeadSource(leadSource)
  }, [status, owner, dateRange, leadSource])

  // AC6: Apply filters
  const handleApply = async () => {
    setIsApplying(true)
    try {
      await onApply({
        status: tempStatus,
        owner: tempOwner,
        dateRange: tempDateRange,
        leadSource: tempLeadSource,
      })
      // Success - close sheet
      onOpenChange(false)
    } catch (error) {
      console.error('onApply failed:', error);
      // AC13: Error handling - show toast, keep sheet open
      toast({
        title: 'Error',
        description: 'Failed to apply filters. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsApplying(false)
    }
  }

  // AC6: Cancel discards changes
  const handleCancel = () => {
    // Reset temp state to current props
    setTempStatus(status)
    setTempOwner(owner)
    setTempDateRange(dateRange)
    setTempLeadSource(leadSource)
    onCancel()
  }

  // AC7: Clear All filters immediately (in temp state)
  const handleClearAll = () => {
    setTempStatus([])
    setTempOwner([])
    setTempDateRange(null)
    setTempLeadSource(null)
    onClearAll()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] overflow-y-auto"
        data-testid="mobile-filter-sheet"
      >
        {/* AC4: Title with Close button */}
        <SheetHeader>
          <SheetTitle>Filter Leads</SheetTitle>
          <SheetDescription>
            Select filters and tap Apply to update the lead table
          </SheetDescription>
        </SheetHeader>

        {/* AC5: All 4 filters in order with dividers */}
        <div className="space-y-6 py-4">
          {/* Filter 1: Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Status</h3>
            <LeadStatusFilter
              value={tempStatus}
              onChange={setTempStatus}
              fullWidth
            />
          </div>

          <div className="border-t" />

          {/* Filter 2: Owner */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Owner</h3>
            <LeadOwnerFilter
              value={tempOwner}
              onChange={setTempOwner}
              fullWidth
            />
          </div>

          <div className="border-t" />

          {/* Filter 3: Date */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Date</h3>
            <LeadDateFilter
              value={tempDateRange}
              onChange={setTempDateRange}
              fullWidth
            />
          </div>

          <div className="border-t" />

          {/* Filter 4: Lead Source */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Lead Source</h3>
            <LeadSourceFilter
              value={tempLeadSource}
              sources={availableLeadSources}
              onChange={setTempLeadSource}
              fullWidth
            />
          </div>
        </div>

        {/* AC6, AC7: Action buttons */}
        {/* Story 4.16 AC#11: Touch-friendly 44x44px buttons */}
        <SheetFooter className="sticky bottom-0 bg-background pt-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isApplying}
            className="flex-1 min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={isApplying}
            className="flex-1 min-h-[44px]"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1 min-h-[44px]"
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
