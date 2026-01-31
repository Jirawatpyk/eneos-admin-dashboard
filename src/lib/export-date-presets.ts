import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  differenceInDays,
} from 'date-fns';
import type { DateRange } from 'react-day-picker';

export type ExportPresetType = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';

export interface ExportPreset {
  type: ExportPresetType;
  label: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  { type: 'thisMonth', label: 'This Month' },
  { type: 'lastMonth', label: 'Last Month' },
  { type: 'thisQuarter', label: 'This Quarter' },
  { type: 'thisYear', label: 'This Year' },
];

export function getExportDateRange(preset: ExportPresetType): DateRange {
  const now = new Date();
  switch (preset) {
    case 'thisMonth':
      return { from: startOfMonth(now), to: now };
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case 'thisQuarter':
      return { from: startOfQuarter(now), to: now };
    case 'thisYear':
      return { from: startOfYear(now), to: now };
  }
}

const MAX_RANGE_DAYS = 365;

export function validateDateRange(range: DateRange): { valid: boolean; error?: string } {
  if (!range.from || !range.to) return { valid: true };
  const days = differenceInDays(range.to, range.from);
  if (days < 0) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  if (days > MAX_RANGE_DAYS) {
    return { valid: false, error: 'Date range cannot exceed 1 year' };
  }
  return { valid: true };
}
