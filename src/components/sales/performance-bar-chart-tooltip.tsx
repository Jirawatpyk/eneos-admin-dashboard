/**
 * Performance Bar Chart Custom Tooltip
 * Story 3.3: Sales Performance Bar Chart
 *
 * AC#4: Hover Tooltip
 * - Shows sales person's name
 * - Shows metric name and exact value
 * - Shows conversion rate
 */

interface TooltipPayload {
  name: string;
  fullName: string;
  userId: string;
  claimed: number;
  contacted: number;
  closed: number;
  conversionRate: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: TooltipPayload; name: string; value: number; color: string }[];
  label?: string;
}

export function PerformanceBarChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[150px]">
      <p className="font-medium text-foreground">{data.fullName}</p>
      <div className="mt-2 space-y-1 text-sm">
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
            <span>{entry.name}:</span>
            <span className="font-medium">{entry.value.toLocaleString()}</span>
          </p>
        ))}
        <p className="text-muted-foreground pt-1 border-t mt-2 flex justify-between gap-4">
          <span>Conversion:</span>
          <span className="font-medium">{data.conversionRate.toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
}
