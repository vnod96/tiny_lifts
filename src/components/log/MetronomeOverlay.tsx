import { X } from 'lucide-react';
import { MetronomeIcon } from '../shared/MetronomeIcon';
import type { MetronomeState } from '../../hooks/useMetronome';

interface Props {
  metronome: MetronomeState;
}

export function MetronomeOverlay({ metronome }: Props) {
  if (!metronome.isActive) return null;

  const isUp = metronome.phase === 'up';

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-safe">
      <div className="animate-fade-slide-up max-w-lg mx-auto mt-2 bg-atlas-surface border border-atlas-border rounded-2xl shadow-2xl elevation-3 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MetronomeIcon size={16} className="text-atlas-accent" />
            <span className="text-sm font-semibold text-atlas-text">
              5/5 Cadence
            </span>
            <span className="text-xs text-atlas-text-muted tabular-nums">
              Rep {metronome.currentRep}/{metronome.totalReps}
            </span>
          </div>
          <button
            onClick={metronome.stop}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-atlas-text-muted hover:text-atlas-text active:scale-90 transition-all duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Phase indicator */}
        <div className="text-center mb-3">
          <span
            className={`text-3xl font-bold transition-all duration-300 inline-block ${
              isUp ? 'text-atlas-accent translate-y-0' : 'text-atlas-warning translate-y-0'
            }`}
          >
            {isUp ? '▲ UP' : '▼ DOWN'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-4 bg-atlas-surface-alt rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ease-linear ${
              isUp ? 'bg-atlas-accent' : 'bg-atlas-warning'
            }`}
            style={{ width: `${metronome.progress * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-atlas-text-muted">
          <span>{Math.ceil(metronome.elapsed)}s</span>
          <span>5s</span>
        </div>
      </div>
    </div>
  );
}
