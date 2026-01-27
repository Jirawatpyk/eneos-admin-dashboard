/**
 * Link LINE Account Modal Component (Story 7-4b)
 * AC#9: Link LINE Account Modal
 * AC#10: No Unlinked LINE Accounts empty state
 * AC#12: Linking Confirmation dialog
 */
'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, AlertCircle, User } from 'lucide-react';
import { maskLineUserId } from '@/lib/utils';
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
import { useUnlinkedLINEAccounts, useLinkLINEAccount } from '@/hooks';
import type { TeamMember } from '@/types';

interface LinkLineAccountModalProps {
  member: TeamMember | null;
  open: boolean;
  onClose: () => void;
}

export function LinkLineAccountModal({
  member,
  open,
  onClose,
}: LinkLineAccountModalProps) {
  const { toast } = useToast();
  const linkMutation = useLinkLINEAccount();

  // Selected LINE account state
  const [selectedLineUserId, setSelectedLineUserId] = useState<string>('');

  // Confirmation dialog state (AC#12)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch unlinked LINE accounts when modal opens
  const { data: unlinkedAccounts, isLoading, error, refetch } = useUnlinkedLINEAccounts({
    enabled: open && !!member,
  });

  // Reset selection when modal opens/closes or member changes
  useEffect(() => {
    if (open) {
      setSelectedLineUserId('');
      refetch();
    }
  }, [open, member, refetch]);

  // Find the selected account details for confirmation
  const selectedAccount = unlinkedAccounts?.find(
    (acc) => acc.lineUserId === selectedLineUserId
  );

  // Handle Link Selected button click (AC#12)
  const handleLinkClick = () => {
    if (!selectedLineUserId || !member) return;
    setShowConfirmDialog(true);
  };

  // Handle confirmation (AC#11)
  const handleConfirmLink = async () => {
    if (!member?.email || !selectedLineUserId) return;

    try {
      await linkMutation.mutateAsync({
        email: member.email,
        targetLineUserId: selectedLineUserId,
      });

      // Success toast
      toast({
        title: 'LINE account linked successfully',
        description: `${selectedAccount?.name || 'LINE account'} has been linked to ${member.name}.`,
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

  if (!member) return null;

  const hasAccounts = unlinkedAccounts && unlinkedAccounts.length > 0;
  const canLink = selectedLineUserId && !linkMutation.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto" data-testid="link-line-modal">
          <SheetHeader>
            <SheetTitle>Link LINE Account</SheetTitle>
            <SheetDescription>
              Select a LINE account to link to this member.
            </SheetDescription>
          </SheetHeader>

          {/* Member Details (AC#9) */}
          <div className="mt-6 p-4 bg-muted rounded-lg" data-testid="member-details">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="mt-6">
            <Label className="text-sm font-medium">Select LINE Account to Link</Label>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 space-y-3" data-testid="loading-skeleton">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg" data-testid="error-message">
              <p className="text-sm">Failed to load LINE accounts: {error.message}</p>
            </div>
          )}

          {/* Empty State (AC#10) */}
          {!isLoading && !error && !hasAccounts && (
            <div className="mt-4 p-6 border border-dashed rounded-lg text-center" data-testid="empty-state">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No unlinked LINE accounts available.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Members must claim a lead via LINE first to generate a LINE account.
              </p>
            </div>
          )}

          {/* LINE Accounts List (AC#9) */}
          {!isLoading && !error && hasAccounts && (
            <RadioGroup
              value={selectedLineUserId}
              onValueChange={setSelectedLineUserId}
              className="mt-4 space-y-2"
              data-testid="line-accounts-list"
            >
              {unlinkedAccounts.map((account) => (
                <div
                  key={account.lineUserId}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedLineUserId === account.lineUserId
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedLineUserId(account.lineUserId)}
                  data-testid={`line-account-${account.lineUserId}`}
                >
                  <RadioGroupItem value={account.lineUserId} id={account.lineUserId} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {maskLineUserId(account.lineUserId)}
                    </p>
                  </div>
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
              Link <strong>{selectedAccount?.name}</strong> ({maskLineUserId(selectedLineUserId)}) to{' '}
              <strong>{member.name}</strong>?
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
