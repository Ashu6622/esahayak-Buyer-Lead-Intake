import { Badge } from '@/components/ui/badge';
import { Lead } from '@/lib/definitions';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: Lead['status'];
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusColors: Record<Lead['status'], string> = {
    New: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    Contacted: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800',
    Showing: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
    'Under Contract': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
    Closed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
    Lost: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold',
        statusColors[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}
