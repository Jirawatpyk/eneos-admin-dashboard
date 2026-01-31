'use client';

import { Button } from '@/components/ui/button';
import { EXPORT_PRESETS, type ExportPresetType } from '@/lib/export-date-presets';

interface ExportDatePresetsProps {
  activePreset: ExportPresetType | null;
  onPresetSelect: (preset: ExportPresetType) => void;
}

export function ExportDatePresets({ activePreset, onPresetSelect }: ExportDatePresetsProps) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="export-date-presets">
      {EXPORT_PRESETS.map((preset) => (
        <Button
          key={preset.type}
          variant={activePreset === preset.type ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetSelect(preset.type)}
          data-testid={`preset-${preset.type}`}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
