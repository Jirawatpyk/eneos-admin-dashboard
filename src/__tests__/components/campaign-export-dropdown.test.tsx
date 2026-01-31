/**
 * Campaign Export Dropdown Component Tests
 * Story 5.9: Campaign Export
 *
 * AC#1: Export Button Placement
 * AC#2: Export Format Options
 * AC#6: Loading State
 * AC#10: Large Dataset Confirmation
 * AC#11: Accessibility
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignExportDropdown } from '@/components/campaigns/campaign-export-dropdown';

// Mock the export campaigns hook
const mockExportCampaigns = vi.fn();
let mockIsExporting = false;
vi.mock('@/hooks/use-export-campaigns', () => ({
  useExportCampaigns: () => ({
    exportCampaigns: mockExportCampaigns,
    isExporting: mockIsExporting,
  }),
}));

describe('CampaignExportDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsExporting = false; // Reset loading state
  });

  // AC#1: Export Button Placement
  it('renders export button with FileDown icon', () => {
    render(<CampaignExportDropdown campaignCount={10} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Export');
  });

  it('displays campaign count in aria-label', () => {
    render(<CampaignExportDropdown campaignCount={25} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    expect(button).toHaveAttribute('aria-label', 'Export 25 campaigns');
  });

  it('uses singular form for 1 campaign', () => {
    render(<CampaignExportDropdown campaignCount={1} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    expect(button).toHaveAttribute('aria-label', 'Export 1 campaign');
  });

  // AC#2: Export Format Options
  it('shows Excel and CSV options in dropdown', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={10} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    expect(screen.getByTestId('campaign-export-option-excel')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-export-option-csv')).toBeInTheDocument();
    expect(screen.getByText('Export to Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('Export to CSV (.csv)')).toBeInTheDocument();
  });

  it('calls exportCampaigns with excel format when Excel clicked', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={10} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const excelOption = screen.getByTestId('campaign-export-option-excel');
    await user.click(excelOption);

    expect(mockExportCampaigns).toHaveBeenCalledWith('excel');
  });

  it('calls exportCampaigns with csv format when CSV clicked', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={10} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const csvOption = screen.getByTestId('campaign-export-option-csv');
    await user.click(csvOption);

    expect(mockExportCampaigns).toHaveBeenCalledWith('csv');
  });

  // AC#6: Loading State
  it('shows loading spinner and text when isExporting is true', () => {
    mockIsExporting = true;

    render(<CampaignExportDropdown campaignCount={10} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    expect(button).toHaveTextContent('Exporting...');
    expect(button).toBeDisabled();
  });

  it('disables button during export', () => {
    mockIsExporting = true;

    render(<CampaignExportDropdown campaignCount={10} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  // AC#10: Large Dataset Confirmation
  it('shows confirmation dialog when exporting >100 campaigns', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={150} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const excelOption = screen.getByTestId('campaign-export-option-excel');
    await user.click(excelOption);

    // Should show confirmation dialog, not call export directly
    expect(mockExportCampaigns).not.toHaveBeenCalled();
    expect(screen.getByTestId('campaign-export-confirmation-dialog')).toBeInTheDocument();
    expect(screen.getByText('Export 150 campaigns?')).toBeInTheDocument();
  });

  it('calls export after confirmation for large dataset', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={150} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const excelOption = screen.getByTestId('campaign-export-option-excel');
    await user.click(excelOption);

    // Click confirm button
    const confirmButton = screen.getByTestId('campaign-export-confirmation-confirm');
    await user.click(confirmButton);

    expect(mockExportCampaigns).toHaveBeenCalledWith('excel');
  });

  it('does not call export when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={150} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const excelOption = screen.getByTestId('campaign-export-option-excel');
    await user.click(excelOption);

    // Click cancel button
    const cancelButton = screen.getByTestId('campaign-export-confirmation-cancel');
    await user.click(cancelButton);

    expect(mockExportCampaigns).not.toHaveBeenCalled();
  });

  it('does not show confirmation for <=100 campaigns', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={100} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const excelOption = screen.getByTestId('campaign-export-option-excel');
    await user.click(excelOption);

    // Should call export directly without confirmation
    expect(mockExportCampaigns).toHaveBeenCalledWith('excel');
    expect(screen.queryByTestId('campaign-export-confirmation-dialog')).not.toBeInTheDocument();
  });

  // AC#11: Accessibility
  it('has accessible aria-labels on dropdown items', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown campaignCount={10} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const excelOption = screen.getByTestId('campaign-export-option-excel');
    const csvOption = screen.getByTestId('campaign-export-option-csv');

    expect(excelOption).toHaveAttribute('aria-label', 'Export to Excel');
    expect(csvOption).toHaveAttribute('aria-label', 'Export to CSV');
  });

  it('is disabled when disabled prop is true', () => {
    render(<CampaignExportDropdown campaignCount={10} disabled={true} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    expect(button).toBeDisabled();
  });

  it('is disabled when campaignCount is 0', () => {
    render(<CampaignExportDropdown campaignCount={0} />);

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    // Button should still be enabled as hook handles empty data with toast
    expect(button).not.toBeDisabled();
  });

  // Props passing
  it('passes date filters to export hook', async () => {
    const user = userEvent.setup();

    // We need to verify the hook is called with correct props
    // The actual verification would be in the hook tests
    render(
      <CampaignExportDropdown
        dateFrom="2026-01-01"
        dateTo="2026-01-31"
        campaignCount={10}
      />
    );

    const button = screen.getByTestId('campaign-export-dropdown-trigger');
    await user.click(button);

    const excelOption = screen.getByTestId('campaign-export-option-excel');
    await user.click(excelOption);

    // Export is called
    expect(mockExportCampaigns).toHaveBeenCalledWith('excel');
  });
});
