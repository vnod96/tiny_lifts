import { Clock, Dumbbell, TrendingUp } from 'lucide-react';

interface Props {
  workoutName: string;
  date: number;
  totalVolume: number;
  durationMin: number;
  exerciseCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function SessionCard({
  workoutName,
  date,
  totalVolume,
  durationMin,
  exerciseCount,
  isExpanded,
  onToggle,
  children,
}: Props) {
  return (
    <div className="animate-fade-slide-up rounded-2xl bg-atlas-surface border border-atlas-border overflow-hidden elevation-1 hover-elevate">
      <button
        type="button"
        onClick={onToggle}
        className="ripple w-full px-4 py-3 flex items-center justify-between text-left active:bg-atlas-surface-alt transition-all duration-200"
      >
        <div>
          <div className="font-bold text-atlas-text text-base">
            {workoutName}
          </div>
          <div className="text-xs text-atlas-text-muted mt-0.5">
            {formatDate(date)}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-atlas-text-muted">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {totalVolume.toLocaleString()} kg
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {durationMin}m
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell size={12} />
            {exerciseCount}
          </span>
        </div>
      </button>

      {isExpanded && children && (
        <div className="px-4 pb-3 pt-1 border-t border-atlas-border/50">
          {children}
        </div>
      )}
    </div>
  );
}
