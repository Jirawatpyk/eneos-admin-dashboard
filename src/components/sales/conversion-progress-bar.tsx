/**
 * Conversion Progress Bar Component
 * Story 3.2: Conversion Rate Analytics
 *
 * AC#5: Visual Progress Indicators
 * - Mini progress bar alongside percentage
 * - Bar fills proportionally (max 100% at rate = 50%+)
 * - Colors: green >= 30%, amber 10-29%, red < 10%
 * - Accessible aria-label with rate and status
 */
import { cn } from '@/lib/utils';
import {
  PROGRESS_BAR_MAX_RATE,
  getConversionStatus,
  getConversionColorClass,
} from '@/lib/sales-constants';

interface ConversionProgressBarProps {
  rate: number;
}

/**
 * Calculate fill width percentage
 * Max 100% at PROGRESS_BAR_MAX_RATE conversion rate (exceptional performance)
 */
function calculateFillPercent(rate: number): number {
  if (rate < 0) return 0;
  return Math.min((rate / PROGRESS_BAR_MAX_RATE) * 100, 100);
}

export function ConversionProgressBar({ rate }: ConversionProgressBarProps) {
  // Handle N/A case (rate is -1 from getConversionRateValue when claimed=0)
  const isNA = rate < 0;
  const displayRate = isNA ? 0 : rate;
  const fillPercent = calculateFillPercent(displayRate);
  const colorClass = getConversionColorClass(rate);
  const status = getConversionStatus(rate);

  return (
    <div className="flex items-center gap-2 justify-end">
      <span className="text-sm font-medium w-14 text-right text-muted-foreground">
        {isNA ? 'N/A' : `${rate.toFixed(1)}%`}
      </span>
      <div
        className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]"
        role="progressbar"
        aria-valuenow={isNA ? 0 : rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isNA ? 'Conversion rate: N/A, no data' : `Conversion rate: ${rate.toFixed(1)}%, ${status}`}
      >
        <div
          data-testid="progress-fill"
          className={cn('h-full rounded-full transition-all', colorClass)}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}
