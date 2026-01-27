'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavItem } from './nav-item';
import { Logo } from './logo';
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@/config/nav-items';

/**
 * Desktop sidebar navigation component
 * Features:
 * - Fixed width (w-64 = 256px)
 * - ENEOS branding at top
 * - Main navigation items
 * - Secondary items (Settings) at bottom with divider
 * - ScrollArea for overflow content
 */
export function Sidebar() {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-30 bg-card border-r">
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b">
          <Logo />
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3 pt-2" aria-label="Main navigation">
            {NAV_ITEMS.filter((item) => !item.disabled).map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                disabled={item.disabled}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Secondary Navigation (Settings) */}
        <div className="py-4 border-t">
          <nav className="space-y-1 px-3" aria-label="Secondary navigation">
            {SECONDARY_NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                disabled={item.disabled}
              />
            ))}
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  );
}
