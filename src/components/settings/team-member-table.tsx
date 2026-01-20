/**
 * Team Member Table Component (Story 7-4)
 * AC#1: Table displays all members with LINE ID (masked), Name, Email, Role, Status, Created At
 */
'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { TeamMember } from '@/types/team';

interface TeamMemberTableProps {
  members: TeamMember[];
  isLoading?: boolean;
  onEdit: (member: TeamMember) => void;
}

/**
 * Mask LINE User ID for display
 * Shows first 4 chars and last 4 chars for privacy
 */
function maskLineUserId(lineUserId: string): string {
  if (!lineUserId || lineUserId.length < 10) return lineUserId;
  return `${lineUserId.slice(0, 4)}...${lineUserId.slice(-4)}`;
}

/**
 * Format date for display
 * Shows date in localized format
 */
function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Role badge with color coding
 */
function RoleBadge({ role }: { role: 'admin' | 'sales' }) {
  return (
    <Badge
      variant={role === 'admin' ? 'default' : 'secondary'}
      className={
        role === 'admin'
          ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
          : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      }
      data-testid={`role-badge-${role}`}
    >
      {role === 'admin' ? 'Admin' : 'Sales'}
    </Badge>
  );
}

/**
 * Status badge with color coding
 */
function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <Badge
      variant={status === 'active' ? 'default' : 'outline'}
      className={
        status === 'active'
          ? 'bg-green-100 text-green-800 hover:bg-green-100'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
      }
      data-testid={`status-badge-${status}`}
    >
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}

/**
 * Loading skeleton for table rows
 */
function TableSkeleton({ 'data-testid': testId }: { 'data-testid'?: string }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} data-testid={i === 0 ? testId : undefined}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/**
 * Empty state when no members match filter
 */
function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <p className="text-muted-foreground">No team members found</p>
      </TableCell>
    </TableRow>
  );
}

export function TeamMemberTable({
  members,
  isLoading = false,
  onEdit,
}: TeamMemberTableProps) {
  return (
    <div className="rounded-md border" data-testid="team-member-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">LINE ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[80px]">Role</TableHead>
            <TableHead className="w-[90px]">Status</TableHead>
            <TableHead className="w-[110px]">Created At</TableHead>
            <TableHead className="w-[60px]">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton data-testid="table-skeleton" />
          ) : members.length === 0 ? (
            <EmptyState />
          ) : (
            members.map((member) => (
              <TableRow key={member.lineUserId} data-testid={`team-row-${member.lineUserId}`}>
                <TableCell className="font-mono text-xs" data-testid="line-id-cell">
                  {maskLineUserId(member.lineUserId)}
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email || '-'}
                </TableCell>
                <TableCell>
                  <RoleBadge role={member.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground" data-testid="created-at-cell">
                  {formatDate(member.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(member)}
                    aria-label={`Edit ${member.name}`}
                    data-testid="edit-btn"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
