'use client';

import Link from 'next/link';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickExportButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Quick Export Button Component
 * Task 7-8: Quick export link for Dashboard and Leads page
 * Links to /export page with current filters pre-applied (future enhancement)
 */
export function QuickExportButton({
  className,
  variant = 'outline',
  size = 'default',
}: QuickExportButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(className)}
    >
      <Link href="/export">
        <FileDown className="h-4 w-4 mr-2" />
        Export
      </Link>
    </Button>
  );
}
