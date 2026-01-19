/**
 * Chart Theme Hook
 * Story 7.2: Theme Toggle (AC#7)
 *
 * Provides theme-aware colors for Recharts components.
 * Handles hydration safely with mounted state check.
 */
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Chart theme colors interface
 */
export interface ChartThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  grid: string;
  text: string;
  textMuted: string;
  background: string;
  cardBackground: string;
}

/**
 * Returns the current chart theme configuration
 */
export interface UseChartThemeReturn {
  colors: ChartThemeColors;
  isDark: boolean;
  mounted: boolean;
}

/**
 * Light mode chart colors (ENEOS palette)
 */
const LIGHT_COLORS: ChartThemeColors = {
  primary: '#6366F1',    // Indigo-500
  secondary: '#10B981',  // Emerald-500
  tertiary: '#F59E0B',   // Amber-500
  quaternary: '#EF4444', // Red-500
  grid: '#E5E7EB',       // Gray-200
  text: '#111827',       // Gray-900
  textMuted: '#6B7280',  // Gray-500
  background: '#FFFFFF', // White
  cardBackground: '#FFFFFF',
};

/**
 * Dark mode chart colors (adjusted for visibility)
 */
const DARK_COLORS: ChartThemeColors = {
  primary: '#818CF8',    // Indigo-400 (brighter for dark bg)
  secondary: '#34D399',  // Emerald-400
  tertiary: '#FBBF24',   // Amber-400
  quaternary: '#F87171', // Red-400
  grid: '#374151',       // Gray-700
  text: '#F9FAFB',       // Gray-50
  textMuted: '#9CA3AF',  // Gray-400
  background: '#111827', // Gray-900
  cardBackground: '#1F2937', // Gray-800
};

/**
 * Hook to get theme-aware chart colors
 * Handles hydration safely - returns light theme defaults during SSR
 */
export function useChartTheme(): UseChartThemeReturn {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to light theme during SSR to prevent hydration mismatch
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  return {
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    isDark,
    mounted,
  };
}

/**
 * Get chart color palette for multi-series charts
 */
export function useChartPalette(): string[] {
  const { isDark, mounted } = useChartTheme();

  if (!mounted) {
    // Return light palette during SSR
    return [
      '#6366F1', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    ];
  }

  return isDark
    ? [
        '#818CF8', '#34D399', '#FBBF24', '#F87171',
        '#A78BFA', '#F472B6', '#22D3EE', '#A3E635',
      ]
    : [
        '#6366F1', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      ];
}
