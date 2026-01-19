'use client';

/**
 * Theme Provider Wrapper
 * Story 7.2: Theme Toggle (AC#4, AC#5, AC#6)
 *
 * Re-exports next-themes ThemeProvider for use in the app.
 * Configuration is applied in src/app/providers.tsx:
 * - attribute="class" for Tailwind CSS integration
 * - defaultTheme="system" for OS preference detection (AC#5)
 * - enableSystem for automatic system theme detection
 * - disableTransitionOnChange to prevent FOUC (AC#6)
 * - localStorage persistence handled by next-themes (AC#4)
 */
import { type ComponentProps } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
