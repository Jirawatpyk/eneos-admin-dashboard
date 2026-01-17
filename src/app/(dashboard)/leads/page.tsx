import { Suspense } from 'react';
import { Metadata } from 'next';
import { LeadTableContainer } from '@/components/leads';

/**
 * Leads Page
 * Story 4.1: Lead List Table
 *
 * AC#1: Page Setup
 * - Accessible at /leads
 * - Title: "Lead Management"
 * - Shows data table with all leads
 * - Renders within 3 seconds
 */

export const metadata: Metadata = {
  title: 'Lead Management | ENEOS Admin',
  description: 'View and manage all leads in the ENEOS sales pipeline',
};

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            View and manage all leads in your sales pipeline
          </p>
        </div>
      </div>

      {/* Lead Table with Suspense for streaming */}
      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-gray-100 rounded" />
            <div className="h-96 bg-gray-100 rounded" />
          </div>
        }
      >
        <LeadTableContainer />
      </Suspense>
    </div>
  );
}
