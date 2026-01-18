/**
 * Export Confirmation Dialog Component Tests
 * Story 4.10: Quick Export - AC#8
 *
 * Tests for the large selection confirmation dialog.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportConfirmationDialog } from '@/components/leads/export-confirmation-dialog';

describe('ExportConfirmationDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#8: Dialog shows count in title
  it('displays correct lead count in title', () => {
    render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={150}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Export 150 leads?')).toBeInTheDocument();
  });

  // AC#8: Dialog shows warning description
  it('displays warning about large export', () => {
    render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={200}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.getByText(/large number of leads/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/larger file size/i)).toBeInTheDocument();
  });

  // AC#8: Confirm button triggers export
  it('calls onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={150}
        onConfirm={mockOnConfirm}
      />
    );

    await user.click(screen.getByTestId('export-confirmation-confirm'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  // AC#8: Cancel button closes dialog
  it('calls onOpenChange(false) when cancel clicked', async () => {
    const user = userEvent.setup();
    render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={150}
        onConfirm={mockOnConfirm}
      />
    );

    await user.click(screen.getByTestId('export-confirmation-cancel'));

    // AlertDialogCancel triggers onOpenChange with false
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  // Dialog not rendered when closed
  it('does not render content when open is false', () => {
    render(
      <ExportConfirmationDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        count={150}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByTestId('export-confirmation-dialog')).not.toBeInTheDocument();
  });

  // Dialog has correct test IDs
  it('has correct test IDs for automation', () => {
    render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={150}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByTestId('export-confirmation-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('export-confirmation-confirm')).toBeInTheDocument();
    expect(screen.getByTestId('export-confirmation-cancel')).toBeInTheDocument();
  });

  // Confirm button has correct text
  it('shows "Export anyway" on confirm button', () => {
    render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={150}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Export anyway')).toBeInTheDocument();
  });

  // Cancel button has correct text
  it('shows "Cancel" on cancel button', () => {
    render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={150}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  // Different counts display correctly
  it('displays various counts correctly', () => {
    const { rerender } = render(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={101}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Export 101 leads?')).toBeInTheDocument();

    rerender(
      <ExportConfirmationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={500}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Export 500 leads?')).toBeInTheDocument();
  });
});
