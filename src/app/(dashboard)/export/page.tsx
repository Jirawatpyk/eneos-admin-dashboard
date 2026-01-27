import type { Metadata } from 'next';
import { ExportForm } from '@/components/export/export-form';

/**
 * Export & Reports Page
 * Story 6.1: Export to Excel
 *
 * Provides comprehensive export interface with:
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

      {/* Export Form (Task 2) */}
      <ExportForm />
    </div>
  );
}
