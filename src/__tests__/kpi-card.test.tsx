/**
 * KPI Card Component Tests
 * Story 2.1: KPI Cards
 * AC: #1, #3, #4
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICard } from '../components/dashboard/kpi-card';

describe('KPICard', () => {
  // AC#1: Display KPI card with label and value
  describe('AC#1: Basic Display', () => {
    it('should render card with title', () => {
      render(
        <KPICard
          title="Total Leads"
          value={1234}
          icon="leads"
        />
      );

      expect(screen.getByText('Total Leads')).toBeInTheDocument();
    });

    it('should render card with formatted value', () => {
      render(
        <KPICard
          title="Total Leads"
          value={1234567}
          icon="leads"
        />
      );

      expect(screen.getByTestId('kpi-value-leads')).toHaveTextContent('1,234,567');
    });

    it('should render correct icon for leads', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          icon="leads"
        />
      );

      expect(screen.getByTestId('kpi-card-leads')).toBeInTheDocument();
    });

    it('should render correct icon for claimed', () => {
      render(
        <KPICard
          title="Claimed"
          value={50}
          icon="claimed"
        />
      );

      expect(screen.getByTestId('kpi-card-claimed')).toBeInTheDocument();
    });

    it('should render correct icon for contacted', () => {
      render(
        <KPICard
          title="Contacted"
          value={30}
          icon="contacted"
        />
      );

      expect(screen.getByTestId('kpi-card-contacted')).toBeInTheDocument();
    });

    it('should render correct icon for closed', () => {
      render(
        <KPICard
          title="Closed"
          value={10}
          icon="closed"
        />
      );

      expect(screen.getByTestId('kpi-card-closed')).toBeInTheDocument();
    });
  });

  // AC#3: Percentage display
  describe('AC#3: Percentage/Rate Display', () => {
    it('should display change percentage with 1 decimal place', () => {
      render(
        <KPICard
          title="Claimed"
          value={50}
          change={45.567}
          changeLabel="claim rate"
          icon="claimed"
        />
      );

      expect(screen.getByTestId('kpi-change-claimed')).toHaveTextContent('+45.6%');
    });

    it('should display change label', () => {
      render(
        <KPICard
          title="Closed"
          value={10}
          change={25.5}
          changeLabel="close rate"
          icon="closed"
        />
      );

      expect(screen.getByTestId('kpi-change-closed')).toHaveTextContent('close rate');
    });

    it('should not display change if undefined', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          icon="leads"
        />
      );

      expect(screen.queryByTestId('kpi-change-leads')).not.toBeInTheDocument();
    });
  });

  // AC#4: Visual Indicators
  describe('AC#4: Visual Indicators', () => {
    it('should show green color for positive change', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          change={15.5}
          changeLabel="vs last period"
          icon="leads"
        />
      );

      const changeElement = screen.getByTestId('kpi-change-leads');
      expect(changeElement).toHaveClass('text-green-600');
    });

    it('should show red color for negative change', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          change={-10.5}
          changeLabel="vs last period"
          icon="leads"
        />
      );

      const changeElement = screen.getByTestId('kpi-change-leads');
      expect(changeElement).toHaveClass('text-red-600');
    });

    it('should show up arrow for positive change', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          change={10}
          changeLabel="vs last period"
          icon="leads"
        />
      );

      expect(screen.getByLabelText('increase')).toBeInTheDocument();
    });

    it('should show down arrow for negative change', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          change={-10}
          changeLabel="vs last period"
          icon="leads"
        />
      );

      expect(screen.getByLabelText('decrease')).toBeInTheDocument();
    });

    it('should show + sign for positive percentage', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          change={15}
          changeLabel="vs last period"
          icon="leads"
        />
      );

      expect(screen.getByTestId('kpi-change-leads')).toHaveTextContent('+15.0%');
    });

    it('should not show + sign for negative percentage', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          change={-15}
          changeLabel="vs last period"
          icon="leads"
        />
      );

      const changeText = screen.getByTestId('kpi-change-leads').textContent;
      expect(changeText).toContain('-15.0%');
      expect(changeText).not.toContain('+-');
    });

    it('should show neutral color for zero change', () => {
      render(
        <KPICard
          title="Total Leads"
          value={100}
          change={0}
          changeLabel="vs last period"
          icon="leads"
        />
      );

      const changeElement = screen.getByTestId('kpi-change-leads');
      expect(changeElement).toHaveClass('text-muted-foreground');
    });
  });

  // isRate prop tests
  describe('Rate Mode', () => {
    it('should show neutral color for positive rate when isRate is true', () => {
      render(
        <KPICard
          title="Claimed"
          value={50}
          change={50}
          changeLabel="claim rate"
          icon="claimed"
          isRate
        />
      );

      const changeElement = screen.getByTestId('kpi-change-claimed');
      expect(changeElement).toHaveClass('text-muted-foreground');
      expect(changeElement).not.toHaveClass('text-green-600');
    });

    it('should not show + sign for rate values', () => {
      render(
        <KPICard
          title="Claimed"
          value={50}
          change={50}
          changeLabel="claim rate"
          icon="claimed"
          isRate
        />
      );

      const changeElement = screen.getByTestId('kpi-change-claimed');
      expect(changeElement).toHaveTextContent('50.0%');
      expect(changeElement).not.toHaveTextContent('+50.0%');
    });

    it('should not show up/down arrows for rate values', () => {
      render(
        <KPICard
          title="Claimed"
          value={50}
          change={50}
          changeLabel="claim rate"
          icon="claimed"
          isRate
        />
      );

      expect(screen.queryByLabelText('increase')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('decrease')).not.toBeInTheDocument();
    });
  });
});
