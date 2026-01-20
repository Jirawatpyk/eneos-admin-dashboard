/**
 * Team Member Filter Component (Story 7-4)
 * AC#2: Status Filter - Filter by active/inactive
 * AC#3: Role Filter - Filter by admin/sales
 */
'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TeamFilter } from '@/types/team';

interface TeamMemberFilterProps {
  filter: TeamFilter;
  onFilterChange: (filter: TeamFilter) => void;
  disabled?: boolean;
}

export function TeamMemberFilter({
  filter,
  onFilterChange,
  disabled = false,
}: TeamMemberFilterProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-3"
      data-testid="team-member-filter"
    >
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filters:</span>
      </div>

      {/* AC#2: Status Filter */}
      <Select
        value={filter.status}
        onValueChange={(value) =>
          onFilterChange({ ...filter, status: value as TeamFilter['status'] })
        }
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[130px] h-9"
          data-testid="status-filter"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="all">All Status</SelectItem>
        </SelectContent>
      </Select>

      {/* AC#3: Role Filter */}
      <Select
        value={filter.role}
        onValueChange={(value) =>
          onFilterChange({ ...filter, role: value as TeamFilter['role'] })
        }
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[130px] h-9"
          data-testid="role-filter"
        >
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset button when filter is not default */}
      {(filter.status !== 'active' || filter.role !== 'all') && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 text-muted-foreground"
          onClick={() => onFilterChange({ status: 'active', role: 'all' })}
          disabled={disabled}
          data-testid="reset-filter-btn"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
