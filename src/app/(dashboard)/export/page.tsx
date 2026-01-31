import type { Metadata } from 'next';
import { ExportForm } from '@/components/export/export-form';
import { QuickReports } from '@/components/export/quick-reports';
import { Separator } from '@/components/ui/separator';

/**
 * Export & Reports Page
 * Story 6.1: Export to Excel
 * Story 6.3: Quick Reports - Added QuickReports section above Custom Export
 *
 * Provides comprehensive export interface with:
 * - Quick report presets (Daily, Weekly, Monthly) with one-click generation
 * - Multiple format support (Excel, CSV, PDF)
 * - Advanced filtering (date range, status, owner, campaign)
 * - Server-side export via backend API
 */

export const metadata: Metadata = {
  title: 'Export & Reports - ENEOS Admin',
  description: 'Export lead data to Excel, CSV, or PDF with advanced filtering options',
};

export default function ExportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export & Reports</h1>
        <p className="text-muted-foreground">
          Export lead data with customizable filters and format options
        </p>
      </div>

      {/* Quick Reports (Story 6.3) */}
      <QuickReports />

      {/* Section Divider (AC#11) */}
      <div className="space-y-2">
        <Separator />
        <h2 className="text-lg font-semibold">Custom Export</h2>
        <p className="text-sm text-muted-foreground">
          Full control with advanced filters and format options
        </p>
      </div>

      {/* Custom Export Form */}
      <ExportForm />
    </div>
  );
}
