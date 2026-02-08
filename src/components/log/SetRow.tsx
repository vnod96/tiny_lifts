import { Check } from 'lucide-react';

interface Props {
  setNumber: number;
  weight: number;
  reps: number;
  logged: boolean;
  targetReps?: number;
}

export function SetRow({ setNumber, weight, reps, logged, targetReps }: Props) {
  const repsHit = targetReps ? reps >= targetReps : true;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        logged ? 'bg-atlas-surface-alt/50' : ''
      }`}
    >
      <span className="text-xs font-medium text-atlas-text-muted w-10">
        Set {setNumber}
      </span>
      <span className="text-base font-bold text-atlas-text w-20 text-right">
        {weight}<span className="text-xs text-atlas-text-muted ml-0.5">kg</span>
      </span>
      <span className="text-atlas-text-muted mx-1">×</span>
      <span
        className={`text-base font-bold w-8 ${
          logged
            ? repsHit
              ? 'text-atlas-success'
              : 'text-atlas-warning'
            : 'text-atlas-text'
        }`}
      >
        {reps}
      </span>
      {logged && (
        <Check size={16} className="text-atlas-success ml-auto" />
      )}
    </div>
  );
}
