import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { useExerciseHistory } from '../../hooks/useExerciseHistory';
import { usePlateauDetection } from '../../hooks/usePlateauDetection';

interface Props {
  exerciseId: string;
  exerciseName: string;
}

export function ExerciseProgressCard({ exerciseId, exerciseName }: Props) {
  const history = useExerciseHistory(exerciseId, 5);
  const plateau = usePlateauDetection(exerciseId);
  const [expanded, setExpanded] = useState(false);

  const latest = history[0];
  const prev = history[1];

  // Determine trend
  let trendIcon = <Minus size={14} className="text-atlas-text-muted" />;
  let trendLabel = 'No data';
  let trendColor = 'text-atlas-text-muted';

  if (latest && prev) {
    if (latest.maxWeight > prev.maxWeight || latest.totalReps > prev.totalReps) {
      trendIcon = <TrendingUp size={14} />;
      trendLabel = 'Improving';
      trendColor = 'text-atlas-success';
    } else if (latest.maxWeight < prev.maxWeight) {
      trendIcon = <TrendingDown size={14} />;
      trendLabel = 'Declining';
      trendColor = 'text-atlas-danger';
    } else {
      trendIcon = <Minus size={14} />;
      trendLabel = 'Flat';
      trendColor = 'text-atlas-warning';
    }
  } else if (latest) {
    trendLabel = 'First session';
  }

  return (
    <div className="animate-fade-slide-up rounded-2xl bg-atlas-surface border border-atlas-border overflow-hidden elevation-1 hover-elevate">
      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        className="ripple w-full px-4 py-3 flex items-center justify-between text-left active:bg-atlas-surface-alt transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-atlas-text text-base">
            {exerciseName}
          </h3>
          {plateau.isPlateau && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-atlas-warning/20 text-atlas-warning text-xs font-semibold">
              <AlertTriangle size={10} />
              Plateau
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            {trendIcon}
            {trendLabel}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-atlas-text-muted" />
          ) : (
            <ChevronDown size={16} className="text-atlas-text-muted" />
          )}
        </div>
      </button>

      {/* Summary line */}
      {latest && (
        <div className="px-4 pb-2 flex items-center gap-4 text-sm">
          <span className="text-atlas-text font-semibold">
            {latest.maxWeight} kg
          </span>
          <span className="text-atlas-text-muted">
            {latest.totalReps} total reps
          </span>
          <span className="text-atlas-text-muted text-xs ml-auto">
            {latest.totalVolume.toLocaleString()} vol
          </span>
        </div>
      )}

      {/* Expanded: last sessions */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-atlas-border/50 pt-2 space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-atlas-text-muted">No history yet.</p>
          ) : (
            <>
              <div className="text-xs font-medium text-atlas-text-muted uppercase tracking-wide mb-1">
                Recent Sessions
              </div>
              {history.map((h, i) => (
                <div
                  key={h.sessionId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-atlas-text-muted text-xs">
                    {new Date(h.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-atlas-text font-medium">
                    {h.maxWeight} kg × {h.totalReps} reps
                  </span>
                  <span className="text-xs text-atlas-text-muted">
                    {h.totalVolume.toLocaleString()} vol
                  </span>
                </div>
              ))}

              {/* Volume comparison bars */}
              <div className="mt-3">
                <div className="text-xs font-medium text-atlas-text-muted uppercase tracking-wide mb-2">
                  Volume Trend
                </div>
                {history
                  .slice()
                  .reverse()
                  .map((h) => {
                    const maxVol = Math.max(...history.map((x) => x.totalVolume));
                    const pct = maxVol > 0 ? (h.totalVolume / maxVol) * 100 : 0;
                    return (
                      <div key={h.sessionId} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-atlas-text-muted w-12">
                          {new Date(h.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <div className="flex-1 h-4 bg-atlas-surface-alt rounded-full overflow-hidden">
                          <div
                            className="h-full bg-atlas-accent rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-atlas-text-muted w-14 text-right">
                          {h.totalVolume.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {/* Suggestions */}
          {plateau.isPlateau && plateau.suggestedDeloadWeight && (
            <div className="mt-2 p-2 rounded-lg bg-atlas-warning/10 text-atlas-warning text-xs">
              <div className="flex items-center gap-1 font-semibold mb-1">
                <AlertTriangle size={12} />
                Plateau Detected
              </div>
              <p>Deload to {plateau.suggestedDeloadWeight} kg (10% reduction).</p>
              {plateau.suggestedRepScheme && (
                <p>Consider switching to {plateau.suggestedRepScheme}.</p>
              )}
            </div>
          )}

          {!plateau.isPlateau && plateau.progressionSuggestion && (
            <div className="mt-2 p-2 rounded-lg bg-atlas-success/10 text-atlas-success text-xs">
              <div className="flex items-center gap-1 font-semibold">
                <TrendingUp size={12} />
                {plateau.progressionSuggestion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
