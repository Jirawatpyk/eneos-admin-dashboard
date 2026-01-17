/**
 * Lead Search Component Tests
 * Story 4.3: Search
 *
 * Tests for AC#1 (Search Input), AC#8 (Keyboard Shortcuts), AC#9 (Accessibility)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadSearch } from '@/components/leads/lead-search';
import { TooltipProvider } from '@/components/ui/tooltip';

// Wrapper with TooltipProvider
function renderWithProviders(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('LeadSearch', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // AC#1: Search Input Display
  // ==========================================================================
  describe('AC#1: Search Input Display', () => {
    it('renders search input with placeholder', () => {
      renderWithProviders(<LeadSearch value="" onChange={mockOnChange} />);

      const input = screen.getByTestId('lead-search-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute(
        'placeholder',
        'Search by company, email, or name...'
      );
    });

    it('renders search icon on the left', () => {
      renderWithProviders(<LeadSearch value="" onChange={mockOnChange} />);

      // Search icon is rendered within the component
      const searchIcon = screen.getByTestId('lead-search-input').parentElement;
      expect(searchIcon?.querySelector('svg')).toBeInTheDocument();
    });

    it('does not show clear button when input is empty', () => {
      renderWithProviders(<LeadSearch value="" onChange={mockOnChange} />);

      expect(
        screen.queryByTestId('lead-search-clear')
      ).not.toBeInTheDocument();
    });

    it('shows clear button when input has value', () => {
      renderWithProviders(
        <LeadSearch value="test" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('lead-search-clear')).toBeInTheDocument();
    });

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <LeadSearch value="test" onChange={mockOnChange} />
      );

      await user.click(screen.getByTestId('lead-search-clear'));

      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  // ==========================================================================
  // AC#2: Loading Indicator
  // ==========================================================================
  describe('AC#2: Loading Indicator', () => {
    it('shows loading indicator when isPending is true', () => {
      renderWithProviders(
        <LeadSearch value="test" onChange={mockOnChange} isPending={true} />
      );

      expect(screen.getByTestId('lead-search-loading')).toBeInTheDocument();
    });

    it('does not show loading indicator when isPending is false', () => {
      renderWithProviders(
        <LeadSearch value="test" onChange={mockOnChange} isPending={false} />
      );

      expect(
        screen.queryByTestId('lead-search-loading')
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // AC#8: Keyboard Shortcuts
  // ==========================================================================
  describe('AC#8: Keyboard Shortcuts', () => {
    it('focuses input when "/" is pressed', async () => {
      renderWithProviders(<LeadSearch value="" onChange={mockOnChange} />);

      const input = screen.getByTestId('lead-search-input');

      // Simulate "/" keypress on document
      fireEvent.keyDown(document, { key: '/' });

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    it('clears input and blurs when Escape is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <LeadSearch value="test" onChange={mockOnChange} />
      );

      const input = screen.getByTestId('lead-search-input');

      // Focus the input first
      await user.click(input);
      expect(document.activeElement).toBe(input);

      // Press Escape
      await user.keyboard('{Escape}');

      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(document.activeElement).not.toBe(input);
    });

    it('does not focus when "/" is pressed while in another input', async () => {
      render(
        <TooltipProvider>
          <div>
            <input data-testid="other-input" />
            <LeadSearch value="" onChange={mockOnChange} />
          </div>
        </TooltipProvider>
      );

      const otherInput = screen.getByTestId('other-input');
      const searchInput = screen.getByTestId('lead-search-input');

      // Focus the other input
      otherInput.focus();
      expect(document.activeElement).toBe(otherInput);

      // Simulate "/" keypress
      fireEvent.keyDown(document, { key: '/' });

      // Should stay on other input
      expect(document.activeElement).toBe(otherInput);
      expect(document.activeElement).not.toBe(searchInput);
    });
  });

  // ==========================================================================
  // AC#9: Accessibility
  // ==========================================================================
  describe('AC#9: Accessibility', () => {
    it('has aria-label "Search leads"', () => {
      renderWithProviders(<LeadSearch value="" onChange={mockOnChange} />);

      const input = screen.getByTestId('lead-search-input');
      expect(input).toHaveAttribute('aria-label', 'Search leads');
    });

    it('has live region for screen readers', () => {
      renderWithProviders(<LeadSearch value="" onChange={mockOnChange} />);

      const liveRegion = screen.getByTestId('lead-search-status');
      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('announces result count in live region', () => {
      renderWithProviders(
        <LeadSearch value="test" onChange={mockOnChange} resultCount={25} />
      );

      const liveRegion = screen.getByTestId('lead-search-status');
      expect(liveRegion).toHaveTextContent('Found 25 leads');
    });

    it('announces "Searching..." when pending', () => {
      renderWithProviders(
        <LeadSearch
          value="test"
          onChange={mockOnChange}
          resultCount={25}
          isPending={true}
        />
      );

      const liveRegion = screen.getByTestId('lead-search-status');
      expect(liveRegion).toHaveTextContent('Searching...');
    });

    it('clear button has aria-label', () => {
      renderWithProviders(
        <LeadSearch value="test" onChange={mockOnChange} />
      );

      const clearButton = screen.getByTestId('lead-search-clear');
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });
  });

  // ==========================================================================
  // General Component Behavior
  // ==========================================================================
  describe('General Behavior', () => {
    it('calls onChange when typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LeadSearch value="" onChange={mockOnChange} />);

      const input = screen.getByTestId('lead-search-input');
      await user.type(input, 'ENEOS');

      // Should be called for each character typed
      expect(mockOnChange).toHaveBeenCalledTimes(5);
      expect(mockOnChange).toHaveBeenLastCalledWith('S');
    });

    it('accepts custom className', () => {
      renderWithProviders(
        <LeadSearch
          value=""
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const container = screen.getByTestId('lead-search-input').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('displays current value', () => {
      renderWithProviders(
        <LeadSearch value="existing search" onChange={mockOnChange} />
      );

      const input = screen.getByTestId('lead-search-input');
      expect(input).toHaveValue('existing search');
    });
  });
});
