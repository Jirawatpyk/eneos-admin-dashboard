'use client';

import { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useExport, type ExportFormat, type ExportStatus } from '@/hooks/use-export';
import { useSalesOwners } from '@/hooks/use-sales-owners';
import { useCampaigns } from '@/hooks/use-campaigns';
import type { DateRange } from 'react-day-picker';

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

  const { exportData, isExporting } = useExport();
  const { data: salesOwners, isLoading: isLoadingOwners } = useSalesOwners();
  const { data: campaigns, isLoading: isLoadingCampaigns } = useCampaigns();

  const handleExport = async () => {
    try {
      await exportData(formData);
    } catch (error) {
      // Error already handled by useExport hook (toast notification)
      console.error('Export failed:', error);
    }
  };

  return (
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

        {/* Date Range Filter (Task 2.2) */}
        <div className="space-y-3">
          <Label htmlFor="date-range">Date Range (Optional)</Label>
          <DateRangePicker
            value={formData.dateRange}
            onChange={(range) => setFormData({ ...formData, dateRange: range })}
          />
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

        {/* Note: Claimed and Grounding filters not supported by backend API */}

        {/* Export Button (Task 2.8) */}
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
          size="lg"
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : `Export as ${formData.format.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
}
