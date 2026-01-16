'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Navigation item component with active state indicator
 * Features:
 * - Active state: bg-eneos-red/10 (pink background) + left border + red text
 * - Hover state: bg-gray-100
 * - Disabled state: gray + "Soon" badge
 * - Transition animations (Sally's suggestion)
 * - Keyboard accessible (Murat's suggestion)
 */
export function NavItem({ href, icon: Icon, label, disabled, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
              'text-gray-400 cursor-not-allowed',
              'transition-all duration-200'
            )}
            aria-disabled="true"
          >
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>{label}</span>
            <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
              Soon
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Coming soon</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 text-sm font-medium',
        'transition-all duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-eneos-red focus-visible:ring-offset-1',
        isActive
          ? 'bg-eneos-red/10 text-eneos-red border-l-4 border-eneos-red rounded-r-md'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
