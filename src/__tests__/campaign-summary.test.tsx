/**
 * Campaign Summary Component Tests
 * Story 2.9: Campaign Summary on Main Dashboard
 *
 * Tests presentational component: metrics, top campaigns, progress bars, links
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignSummary } from '@/components/dashboard/campaign-summary';
import type { CampaignSummary as CampaignSummaryType } from '@/types/dashboard';

const mockData: CampaignSummaryType = {
  totalCampaigns: 5,
  totalDelivered: 2500,
  avgOpenRate: 25.0,
  avgClickRate: 6.0,
  topCampaigns: [
    { campaignId: 1, campaignName: "Valentine's Day", clickRate: 8.5 },
    { campaignId: 2, campaignName: 'ENEOS Q1 2026', clickRate: 6.2 },
    { campaignId: 3, campaignName: 'Year-End Promo', clickRate: 4.1 },
  ],
};

describe('CampaignSummary', () => {
  it('renders the campaign summary card', () => {
    render(<CampaignSummary data={mockData} />);

    expect(screen.getByTestId('campaign-summary')).toBeInTheDocument();
    expect(screen.getByText('Campaign Summary')).toBeInTheDocument();
  });

  it('renders 3 headline metrics with correct values', () => {
    render(<CampaignSummary data={mockData} />);

    const metrics = screen.getAllByTestId('campaign-summary-metric');
    expect(metrics).toHaveLength(3);

    // Delivered
    expect(screen.getByText('2,500')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();

    // Open Rate
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('Open Rate')).toBeInTheDocument();

    // Click Rate
    expect(screen.getByText('6.0%')).toBeInTheDocument();
    expect(screen.getByText('Click Rate')).toBeInTheDocument();
  });

  it('renders top campaigns sorted by click rate', () => {
    render(<CampaignSummary data={mockData} />);

    const items = screen.getAllByTestId('campaign-summary-top-item');
    expect(items).toHaveLength(3);

    expect(screen.getByText("Valentine's Day")).toBeInTheDocument();
    expect(screen.getByText('ENEOS Q1 2026')).toBeInTheDocument();
    expect(screen.getByText('Year-End Promo')).toBeInTheDocument();

    // Click rates
    expect(screen.getByText('8.5%')).toBeInTheDocument();
    expect(screen.getByText('6.2%')).toBeInTheDocument();
    expect(screen.getByText('4.1%')).toBeInTheDocument();
  });

  it('renders progress bar with proportional width', () => {
    render(<CampaignSummary data={mockData} />);

    const items = screen.getAllByTestId('campaign-summary-top-item');

    // First item should have full width (8.5/8.5 = 100%)
    const firstBar = items[0].querySelector('.bg-emerald-500');
    expect(firstBar).toBeTruthy();
    expect(firstBar?.getAttribute('style')).toContain('100%');

    // Second item (6.2/8.5 ≈ 72.9%)
    const secondBar = items[1].querySelector('.bg-emerald-500');
    expect(secondBar).toBeTruthy();
    const secondWidth = parseFloat(secondBar?.getAttribute('style')?.match(/width:\s*([\d.]+)%/)?.[1] || '0');
    expect(secondWidth).toBeCloseTo(72.9, 0);
  });

  it('renders "View All Campaigns" link pointing to /campaigns', () => {
    render(<CampaignSummary data={mockData} />);

    const link = screen.getByTestId('campaign-summary-view-all');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/campaigns');
    expect(link).toHaveTextContent('View All Campaigns');
  });

  it('handles single campaign in top list', () => {
    const singleData: CampaignSummaryType = {
      ...mockData,
      topCampaigns: [
        { campaignId: 1, campaignName: 'Only Campaign', clickRate: 5.0 },
      ],
    };

    render(<CampaignSummary data={singleData} />);

    const items = screen.getAllByTestId('campaign-summary-top-item');
    expect(items).toHaveLength(1);
    expect(screen.getByText('Only Campaign')).toBeInTheDocument();
  });

  it('handles zero delivered count', () => {
    const zeroData: CampaignSummaryType = {
      totalCampaigns: 1,
      totalDelivered: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      topCampaigns: [
        { campaignId: 1, campaignName: 'Empty', clickRate: 0 },
      ],
    };

    render(<CampaignSummary data={zeroData} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    // Should render 0.0% for rates
    const zeroPercentages = screen.getAllByText('0.0%');
    expect(zeroPercentages.length).toBeGreaterThanOrEqual(2);
  });
});
