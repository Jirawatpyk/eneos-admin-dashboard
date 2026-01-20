/**
 * Activity Log Table Component (Story 7-7)
 * AC#2: Display activity log entries in a table
 * AC#6: Click row to open Lead Detail Modal
 */
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import type { ActivityEntry } from '@/types/activity';
import type { LeadStatus } from '@/types/lead';

interface ActivityLogTableProps {
  entries: ActivityEntry[];
  onRowClick: (rowNumber: number) => void;
  isFetching?: boolean;
}

/**
 * Format timestamp for display - compact format with year
 * Format: "19 Jan 2026, 16:01"
 */
function formatTimestamp(timestamp: string): string {
  if (!timestamp) return '-';
  try {
    const date = new Date(timestamp);
    // Use compact format with year: "19 Jan 2026, 16:01"
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return timestamp;
  }
}

/**
 * Status badge with color coding matching leads table
 */
function StatusBadge({ status }: { status: LeadStatus }) {
  const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
    new: {
      label: 'New',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    },
    claimed: {
      label: 'Claimed',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    contacted: {
      label: 'Contacted',
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    },
    closed: {
      label: 'Closed',
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    lost: {
      label: 'Lost',
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
    unreachable: {
      label: 'Unreachable',
      className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
    },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' };

  return (
    <Badge variant="outline" className={config.className} data-testid={`status-badge-${status}`}>
      {config.label}
    </Badge>
  );
}

export function ActivityLogTable({
  entries,
  onRowClick,
  isFetching = false,
}: ActivityLogTableProps) {
  return (
    <TooltipProvider>
      <Card
        className={`overflow-hidden ${isFetching ? 'opacity-70' : ''}`}
        data-testid="activity-log-table"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[170px] whitespace-nowrap">Timestamp</TableHead>
                <TableHead className="min-w-[180px]">Company</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Changed By</TableHead>
                <TableHead className="min-w-[200px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRowClick(entry.rowNumber)}
                  data-testid={`activity-row-${entry.id}`}
                >
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap py-3">
                    {formatTimestamp(entry.timestamp)}
                  </TableCell>
                  <TableCell className="font-medium py-3">
                    <span className="line-clamp-1">{entry.companyName || '-'}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <StatusBadge status={entry.status} />
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="line-clamp-1">{entry.changedByName}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground py-3">
                    {entry.notes ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="line-clamp-1 cursor-help">{entry.notes}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p className="break-words">{entry.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </TooltipProvider>
  );
}
