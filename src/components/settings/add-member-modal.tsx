/**
 * Add Member Modal Component (Story 7-4b)
 * Modal for manually adding new sales team members
 * AC#1, AC#2: Form with Name, Email, Phone, Role fields
 * AC#3, AC#4, AC#5: Validation
 * AC#6, AC#7: Duplicate check and success handling
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
import { useCreateTeamMember } from '@/hooks';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Validate email domain (AC#3)
 * Email must be @eneos.co.th
 */
function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  if (!email.endsWith('@eneos.co.th')) {
    return 'Email must be @eneos.co.th domain';
  }

  return null;
}

/**
 * Validate Thai phone format (AC#5)
 * Phone is optional but must be Thai format if provided
 */
function validatePhone(phone: string): string | null {
  if (!phone) return null; // Phone is optional

  // Strip spaces and hyphens
  const digitsOnly = phone.replace(/[\s\-]/g, '');

  // Thai phone: 10 digits starting with 06/08/09
  const thaiPhoneRegex = /^0[689]\d{8}$/;
  if (!thaiPhoneRegex.test(digitsOnly)) {
    return 'Invalid Thai phone format (e.g., 081-234-5678)';
  }

  return null;
}

/**
 * Validate name (AC#4)
 */
function validateName(name: string): string | null {
  if (!name || name.trim().length < 2) {
    return 'Name is required (minimum 2 characters)';
  }
  return null;
}

export function AddMemberModal({ open, onClose }: AddMemberModalProps) {
  const { toast } = useToast();
  const createMutation = useCreateTeamMember();

  // Form state (AC#2)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'sales'>('sales');

  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setPhone('');
      setRole('sales');
      setNameError(null);
      setEmailError(null);
      setPhoneError(null);
    }
  }, [open]);

  // AC#4: Validate name on change
  const handleNameChange = (value: string) => {
    setName(value);
    if (value) {
      setNameError(validateName(value));
    }
  };

  // AC#3: Validate email on change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      setEmailError(validateEmail(value));
    }
  };

  // AC#5: Validate phone on change
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value) {
      setPhoneError(validatePhone(value));
    } else {
      setPhoneError(null);
    }
  };

  // Handle form submission (AC#6, AC#7)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const phoneValidation = phone ? validatePhone(phone) : null;

    setNameError(nameValidation);
    setEmailError(emailValidation);
    setPhoneError(phoneValidation);

    // Stop if any validation errors
    if (nameValidation || emailValidation || phoneValidation) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
      });

      // AC#7: Success toast
      toast({
        title: 'Member added successfully',
        description: `${name} has been added to the team.`,
      });

      // Close modal and reset form
      onClose();
    } catch (error: unknown) {
      // AC#6: Duplicate email check
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (errorMessage.includes('already exists')) {
        toast({
          title: 'Email already exists',
          description: 'This email is already registered in the system.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to add member',
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
    !emailError &&
    !phoneError;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto" data-testid="add-member-modal">
        <SheetHeader>
          <SheetTitle>Add New Member</SheetTitle>
          <SheetDescription>
            Manually add a new sales team member. They can link their LINE account later.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Name field (AC#2, AC#4) */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="สมชาย ใจดี"
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

          {/* Email field (AC#2, AC#3) */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@eneos.co.th"
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

          {/* Phone field (AC#2, AC#5) */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="081-234-5678"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={isSubmitting}
              data-testid="phone-input"
              className={phoneError ? 'border-red-500' : ''}
            />
            {phoneError && (
              <p className="text-sm text-red-500" data-testid="phone-error">
                {phoneError}
              </p>
            )}
          </div>

          {/* Role field (AC#2) */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as 'admin' | 'sales')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role" data-testid="role-select">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons (AC#2) */}
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
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
