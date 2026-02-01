/**
 * ATDD Tests - Story 6-5: Select Data Fields (Frontend Component)
 * RED Phase: These tests define expected behavior for ExportFieldSelector component.
 *
 * AC#1: Field Selection Checkbox List
 * AC#2: Select/Deselect Individual Fields
 * AC#3: Select All / Deselect All Toggle
 * AC#4: Field Count Badge
 * AC#8: PDF Export Field Limitation (disabled state)
 * AC#10: Responsive Layout
 *
 * All tests should FAIL because ExportFieldSelector component does not exist yet.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
// This import will FAIL until the component is created (RED phase)
import { ExportFieldSelector } from '@/components/export/export-field-selector';
import { LEAD_EXPORT_COLUMNS } from '@/lib/export-leads';
import type { Lead } from '@/types/lead';

// ===========================================
// Mock Setup
// ===========================================

const { mockToast } = vi.hoisted(() => ({
  mockToast: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// ===========================================
// Test Helpers
// ===========================================

const allFieldKeys = new Set<keyof Lead>(LEAD_EXPORT_COLUMNS.map((c) => c.key));

const renderFieldSelector = (overrides: Partial<{
  selectedFields: Set<keyof Lead>;
  onFieldsChange: (fields: Set<keyof Lead>) => void;
  isPdfFormat: boolean;
}> = {}) => {
  const defaultProps = {
    selectedFields: new Set<keyof Lead>(allFieldKeys),
    onFieldsChange: vi.fn(),
    isPdfFormat: false,
    ...overrides,
  };

  const result = render(<ExportFieldSelector {...defaultProps} />);
  return { ...result, props: defaultProps };
};

// ===========================================
// Tests
// ===========================================

describe('Story 6-5: ExportFieldSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------
  // AC#1: Field Selection Checkbox List
  // -------------------------------------------
  describe('AC#1: Checkbox List Rendering', () => {
    // GIVEN I am on the Export page
    // WHEN the form renders
    // THEN I see a "Data Fields" section
    it('should render field selector section', () => {
      renderFieldSelector();

      expect(screen.getByTestId('field-selector')).toBeInTheDocument();
      expect(screen.getByText('Data Fields')).toBeInTheDocument();
    });

    // GIVEN the form renders
    // THEN I see checkboxes for all 16 available columns
    it('should render 16 checkboxes for all columns', () => {
      renderFieldSelector();

      const grid = screen.getByTestId('field-checkbox-grid');
      LEAD_EXPORT_COLUMNS.forEach((col) => {
        expect(within(grid).getByTestId(`field-${col.key}`)).toBeInTheDocument();
      });
    });

    // GIVEN the form renders
    // THEN each checkbox shows the column header name
    it('should show column header names on each checkbox', () => {
      renderFieldSelector();

      LEAD_EXPORT_COLUMNS.forEach((col) => {
        expect(screen.getByText(col.header)).toBeInTheDocument();
      });
    });

    // GIVEN all fields selected (default)
    // THEN all checkboxes are checked
    it('should have all checkboxes checked by default', () => {
      renderFieldSelector();

      const grid = screen.getByTestId('field-checkbox-grid');
      const checkboxes = within(grid).getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  // -------------------------------------------
  // AC#2: Select/Deselect Individual Fields
  // -------------------------------------------
  describe('AC#2: Individual Field Toggle', () => {
    // GIVEN field selection checkboxes
    // WHEN I uncheck a field
    // THEN onFieldsChange is called without that field
    it('should call onFieldsChange when unchecking a field', () => {
      const onFieldsChange = vi.fn();
      renderFieldSelector({ onFieldsChange });

      const websiteCheckbox = within(
        screen.getByTestId('field-website')
      ).getByRole('checkbox');
      fireEvent.click(websiteCheckbox);

      expect(onFieldsChange).toHaveBeenCalledTimes(1);
      const newFields = onFieldsChange.mock.calls[0][0] as Set<keyof Lead>;
      expect(newFields.has('website')).toBe(false);
      expect(newFields.size).toBe(LEAD_EXPORT_COLUMNS.length - 1);
    });

    // GIVEN only 1 field is selected
    // WHEN I try to uncheck the last field
    // THEN toast error: "At least one field must be selected"
    it('should prevent unchecking the last field and show toast', () => {
      const singleField = new Set<keyof Lead>(['company']);
      const onFieldsChange = vi.fn();
      renderFieldSelector({ selectedFields: singleField, onFieldsChange });

      const companyCheckbox = within(
        screen.getByTestId('field-company')
      ).getByRole('checkbox');
      fireEvent.click(companyCheckbox);

      expect(onFieldsChange).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('At least one field must be selected'),
        })
      );
    });
  });

  // -------------------------------------------
  // AC#3: Select All / Deselect All Toggle
  // -------------------------------------------
  describe('AC#3: Select All / Deselect All', () => {
    // GIVEN all fields are selected
    // WHEN I click the toggle button
    // THEN it shows "Deselect All" label
    it('should show "Deselect All" when all fields selected', () => {
      renderFieldSelector();

      const toggleBtn = screen.getByTestId('select-all-toggle');
      expect(toggleBtn).toHaveTextContent('Deselect All');
    });

    // GIVEN not all fields are selected
    // THEN toggle shows "Select All"
    it('should show "Select All" when not all fields selected', () => {
      const partialFields = new Set<keyof Lead>(['company', 'email']);
      renderFieldSelector({ selectedFields: partialFields });

      const toggleBtn = screen.getByTestId('select-all-toggle');
      expect(toggleBtn).toHaveTextContent('Select All');
    });

    // GIVEN all fields selected
    // WHEN I click "Deselect All"
    // THEN only Company (minimum required) remains selected
    it('should deselect all except Company when clicking Deselect All', () => {
      const onFieldsChange = vi.fn();
      renderFieldSelector({ onFieldsChange });

      const toggleBtn = screen.getByTestId('select-all-toggle');
      fireEvent.click(toggleBtn);

      expect(onFieldsChange).toHaveBeenCalledTimes(1);
      const newFields = onFieldsChange.mock.calls[0][0] as Set<keyof Lead>;
      expect(newFields.size).toBe(1);
      expect(newFields.has('company')).toBe(true);
    });

    // GIVEN partial selection
    // WHEN I click "Select All"
    // THEN all 16 fields are selected
    it('should select all fields when clicking Select All', () => {
      const partialFields = new Set<keyof Lead>(['company', 'email']);
      const onFieldsChange = vi.fn();
      renderFieldSelector({ selectedFields: partialFields, onFieldsChange });

      const toggleBtn = screen.getByTestId('select-all-toggle');
      fireEvent.click(toggleBtn);

      expect(onFieldsChange).toHaveBeenCalledTimes(1);
      const newFields = onFieldsChange.mock.calls[0][0] as Set<keyof Lead>;
      expect(newFields.size).toBe(LEAD_EXPORT_COLUMNS.length);
    });
  });

  // -------------------------------------------
  // AC#4: Field Count Badge
  // -------------------------------------------
  describe('AC#4: Field Count Badge', () => {
    // GIVEN all 16 fields selected
    // THEN badge shows "All fields"
    it('should show "All fields" when all selected', () => {
      renderFieldSelector();

      const badge = screen.getByTestId('field-count');
      expect(badge).toHaveTextContent('All fields');
    });

    // GIVEN 5 of 16 fields selected
    // THEN badge shows "5 of 16"
    it('should show count when partial selection', () => {
      const fiveFields = new Set<keyof Lead>([
        'company', 'email', 'status', 'phone', 'customerName',
      ]);
      renderFieldSelector({ selectedFields: fiveFields });

      const badge = screen.getByTestId('field-count');
      expect(badge).toHaveTextContent(`5 of ${LEAD_EXPORT_COLUMNS.length}`);
    });
  });

  // -------------------------------------------
  // AC#8: PDF Export Field Limitation
  // -------------------------------------------
  describe('AC#8: PDF Format Disabled State', () => {
    // GIVEN PDF format is selected
    // THEN field selection is disabled
    it('should disable checkboxes when isPdfFormat is true', () => {
      renderFieldSelector({ isPdfFormat: true });

      const grid = screen.getByTestId('field-checkbox-grid');
      const checkboxes = within(grid).getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeDisabled();
      });
    });

    // GIVEN PDF format is selected
    // THEN a note is displayed
    it('should show PDF note when isPdfFormat is true', () => {
      renderFieldSelector({ isPdfFormat: true });

      const note = screen.getByTestId('pdf-note');
      expect(note).toBeInTheDocument();
      expect(note).toHaveTextContent(/PDF/i);
    });

    // GIVEN PDF format is selected
    // THEN Select All button is disabled
    it('should disable Select All toggle when isPdfFormat is true', () => {
      renderFieldSelector({ isPdfFormat: true });

      const toggleBtn = screen.getByTestId('select-all-toggle');
      expect(toggleBtn).toBeDisabled();
    });

    // GIVEN non-PDF format
    // THEN no PDF note shown
    it('should not show PDF note when isPdfFormat is false', () => {
      renderFieldSelector({ isPdfFormat: false });

      expect(screen.queryByTestId('pdf-note')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------
  // AC#10: Responsive Layout
  // -------------------------------------------
  describe('AC#10: Layout Structure', () => {
    // GIVEN the component renders
    // THEN checkbox grid uses responsive grid classes
    it('should render checkbox grid with responsive layout', () => {
      renderFieldSelector();

      const grid = screen.getByTestId('field-checkbox-grid');
      // Verify grid container exists (CSS classes checked via className)
      expect(grid).toBeInTheDocument();
    });
  });
});
