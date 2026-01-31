/**
 * Copy Email Button Tests
 * Story 5.7: Campaign Detail Sheet
 * AC#12: Copy email to clipboard with toast notification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyEmailButton } from '../components/campaigns/copy-email-button';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

describe('CopyEmailButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render a button with correct aria-label', () => {
    render(<CopyEmailButton email="test@example.com" />);

    const button = screen.getByTestId('copy-email-button');
    expect(button).toHaveAttribute('aria-label', 'Copy test@example.com to clipboard');
  });

  it('should have title attribute', () => {
    render(<CopyEmailButton email="test@example.com" />);

    expect(screen.getByTestId('copy-email-button')).toHaveAttribute('title', 'Copy email');
  });

  it('should copy email to clipboard on click', async () => {
    render(<CopyEmailButton email="test@example.com" />);

    fireEvent.click(screen.getByTestId('copy-email-button'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show success toast after copying', async () => {
    render(<CopyEmailButton email="test@example.com" />);

    fireEvent.click(screen.getByTestId('copy-email-button'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Email copied',
        description: 'test@example.com',
      });
    });
  });

  it('should show error toast when clipboard fails', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Clipboard error')
    );

    render(<CopyEmailButton email="test@example.com" />);

    fireEvent.click(screen.getByTestId('copy-email-button'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Failed to copy email',
        variant: 'destructive',
      });
    });
  });

  it('should stop event propagation on click', async () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <CopyEmailButton email="test@example.com" />
      </div>
    );

    fireEvent.click(screen.getByTestId('copy-email-button'));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
