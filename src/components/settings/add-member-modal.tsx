/**
 * Invite User Modal Component (Story 13-1 AC-4)
 * Modal for inviting new users via Supabase Auth
 * - Fields: Name, Email (any domain), Role (admin/viewer)
 * - No phone field (can be added later via edit)
 * - No @eneos.co.th restriction — admin invite-only is the security gate
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useInviteTeamMember } from '@/hooks';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Validate email format (any domain accepted)
 */
function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  return null;
}

/**
 * Validate name
 */
function validateName(name: string): string | null {
  if (!name || name.trim().length < 2) {
    return 'Name is required (minimum 2 characters)';
  }
  return null;
}

export function AddMemberModal({ open, onClose }: AddMemberModalProps) {
  const { toast } = useToast();
  const inviteMutation = useInviteTeamMember();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');

  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setRole('viewer');
      setNameError(null);
      setEmailError(null);
    }
  }, [open]);

  // Validate name on change
  const handleNameChange = (value: string) => {
    setName(value);
    if (value) {
      setNameError(validateName(value));
    }
  };

  // Validate email on change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      setEmailError(validateEmail(value));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);

    setNameError(nameValidation);
    setEmailError(emailValidation);

    if (nameValidation || emailValidation) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await inviteMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        role,
      });

      // AC-4: Success message
      if (result.data.authInviteSent) {
        toast({
          title: 'Invitation sent',
          description: `Invitation sent to ${email}. They will receive an email to set their password.`,
        });
      } else {
        toast({
          title: 'User created',
          description: `${name} has been added but the invitation email could not be sent. You can retry later.`,
          variant: 'default',
        });
      }

      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (errorMessage.includes('already exists') || errorMessage.includes('User already exists')) {
        toast({
          title: 'User already exists',
          description: 'This email is already registered in the system.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to invite user',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Check if form is valid
  const isFormValid =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    !nameError &&
    !emailError;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto" data-testid="add-member-modal">
        <SheetHeader>
          <SheetTitle>Invite User</SheetTitle>
          <SheetDescription>
            Send an invitation email to add a new user. They will set their own password.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isSubmitting}
              data-testid="name-input"
              className={nameError ? 'border-red-500' : ''}
            />
            {nameError && (
              <p className="text-sm text-red-500" data-testid="name-error">
                {nameError}
              </p>
            )}
          </div>

          {/* Email field — any domain accepted */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              disabled={isSubmitting}
              data-testid="email-input"
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && (
              <p className="text-sm text-red-500" data-testid="email-error">
                {emailError}
              </p>
            )}
          </div>

          {/* Role field — admin/viewer only (AC-5) */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as 'admin' | 'viewer')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role" data-testid="role-select">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons */}
          <SheetFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              data-testid="submit-button"
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
