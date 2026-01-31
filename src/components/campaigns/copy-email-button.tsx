/**
 * Copy Email Button Component
 * Story 5.7: Campaign Detail Sheet
 *
 * AC#12: Copy email to clipboard with toast notification
 */
'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface CopyEmailButtonProps {
  /** Email address to copy */
  email: string;
}

/** Duration to show the check icon after copying (ms) */
const COPIED_FEEDBACK_MS = 2000;

export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click

    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast({ title: 'Email copied', description: email });

      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      toast({ title: 'Failed to copy email', variant: 'destructive' });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 ml-2"
      onClick={handleCopy}
      title="Copy email"
      aria-label={`Copy ${email} to clipboard`}
      data-testid="copy-email-button"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      )}
    </Button>
  );
}
