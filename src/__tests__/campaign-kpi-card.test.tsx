/**
 * Campaign KPI Card Component Tests
 * Story 5.3: Campaign Summary Cards
 * AC: #1, #3
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignKPICard } from '../components/campaigns/campaign-kpi-card';

describe('CampaignKPICard', () => {
  // AC#1: Display KPI card with label and value
  describe('AC#1: Basic Display', () => {
    it('should render card with title', () => {
      render(
        <CampaignKPICard
          title="Total Campaigns"
          value={25}
          icon="campaigns"
        />
      );

      expect(screen.getByText('Total Campaigns')).toBeInTheDocument();
    });

    it('should render card with formatted value', () => {
      render(
        <CampaignKPICard
          title="Delivered"
          value={1234567}
          icon="delivered"
        />
      );

      expect(screen.getByTestId('campaign-kpi-value-delivered')).toHaveTextContent('1,234,567');
    });

    it('should render correct icon for campaigns', () => {
      render(
        <CampaignKPICard
          title="Total Campaigns"
          value={10}
          icon="campaigns"
        />
      );

      expect(screen.getByTestId('campaign-kpi-card-campaigns')).toBeInTheDocument();
    });

    it('should render correct icon for delivered', () => {
      render(
        <CampaignKPICard
          title="Delivered"
          value={500}
          icon="delivered"
        />
      );

      expect(screen.getByTestId('campaign-kpi-card-delivered')).toBeInTheDocument();
    });

    it('should render correct icon for opened', () => {
      render(
        <CampaignKPICard
          title="Opened"
          value={300}
          icon="opened"
        />
      );

      expect(screen.getByTestId('campaign-kpi-card-opened')).toBeInTheDocument();
    });

    it('should render correct icon for clicked', () => {
      render(
        <CampaignKPICard
          title="Clicked"
          value={100}
          icon="clicked"
        />
      );

      expect(screen.getByTestId('campaign-kpi-card-clicked')).toBeInTheDocument();
    });
  });

  // AC#3: Rate Display for Opened/Clicked
  describe('AC#3: Rate Display', () => {
    it('should display rate with 1 decimal place', () => {
      render(
        <CampaignKPICard
          title="Opened"
          value={5000}
          rate={42.567}
          rateLabel="open rate"
          icon="opened"
        />
      );

      expect(screen.getByTestId('campaign-kpi-rate-opened')).toHaveTextContent('42.6%');
    });

    it('should display rate label', () => {
      render(
        <CampaignKPICard
          title="Clicked"
          value={1000}
          rate={25.5}
          rateLabel="click rate"
          icon="clicked"
        />
      );

      expect(screen.getByTestId('campaign-kpi-rate-clicked')).toHaveTextContent('click rate');
    });

    it('should not display rate if undefined', () => {
      render(
        <CampaignKPICard
          title="Total Campaigns"
          value={10}
          icon="campaigns"
        />
      );

      expect(screen.queryByTestId('campaign-kpi-rate-campaigns')).not.toBeInTheDocument();
    });

    it('should display rate in neutral color (muted)', () => {
      render(
        <CampaignKPICard
          title="Opened"
          value={5000}
          rate={42.5}
          rateLabel="open rate"
          icon="opened"
        />
      );

      const rateElement = screen.getByTestId('campaign-kpi-rate-opened');
      expect(rateElement).toHaveClass('text-muted-foreground');
    });

    it('should display rate without rateLabel if not provided', () => {
      render(
        <CampaignKPICard
          title="Opened"
          value={5000}
          rate={42.5}
          icon="opened"
        />
      );

      const rateElement = screen.getByTestId('campaign-kpi-rate-opened');
      expect(rateElement).toHaveTextContent('42.5%');
      expect(rateElement).not.toHaveTextContent('rate');
    });
  });

  describe('Value Formatting', () => {
    it('should format zero value correctly', () => {
      render(
        <CampaignKPICard
          title="Delivered"
          value={0}
          icon="delivered"
        />
      );

      expect(screen.getByTestId('campaign-kpi-value-delivered')).toHaveTextContent('0');
    });

    it('should format large numbers with commas', () => {
      render(
        <CampaignKPICard
          title="Delivered"
          value={9999999}
          icon="delivered"
        />
      );

      expect(screen.getByTestId('campaign-kpi-value-delivered')).toHaveTextContent('9,999,999');
    });
  });
});
