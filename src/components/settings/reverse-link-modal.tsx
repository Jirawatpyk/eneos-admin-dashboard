/**
 * Reverse Link Modal Component (Story 7-4b Task 12.4)
 * AC#14: Link from LINE account to Dashboard member
 * Shows LINE account details and list of unlinked dashboard members
 */
'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, AlertCircle, User } from 'lucide-react';
import { maskLineUserId } from '@/lib';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useUnlinkedDashboardMembers, useReverseLinkAccount } from '@/hooks';
import type { UnlinkedLINEAccount } from '@/types';

interface ReverseLinkModalProps {
  lineAccount: UnlinkedLINEAccount | null;
  open: boolean;
  onClose: () => void;
}

export function ReverseLinkModal({
  lineAccount,
  open,
  onClose,
}: ReverseLinkModalProps) {
  const { toast } = useToast();
  const linkMutation = useReverseLinkAccount();

  // Selected dashboard member state
  const [selectedEmail, setSelectedEmail] = useState<string>('');

  // Confirmation dialog state (AC#12)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch unlinked dashboard members when modal opens
  const { data: unlinkedMembers, isLoading, error, refetch } = useUnlinkedDashboardMembers({
    enabled: open && !!lineAccount,
  });

  // Reset selection when modal opens/closes or lineAccount changes
  useEffect(() => {
    if (open) {
      setSelectedEmail('');
      refetch();
    }
  }, [open, lineAccount, refetch]);

  // Find the selected member details for confirmation
  const selectedMember = unlinkedMembers?.find(
    (m) => m.email === selectedEmail
  );

  // Handle Link Selected button click (AC#12)
  const handleLinkClick = () => {
    if (!selectedEmail || !lineAccount) return;
    setShowConfirmDialog(true);
  };

  // Handle confirmation (AC#11)
  const handleConfirmLink = async () => {
    if (!lineAccount?.lineUserId || !selectedEmail) return;

    try {
      await linkMutation.mutateAsync({
        lineUserId: lineAccount.lineUserId,
        targetEmail: selectedEmail,
      });

      // Success toast
      toast({
        title: 'LINE account linked successfully',
        description: `${lineAccount.name} has been linked to ${selectedMember?.name}.`,
      });

      setShowConfirmDialog(false);
      onClose();
    } catch (error: unknown) {
      // AC#15: Handle already linked error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (errorMessage.includes('already linked')) {
        toast({
          title: 'LINE account already linked',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to link account',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      setShowConfirmDialog(false);
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  // Handle modal close
  const handleClose = () => {
    if (!linkMutation.isPending) {
      onClose();
    }
  };

  if (!lineAccount) return null;

  const hasMembers = unlinkedMembers && unlinkedMembers.length > 0;
  const canLink = selectedEmail && !linkMutation.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto" data-testid="reverse-link-modal">
          <SheetHeader>
            <SheetTitle>Link to Dashboard Member</SheetTitle>
            <SheetDescription>
              Select a dashboard member to link this LINE account to.
            </SheetDescription>
          </SheetHeader>

          {/* LINE Account Details (AC#14) */}
          <div className="mt-6 p-4 bg-muted rounded-lg" data-testid="line-account-details">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{lineAccount.name}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {maskLineUserId(lineAccount.lineUserId)}
                </p>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="mt-6">
            <Label className="text-sm font-medium">Select Dashboard Member to Link</Label>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 space-y-3" data-testid="loading-skeleton">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg" data-testid="error-message">
              <p className="text-sm">Failed to load dashboard members: {error.message}</p>
            </div>
          )}

          {/* Empty State (AC#10 equivalent for reverse) */}
          {!isLoading && !error && !hasMembers && (
            <div className="mt-4 p-6 border border-dashed rounded-lg text-center" data-testid="empty-state">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No unlinked dashboard members available.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add new members via &quot;Add New Member&quot; button first.
              </p>
            </div>
          )}

          {/* Dashboard Members List (AC#14) */}
          {!isLoading && !error && hasMembers && (
            <RadioGroup
              value={selectedEmail}
              onValueChange={setSelectedEmail}
              className="mt-4 space-y-2"
              data-testid="dashboard-members-list"
            >
              {unlinkedMembers.map((member) => (
                <div
                  key={member.email}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEmail === member.email
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedEmail(member.email)}
                  data-testid={`member-option-${member.email}`}
                >
                  <RadioGroupItem value={member.email} id={member.email} />
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Action buttons */}
          <SheetFooter className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={linkMutation.isPending}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLinkClick}
              disabled={!canLink}
              data-testid="link-button"
            >
              {linkMutation.isPending ? (
                'Linking...'
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link Selected
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog (AC#12) */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent data-testid="confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Link</AlertDialogTitle>
            <AlertDialogDescription>
              Link <strong>{lineAccount.name}</strong> ({maskLineUserId(lineAccount.lineUserId)}) to{' '}
              <strong>{selectedMember?.name}</strong>?
              <br />
              <span className="text-orange-600 mt-2 block">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirm} data-testid="confirm-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLink} data-testid="confirm-link">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
