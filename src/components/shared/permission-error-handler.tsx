/**
 * Permission Error Handler Component
 * Story 1.5: Role-based Access Control
 *
 * AC#6: Unauthorized Access Handling - Show toast when viewer tries to access admin routes
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * Handles permission errors from URL params (e.g., ?error=Unauthorized)
 * Shows toast notification and cleans up URL
 */
export function PermissionErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');

    // Only handle once per mount and only for Unauthorized error
    if (error === 'Unauthorized' && !handled) {
      setHandled(true);

      // Show toast notification (AC#6)
      // AC#6: Toast message exactly as specified
      toast({
        title: 'Access Denied',
        description: "You don't have permission to access this page.",
        variant: 'destructive',
      });

      // Clean up URL by removing error param
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      const newPath = newParams.toString()
        ? `${window.location.pathname}?${newParams.toString()}`
        : window.location.pathname;
      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, toast, router, handled]);

  return null;
}
