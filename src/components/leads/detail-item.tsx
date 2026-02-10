import { cn } from '@/lib/utils';

interface DetailItemProps {
  label: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}

export function DetailItem({ label, value, icon, className }: DetailItemProps) {
  // Handle empty, null, undefined, '-', and whitespace-only string values
  if (!value || value === '-') return null;
  if (typeof value === 'string' && value.trim() === '') return null;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="p-2 rounded-lg bg-muted shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  );
}
