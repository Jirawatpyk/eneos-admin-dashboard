/**
 * Unlinked LINE Accounts Table Component (Story 7-4b Task 12)
 * AC#13: Display LINE accounts without dashboard members
 * AC#14: Link to Member action
 */
'use client';

import { Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { UnlinkedLINEAccount } from '@/types';

interface UnlinkedLineAccountsTableProps {
  accounts: UnlinkedLINEAccount[];
  isLoading?: boolean;
  onLinkToMember: (account: UnlinkedLINEAccount) => void;
}

/**
 * Format date for display
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
  } catch (e) {
    console.warn('Failed to parse date:', dateString, e);
    return dateString;
  }
}

/**
 * Loading skeleton for table rows
 */
function TableSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i} data-testid={i === 0 ? 'table-skeleton' : undefined}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/**
 * Empty state when no unlinked accounts
 */
function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={4} className="h-24 text-center">
        <p className="text-muted-foreground">No unlinked LINE accounts found</p>
        <p className="text-xs text-muted-foreground mt-1">
          LINE accounts appear here when sales claim leads before being added to Dashboard
        </p>
      </TableCell>
    </TableRow>
  );
}

export function UnlinkedLineAccountsTable({
  accounts,
  isLoading = false,
  onLinkToMember,
}: UnlinkedLineAccountsTableProps) {
  return (
    <div className="rounded-md border" data-testid="unlinked-line-accounts-table">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[150px]">LINE ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-[120px]">First Seen</TableHead>
            <TableHead className="w-[140px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : accounts.length === 0 ? (
            <EmptyState />
          ) : (
            accounts.map((account) => (
              <TableRow key={account.lineUserId} data-testid={`unlinked-row-${account.lineUserId}`}>
                <TableCell className="font-mono text-xs">
                  {maskLineUserId(account.lineUserId)}
                </TableCell>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(account.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onLinkToMember(account)}
                    data-testid="link-to-member-btn"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Link to Member
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
