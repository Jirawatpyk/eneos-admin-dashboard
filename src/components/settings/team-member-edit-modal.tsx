/**
 * Team Member Edit Modal Component (Story 7-4)
 * AC#4: Click on row opens edit modal
 * AC#5: Admin can update email (must be @eneos.co.th)
 * AC#6: Admin can change role
 * AC#7: Admin can deactivate/reactivate
 * AC#8: Validation on email domain
 * AC#9: Role change confirmation dialog + Success toast after save
 */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
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
import { useToast } from '@/hooks/use-toast';
import { useUpdateTeamMember } from '@/hooks';
import type { TeamMember, TeamMemberUpdate } from '@/types';

interface TeamMemberEditModalProps {
  member: TeamMember | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Validate email domain
 * AC#8: Email must be @eneos.co.th or empty
 */
function validateEmail(email: string): string | null {
  if (!email) return null; // Empty is valid (clear email)
  if (!email.endsWith('@eneos.co.th')) {
    return 'Email must be @eneos.co.th domain';
  }
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

/**
 * Validate Thai phone format
 * AC#4: Phone must be Thai format (10 digits starting with 0)
 */
function validatePhone(phone: string): string | null {
  if (!phone) return null; // Empty is valid (clear phone)
  // Thai phone: 10 digits starting with 0 (e.g., 0812345678, 0912345678, 0612345678)
  const thaiPhoneRegex = /^0[689]\d{8}$/;
  if (!thaiPhoneRegex.test(phone)) {
    return 'Invalid Thai phone format (e.g., 0812345678)';
  }
  return null;
}

export function TeamMemberEditModal({
  member,
  open,
  onClose,
}: TeamMemberEditModalProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateTeamMember();

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'sales'>('sales');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // AC#9: Role change confirmation dialog state
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<TeamMemberUpdate | null>(null);

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setRole(member.role);
      setStatus(member.status);
      setEmailError(null);
      setPhoneError(null);
    }
  }, [member]);

  // AC#8: Validate email on change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      setEmailError(validateEmail(value));
    } else {
      setEmailError(null);
    }
  };

  // AC#4: Validate phone on change
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value) {
      setPhoneError(validatePhone(value));
    } else {
      setPhoneError(null);
    }
  };

  // Perform the actual update
  const performUpdate = async (updates: TeamMemberUpdate) => {
    // Guard: Edit modal should only be used for linked members (with lineUserId)
    if (!member || !member.lineUserId) return;

    try {
      await updateMutation.mutateAsync({
        lineUserId: member.lineUserId,
        updates,
      });

      // Success toast
      toast({
        title: 'Member updated',
        description: `${member.name} has been updated successfully.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update member',
        variant: 'destructive',
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!member) return;

    // Validate before save
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }

    // Build updates object - only include changed fields
    const updates: TeamMemberUpdate = {};

    if (email !== (member.email || '')) {
      updates.email = email || null;
    }
    if (phone !== (member.phone || '')) {
      updates.phone = phone || null;
    }
    if (role !== member.role) {
      updates.role = role;
    }
    if (status !== member.status) {
      updates.status = status;
    }

    // Skip if nothing changed
    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    // AC#9: Show confirmation dialog when changing role from sales to admin
    if (updates.role === 'admin' && member.role === 'sales') {
      setPendingUpdates(updates);
      setShowRoleConfirm(true);
      return;
    }

    // No confirmation needed, proceed with update
    await performUpdate(updates);
  };

  // AC#9: Handle role change confirmation
  const handleRoleConfirm = async () => {
    if (pendingUpdates) {
      await performUpdate(pendingUpdates);
    }
    setShowRoleConfirm(false);
    setPendingUpdates(null);
  };

  // Handle role confirmation cancel
  const handleRoleCancel = () => {
    setShowRoleConfirm(false);
    setPendingUpdates(null);
  };

  if (!member) return null;

  const hasValidationError = !!emailError || !!phoneError;

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="sm:max-w-[400px]" data-testid="edit-member-modal">
          <SheetHeader>
            <SheetTitle>Edit Team Member</SheetTitle>
            <SheetDescription>
              Update details for {member.name}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-4 py-6">
            {/* LINE ID (Read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="lineUserId">LINE User ID</Label>
              <Input
                id="lineUserId"
                value={member.lineUserId || ''}
                disabled
                className="font-mono text-xs"
                data-testid="input-line-id"
              />
            </div>

            {/* Name (Read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={member.name}
                disabled
                data-testid="input-name"
              />
            </div>

            {/* AC#5: Email (Editable, must be @eneos.co.th) */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="user@eneos.co.th"
                className={emailError ? 'border-red-500' : ''}
                data-testid="input-email"
              />
              {emailError && (
                <p className="text-xs text-red-500" data-testid="email-error">
                  {emailError}
                </p>
              )}
            </div>

            {/* AC#4: Phone (Editable, Thai format) */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0812345678"
                className={phoneError ? 'border-red-500' : ''}
                data-testid="input-phone"
              />
              {phoneError && (
                <p className="text-xs text-red-500" data-testid="phone-error">
                  {phoneError}
                </p>
              )}
            </div>

            {/* AC#6: Role (Editable) */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'sales')}>
                <SelectTrigger id="role" data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AC#7: Status (Editable) */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
                <SelectTrigger id="status" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
              data-testid="cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending || hasValidationError}
              data-testid="save-btn"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* AC#9: Role Change Confirmation Dialog */}
      <AlertDialog open={showRoleConfirm} onOpenChange={setShowRoleConfirm}>
        <AlertDialogContent data-testid="role-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Grant Admin Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will grant full admin access. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRoleCancel} data-testid="role-confirm-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleConfirm} data-testid="role-confirm-ok">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
