import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  FileOutput,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItemConfig {
  icon: LucideIcon;
  label: string;
  href: string;
  disabled?: boolean;
}

/**
 * Main navigation items for the sidebar
 * Easy to add/remove/reorder - Winston's suggestion
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Users,
    label: 'Sales',
    href: '/sales',
  },
  {
    icon: FileText,
    label: 'Leads',
    href: '/leads',
    disabled: true,
  },
  {
    icon: BarChart3,
    label: 'Campaigns',
    href: '/campaigns',
    disabled: true,
  },
  {
    icon: FileOutput,
    label: 'Reports',
    href: '/reports',
    disabled: true,
  },
];

/**
 * Secondary navigation items (shown at bottom with divider)
 */
export const SECONDARY_NAV_ITEMS: NavItemConfig[] = [
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
  },
];
