/**
 * useChartTheme Hook Tests
 * Story 7.2: Theme Toggle (AC#7)
 *
 * Tests for chart theme adaptation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChartTheme, useChartPalette } from '@/hooks/use-chart-theme';

// Mock next-themes
let mockResolvedTheme = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
  }),
}));

describe('useChartTheme', () => {
  beforeEach(() => {
    mockResolvedTheme = 'light';
  });

  describe('AC#7: Charts adapt to theme', () => {
    it('should return light colors for light theme', () => {
      mockResolvedTheme = 'light';
      const { result } = renderHook(() => useChartTheme());

      // After mount, colors should be light theme
      expect(result.current.colors.background).toBe('#FFFFFF');
      expect(result.current.colors.text).toBe('#111827');
      expect(result.current.colors.grid).toBe('#E5E7EB');
    });

    it('should return dark colors for dark theme', () => {
      mockResolvedTheme = 'dark';
      const { result } = renderHook(() => useChartTheme());

      // After mount, colors should be dark theme
      expect(result.current.colors.background).toBe('#111827');
      expect(result.current.colors.text).toBe('#F9FAFB');
      expect(result.current.colors.grid).toBe('#374151');
    });

    it('should return isDark as false for light theme', () => {
      mockResolvedTheme = 'light';
      const { result } = renderHook(() => useChartTheme());

      expect(result.current.isDark).toBe(false);
    });

    it('should return isDark as true for dark theme', () => {
      mockResolvedTheme = 'dark';
      const { result } = renderHook(() => useChartTheme());

      expect(result.current.isDark).toBe(true);
    });
  });

  describe('Chart color values', () => {
    it('should have brighter primary color in dark mode', () => {
      // Light mode primary
      mockResolvedTheme = 'light';
      const { result: lightResult } = renderHook(() => useChartTheme());
      const lightPrimary = lightResult.current.colors.primary;

      // Dark mode primary
      mockResolvedTheme = 'dark';
      const { result: darkResult } = renderHook(() => useChartTheme());
      const darkPrimary = darkResult.current.colors.primary;

      // Colors should be different
      expect(lightPrimary).not.toBe(darkPrimary);
      expect(lightPrimary).toBe('#6366F1'); // Indigo-500
      expect(darkPrimary).toBe('#818CF8');  // Indigo-400 (brighter)
    });

    it('should have appropriate card background colors', () => {
      mockResolvedTheme = 'light';
      const { result: lightResult } = renderHook(() => useChartTheme());

      mockResolvedTheme = 'dark';
      const { result: darkResult } = renderHook(() => useChartTheme());

      expect(lightResult.current.colors.cardBackground).toBe('#FFFFFF');
      expect(darkResult.current.colors.cardBackground).toBe('#1F2937');
    });
  });
});

describe('useChartPalette', () => {
  beforeEach(() => {
    mockResolvedTheme = 'light';
  });

  it('should return array of colors', () => {
    const { result } = renderHook(() => useChartPalette());

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(8);
  });

  it('should return light palette for light theme', () => {
    mockResolvedTheme = 'light';
    const { result } = renderHook(() => useChartPalette());

    expect(result.current[0]).toBe('#6366F1'); // Indigo-500
  });

  it('should return dark palette for dark theme', () => {
    mockResolvedTheme = 'dark';
    const { result } = renderHook(() => useChartPalette());

    expect(result.current[0]).toBe('#818CF8'); // Indigo-400
  });
});
