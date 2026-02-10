/**
 * Team Member Table Component (Story 7-4 + 7-4b)
 * AC#1: Table displays all members with LINE ID (masked), Name, Email, Phone, Role, Status, Created At
 * AC#8 (7-4b): Unlinked Member Indicator - "Not linked" badge + "Link" button
 * Note: Phone column added post-review for better UX (users can see what they edit)
 */
'use client';

import { Pencil, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { maskLineUserId } from '@/lib';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { TeamMember } from '@/types';

interface TeamMemberTableProps {
  members: TeamMember[];
  isLoading?: boolean;
  onEdit: (member: TeamMember) => void;
  onLink?: (member: TeamMember) => void; // Story 7-4b: Link action for unlinked members
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
      timeZone: 'Asia/Bangkok',
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
            <Skeleton className="h-4 w-28" />
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
      <TableCell colSpan={8} className="h-24 text-center">
        <p className="text-muted-foreground">No team members found</p>
      </TableCell>
    </TableRow>
  );
}

export function TeamMemberTable({
  members,
  isLoading = false,
  onEdit,
  onLink,
}: TeamMemberTableProps) {
  return (
    <div className="rounded-md border" data-testid="team-member-table">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[130px]">LINE ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[110px]">Phone</TableHead>
            <TableHead className="w-[80px]">Role</TableHead>
            <TableHead className="w-[90px]">Status</TableHead>
            <TableHead className="w-[110px]">Created At</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton data-testid="table-skeleton" />
          ) : members.length === 0 ? (
            <EmptyState />
          ) : (
            members.map((member) => {
              // Use email as fallback key when lineUserId is null (Story 7-4b)
              const rowKey = member.lineUserId || member.email || member.name;
              const isUnlinked = !member.lineUserId;

              return (
                <TableRow key={rowKey} data-testid={`team-row-${rowKey}`}>
                  {/* LINE ID Column - AC#8: Show "Not linked" badge for unlinked members */}
                  <TableCell className="font-mono text-xs" data-testid="line-id-cell">
                    {isUnlinked ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground font-normal"
                        data-testid="not-linked-badge"
                      >
                        Not linked
                      </Badge>
                    ) : (
                      maskLineUserId(member.lineUserId!)
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.phone || '-'}
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
                  {/* Actions Column - Edit always visible, Link for unlinked members */}
                  <TableCell>
                    <div className="flex items-center gap-1">
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
                      {isUnlinked && onLink && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => onLink(member)}
                          aria-label={`Link LINE account for ${member.name}`}
                          data-testid="link-btn"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Link
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
