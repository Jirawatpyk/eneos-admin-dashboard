'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavItem } from './nav-item';
import { Logo } from './logo';
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@/config/nav-items';

/**
 * Mobile sidebar using Sheet component
 * Features:
 * - Hamburger menu trigger
 * - Sheet slides from left
 * - Auto-close on navigation (Amelia's suggestion)
 * - Same nav items as desktop
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close sheet on navigation (Amelia's suggestion)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <TooltipProvider delayDuration={0}>
          {/* Logo Header */}
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle asChild>
              <Logo onClick={() => setOpen(false)} />
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3 pt-2" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  disabled={item.disabled}
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </ScrollArea>

          {/* Secondary Navigation (Settings) */}
          <div className="py-4 border-t mt-auto">
            <nav className="space-y-1 px-3" aria-label="Secondary navigation">
              {SECONDARY_NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  disabled={item.disabled}
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </div>
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
}
