'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Eye, FileDown, FileSpreadsheet, FileText, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExport, type ExportFormat, type ExportStatus } from '@/hooks/use-export';
import { useSalesOwners } from '@/hooks/use-sales-owners';
import { useCampaigns } from '@/hooks/use-campaigns';
import { ExportDatePresets } from '@/components/export/export-date-presets';
import { ExportDateRangePicker } from '@/components/export/export-date-range-picker';
import { ExportFieldSelector } from '@/components/export/export-field-selector';
import { useRecordCount } from '@/hooks/use-record-count';
import { getExportDateRange, EXPORT_PRESETS, type ExportPresetType } from '@/lib/export-date-presets';
import { LEAD_EXPORT_COLUMNS } from '@/lib/export-leads';
import type { Lead } from '@/types/lead';
import type { DateRange } from 'react-day-picker';

// Dynamic import to prevent SSR issues with pdf.js (DOMMatrix is browser-only)
const PdfPreviewModal = dynamic(
  () => import('@/components/export/pdf-preview-modal').then((mod) => mod.PdfPreviewModal),
  { ssr: false }
);

interface ExportFormData {
  format: ExportFormat;
  dateRange?: DateRange;
  status: ExportStatus;
  owner: string;
  campaign: string;
}

export function ExportForm() {
  const [formData, setFormData] = useState<ExportFormData>({
    format: 'xlsx',
    status: 'all',
    owner: 'all',
    campaign: 'all',
  });
  const [selectedFields, setSelectedFields] = useState<Set<keyof Lead>>(
    new Set(LEAD_EXPORT_COLUMNS.map((c) => c.key))
  );
  const [activePreset, setActivePreset] = useState<ExportPresetType | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewFilename, setPreviewFilename] = useState('');

  const { exportData, previewPdf, isExporting, isPreviewing } = useExport();
  const { data: salesOwners, isLoading: isLoadingOwners } = useSalesOwners();
  const { data: campaigns, isLoading: isLoadingCampaigns } = useCampaigns();

  // AC#5: Record count from leads API (no campaign - leads API doesn't support it)
  const { count: recordCount, isLoading: isCountLoading } = useRecordCount({
    dateRange: formData.dateRange,
    status: formData.status,
    owner: formData.owner,
  });
  const hasCampaignFilter = formData.campaign !== 'all';

  // Cleanup blob on unmount to release memory (M1: large binary data)
  useEffect(() => {
    return () => {
      setPreviewBlob(null);
    };
  }, []);

  // AC#1: Toggle preset - clicking active preset clears it
  const handlePresetSelect = (preset: ExportPresetType) => {
    if (activePreset === preset) {
      setActivePreset(null);
      setFormData({ ...formData, dateRange: undefined });
    } else {
      const range = getExportDateRange(preset);
      setActivePreset(preset);
      setFormData({ ...formData, dateRange: range });
    }
  };

  // AC#2: Custom range clears active preset
  const handleCustomDateChange = (range: DateRange | undefined) => {
    setActivePreset(null);
    setFormData({ ...formData, dateRange: range });
  };

  // AC#2: Clear resets everything
  const handleDateClear = () => {
    setActivePreset(null);
    setFormData({ ...formData, dateRange: undefined });
  };

  // Convert Set<keyof Lead> to header strings for ExportParams
  const selectedFieldHeaders = LEAD_EXPORT_COLUMNS
    .filter((col) => selectedFields.has(col.key))
    .map((col) => col.header);

  const handleExport = async () => {
    try {
      await exportData({ ...formData, fields: selectedFieldHeaders });
    } catch {
      // Error already handled by useExport hook (toast notification)
    }
  };

  const handlePreviewPdf = async () => {
    try {
      const result = await previewPdf({ ...formData, fields: selectedFieldHeaders });
      setPreviewBlob(result.blob);
      setPreviewFilename(result.filename);
      setPreviewModalOpen(true);
    } catch {
      // Error already handled by useExport hook (toast notification)
    }
  };

  const handleClosePreview = () => {
    setPreviewModalOpen(false);
    setPreviewBlob(null);
    setPreviewFilename('');
  };

  const handleSwitchToExcel = () => {
    setFormData({ ...formData, format: 'xlsx' });
  };

  const isPdfFormat = formData.format === 'pdf';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Export Lead Data</CardTitle>
          <CardDescription>
            Select format and filters to export your lead data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection (Task 2.1) */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={formData.format}
              onValueChange={(value) => setFormData({ ...formData, format: value as ExportFormat })}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="xlsx"
                  id="format-xlsx"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="format-xlsx"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileSpreadsheet className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Excel (.xlsx)</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="csv"
                  id="format-csv"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="format-csv"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileText className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">CSV (.csv)</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="pdf"
                  id="format-pdf"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="format-pdf"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileDown className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">PDF (.pdf)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* AC#5: PDF Row Limit Warning */}
          {isPdfFormat && (
            <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200">
                  PDF limited to 100 rows. Use Excel/CSV for complete data.
                </p>
                <button
                  type="button"
                  onClick={handleSwitchToExcel}
                  className="mt-1 text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  aria-label="Switch to Excel"
                >
                  Switch to Excel
                </button>
              </div>
            </div>
          )}

          {/* Date Range Filter (Enhanced - Story 6.4) */}
          <div className="space-y-3" data-testid="date-range-section">
            <Label>Date Range</Label>
            <ExportDatePresets
              activePreset={activePreset}
              onPresetSelect={handlePresetSelect}
            />
            <ExportDateRangePicker
              value={formData.dateRange}
              onChange={handleCustomDateChange}
              onClear={handleDateClear}
              presetLabel={activePreset ? EXPORT_PRESETS.find((p) => p.type === activePreset)?.label : undefined}
            />
            <p className="text-sm text-muted-foreground" data-testid="record-count">
              Estimated records:{' '}
              <span className="font-medium">
                {isCountLoading ? '...' : (recordCount?.toLocaleString() ?? '--')}
              </span>
              {hasCampaignFilter && (
                <span className="ml-1 text-xs text-muted-foreground/70">(excludes campaign filter)</span>
              )}
            </p>
          </div>

          {/* Status Filter (Task 2.3) */}
          <div className="space-y-3">
            <Label htmlFor="status-filter">Lead Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as ExportStatus })}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="unreachable">Unreachable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Owner Filter (Task 2.4) */}
          <div className="space-y-3">
            <Label htmlFor="owner-filter">Sales Owner</Label>
            <Select
              value={formData.owner}
              onValueChange={(value) => setFormData({ ...formData, owner: value })}
              disabled={isLoadingOwners}
            >
              <SelectTrigger id="owner-filter">
                <SelectValue placeholder={isLoadingOwners ? 'Loading...' : 'Select owner'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales</SelectItem>
                {salesOwners
                  ?.filter((owner) => owner.id && owner.id.trim() !== '')
                  .map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Filter (Task 2.5) */}
          <div className="space-y-3">
            <Label htmlFor="campaign-filter">Campaign</Label>
            <Select
              value={formData.campaign}
              onValueChange={(value) => setFormData({ ...formData, campaign: value })}
              disabled={isLoadingCampaigns}
            >
              <SelectTrigger id="campaign-filter">
                <SelectValue placeholder={isLoadingCampaigns ? 'Loading...' : 'Select campaign'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns
                  ?.filter((campaign) => campaign.id && campaign.id.trim() !== '')
                  .map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Fields Selection (Story 6.5) */}
          <ExportFieldSelector
            selectedFields={selectedFields}
            onFieldsChange={setSelectedFields}
            isPdfFormat={isPdfFormat}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* AC#1: Preview PDF Button - visible only when PDF format selected */}
            {isPdfFormat && (
              <Button
                variant="outline"
                onClick={handlePreviewPdf}
                disabled={isPreviewing}
                className="flex-1"
                size="lg"
              >
                {isPreviewing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview PDF
                  </>
                )}
              </Button>
            )}

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className={isPdfFormat ? 'flex-1' : 'w-full'}
              size="lg"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : `Export as ${formData.format.toUpperCase()}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={previewModalOpen}
        onClose={handleClosePreview}
        pdfBlob={previewBlob}
        filename={previewFilename}
      />
    </>
  );
}
