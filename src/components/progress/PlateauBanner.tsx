import { AlertTriangle, ArrowDown, RefreshCw } from 'lucide-react';

interface Props {
  exerciseName: string;
  deloadWeight: number | null;
  repScheme: string | null;
}

export function PlateauBanner({
  exerciseName,
  deloadWeight,
  repScheme,
}: Props) {
  return (
    <div className="animate-fade-slide-up rounded-2xl bg-atlas-warning/10 border border-atlas-warning/20 p-4 elevation-1">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={18} className="text-atlas-warning animate-float" />
        <h3 className="font-bold text-atlas-warning text-sm">
          Plateau: {exerciseName}
        </h3>
      </div>
      <div className="space-y-2 text-sm text-atlas-text">
        {deloadWeight !== null && (
          <div className="flex items-center gap-2">
            <ArrowDown size={14} className="text-atlas-warning shrink-0" />
            <span>
              Deload to <strong>{deloadWeight} kg</strong> (10% reduction) to
              allow recovery.
            </span>
          </div>
        )}
        {repScheme && (
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-atlas-warning shrink-0" />
            <span>
              Switch to <strong>{repScheme}</strong> to maintain intensity with
              lower volume.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
