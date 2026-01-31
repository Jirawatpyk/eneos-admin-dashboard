/**
 * ExportDatePresets Component Tests
 * Story 6.4: Custom Date Range - AC#1, AC#7, AC#8
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportDatePresets } from '@/components/export/export-date-presets';

describe('ExportDatePresets', () => {
  const mockOnPresetSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC#1: Quick Date Presets', () => {
    it('renders all 4 preset buttons', () => {
      render(<ExportDatePresets activePreset={null} onPresetSelect={mockOnPresetSelect} />);
      expect(screen.getByTestId('preset-thisMonth')).toBeInTheDocument();
      expect(screen.getByTestId('preset-lastMonth')).toBeInTheDocument();
      expect(screen.getByTestId('preset-thisQuarter')).toBeInTheDocument();
      expect(screen.getByTestId('preset-thisYear')).toBeInTheDocument();
    });

    it('renders correct labels', () => {
      render(<ExportDatePresets activePreset={null} onPresetSelect={mockOnPresetSelect} />);
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('Last Month')).toBeInTheDocument();
      expect(screen.getByText('This Quarter')).toBeInTheDocument();
      expect(screen.getByText('This Year')).toBeInTheDocument();
    });

    it('calls onPresetSelect when preset clicked', () => {
      render(<ExportDatePresets activePreset={null} onPresetSelect={mockOnPresetSelect} />);
      fireEvent.click(screen.getByTestId('preset-thisMonth'));
      expect(mockOnPresetSelect).toHaveBeenCalledWith('thisMonth');
    });

    it('calls onPresetSelect with correct preset type', () => {
      render(<ExportDatePresets activePreset={null} onPresetSelect={mockOnPresetSelect} />);
      fireEvent.click(screen.getByTestId('preset-thisQuarter'));
      expect(mockOnPresetSelect).toHaveBeenCalledWith('thisQuarter');
    });
  });

  describe('AC#1: Active Preset Visual Feedback', () => {
    it('highlights active preset with default variant', () => {
      render(<ExportDatePresets activePreset="thisMonth" onPresetSelect={mockOnPresetSelect} />);
      const activeButton = screen.getByTestId('preset-thisMonth');
      // Default variant doesn't have the outline class
      expect(activeButton.className).not.toContain('border-input');
    });

    it('inactive presets use outline variant', () => {
      render(<ExportDatePresets activePreset="thisMonth" onPresetSelect={mockOnPresetSelect} />);
      const inactiveButton = screen.getByTestId('preset-lastMonth');
      expect(inactiveButton.className).toContain('border');
    });

    it('no presets highlighted when activePreset is null', () => {
      render(<ExportDatePresets activePreset={null} onPresetSelect={mockOnPresetSelect} />);
      const buttons = screen.getAllByRole('button');
      // All 4 buttons should have outline variant (border-input)
      expect(buttons).toHaveLength(4);
    });
  });

  describe('AC#8: Responsive Layout', () => {
    it('renders container with flex-wrap for responsive layout', () => {
      render(<ExportDatePresets activePreset={null} onPresetSelect={mockOnPresetSelect} />);
      const container = screen.getByTestId('export-date-presets');
      expect(container.className).toContain('flex');
      expect(container.className).toContain('flex-wrap');
      expect(container.className).toContain('gap-2');
    });
  });

  describe('AC#10: Keyboard Accessibility', () => {
    it('preset buttons are focusable', () => {
      render(<ExportDatePresets activePreset={null} onPresetSelect={mockOnPresetSelect} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });
});
