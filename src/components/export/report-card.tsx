'use client';

/**
 * ReportCard Component
 * Story 6.3: Quick Reports - Task 2 & Task 4
 *
 * Individual report card with preview stats, format selector, and generate button.
 */
import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useExport, type ExportFormat } from '@/hooks/use-export';
import { getReportDateRange, formatReportDateLabel } from '@/lib/report-date-utils';
import type { ReportPreset } from '@/components/export/quick-reports';

interface ReportCardProps {
  preset: ReportPreset;
  stats: Record<string, string | number> | null;
  isLoading: boolean;
}

function formatStatValue(key: string, value: string | number | undefined): string {
  if (value === null || value === undefined) return '--';
  if (key === 'conversionRate') return `${value}%`;
  if (typeof value === 'string') return value;
  return String(value);
}

export function ReportCard({ preset, stats, isLoading }: ReportCardProps) {
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [isGenerating, setIsGenerating] = useState(false);
  const { exportData } = useExport();
  const Icon = preset.icon;

  const handleGenerate = async () => {
    setIsGenerating(true);
    const range = getReportDateRange(preset.type);
    try {
      await exportData({
        format,
        dateRange: { from: range.from, to: range.to },
        status: 'all',
        owner: 'all',
        campaign: 'all',
      });
    } catch (error) {
      // exportData() handles its own error toast - DO NOT add another
      console.error('Quick report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{preset.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {formatReportDateLabel(preset.type)}
          </Badge>
        </div>
        <CardDescription>{preset.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {preset.stats.map((stat) => (
            <div key={stat.key} className="text-center">
              {isLoading ? (
                <Skeleton className="mx-auto mb-1 h-6 w-12" data-testid="stat-skeleton" />
              ) : (
                <p className="text-lg font-semibold">
                  {stats ? formatStatValue(stat.key, stats[stat.key]) : '--'}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xlsx">xlsx</SelectItem>
            <SelectItem value="csv">csv</SelectItem>
            <SelectItem value="pdf">pdf</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="flex-1 h-8"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating}
          aria-label={`Generate ${preset.title} report`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-3 w-3" />
              Generate
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
