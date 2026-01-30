import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, NavItemConfig } from '@/config/nav-items';

describe('nav-items configuration', () => {
  describe('NAV_ITEMS', () => {
    it('contains expected navigation items', () => {
      const labels = NAV_ITEMS.map((item) => item.label);

      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Sales');
      expect(labels).toContain('Leads');
      expect(labels).toContain('Campaigns');
      expect(labels).toContain('Export & Reports');
    });

    it('has Dashboard as first item', () => {
      expect(NAV_ITEMS[0].label).toBe('Dashboard');
      expect(NAV_ITEMS[0].href).toBe('/dashboard');
    });

    it('has Dashboard, Sales, Leads, and Campaigns enabled', () => {
      const dashboard = NAV_ITEMS.find((item) => item.label === 'Dashboard');
      const sales = NAV_ITEMS.find((item) => item.label === 'Sales');
      const leads = NAV_ITEMS.find((item) => item.label === 'Leads');
      const campaigns = NAV_ITEMS.find((item) => item.label === 'Campaigns');

      expect(dashboard?.disabled).toBeFalsy();
      expect(sales?.disabled).toBeFalsy();
      expect(leads?.disabled).toBeFalsy(); // Story 4.1: Leads enabled
      expect(campaigns?.disabled).toBeFalsy(); // Story 5.3: Campaigns enabled
    });

    it('all items have required properties', () => {
      NAV_ITEMS.forEach((item: NavItemConfig) => {
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
        expect(typeof item.label).toBe('string');
        expect(typeof item.href).toBe('string');
        expect(item.href.startsWith('/')).toBe(true);
      });
    });
  });

  describe('SECONDARY_NAV_ITEMS', () => {
    it('contains Settings', () => {
      const labels = SECONDARY_NAV_ITEMS.map((item) => item.label);
      expect(labels).toContain('Settings');
    });

    it('Settings is enabled', () => {
      const settings = SECONDARY_NAV_ITEMS.find((item) => item.label === 'Settings');
      expect(settings?.disabled).toBeFalsy();
      expect(settings?.href).toBe('/settings');
    });
  });
});
