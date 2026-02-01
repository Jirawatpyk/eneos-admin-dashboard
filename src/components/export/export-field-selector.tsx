'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LEAD_EXPORT_COLUMNS } from '@/lib/export-leads';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types/lead';

interface ExportFieldSelectorProps {
  selectedFields: Set<keyof Lead>;
  onFieldsChange: (fields: Set<keyof Lead>) => void;
  isPdfFormat: boolean;
}

export function ExportFieldSelector({
  selectedFields,
  onFieldsChange,
  isPdfFormat,
}: ExportFieldSelectorProps) {
  const { toast } = useToast();
  const totalFields = LEAD_EXPORT_COLUMNS.length;
  const selectedCount = selectedFields.size;
  const allSelected = selectedCount === totalFields;

  const handleToggleField = (key: keyof Lead, checked: boolean) => {
    if (!checked && selectedCount <= 1) {
      toast({
        title: 'Cannot deselect',
        description: 'At least one field must be selected',
        variant: 'destructive',
      });
      return;
    }
    const next = new Set(selectedFields);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    onFieldsChange(next);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all except Company (first column)
      onFieldsChange(new Set([LEAD_EXPORT_COLUMNS[0].key]));
    } else {
      onFieldsChange(new Set(LEAD_EXPORT_COLUMNS.map((c) => c.key)));
    }
  };

  return (
    <div className="space-y-3" data-testid="field-selector">
      {/* Header row: label + badge + toggle button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Data Fields</Label>
          <Badge variant="secondary" data-testid="field-count">
            {allSelected ? 'All fields' : `${selectedCount} of ${totalFields}`}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          disabled={isPdfFormat}
          data-testid="select-all-toggle"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {/* PDF disabled note */}
      {isPdfFormat && (
        <p className="text-sm text-muted-foreground" data-testid="pdf-note">
          PDF uses a fixed layout — field selection applies to Excel and CSV only.
        </p>
      )}

      {/* Checkbox grid */}
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 gap-2',
          isPdfFormat && 'opacity-50 pointer-events-none'
        )}
        data-testid="field-checkbox-grid"
      >
        {LEAD_EXPORT_COLUMNS.map((col) => (
          <label
            key={col.key}
            className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-accent"
            data-testid={`field-${col.key}`}
          >
            <Checkbox
              checked={selectedFields.has(col.key)}
              onCheckedChange={(checked) => handleToggleField(col.key, !!checked)}
              disabled={isPdfFormat}
            />
            <span className="text-sm">{col.header}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
