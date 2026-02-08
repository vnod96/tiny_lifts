import { useState } from 'react';
import { AlertTriangle, TrendingUp, Minus as MinusIcon, Pencil, X } from 'lucide-react';
import { NumberStepper } from '../shared/NumberStepper';
import { usePlateauDetection } from '../../hooks/usePlateauDetection';
import { useStore } from '../../store/StoreProvider';

interface LoggedSet {
  id: string;
  weight: number;
  reps: number;
  setNumber: number;
}

interface Props {
  exerciseId: string;
  sessionId: string;
  loggedSets: LoggedSet[];
  currentWeight: number;
  currentReps: number;
  onWeightChange: (v: number) => void;
  onRepsChange: (v: number) => void;
  onLogSet: () => void;
}

export function ExerciseCard({
  exerciseId,
  sessionId,
  loggedSets,
  currentWeight,
  currentReps,
  onWeightChange,
  onRepsChange,
  onLogSet,
}: Props) {
  const { store } = useStore();
  const exercise = store.getRow('exercises', exerciseId);
  const name = (exercise?.name as string) || 'Exercise';

  const [targetReps, setTargetReps] = useState((exercise?.target_reps as number) || 5);
  const [targetSets, setTargetSets] = useState((exercise?.target_sets as number) || 5);

  const handleRepsChange = (v: number) => {
    setTargetReps(v);
    store.setCell('exercises', exerciseId, 'target_reps', v);
    onRepsChange(v); // Also update the current input value
  };

  const handleSetsChange = (v: number) => {
    setTargetSets(v);
    store.setCell('exercises', exerciseId, 'target_sets', v);
  };

  const plateau = usePlateauDetection(exerciseId);
  const allSetsDone = loggedSets.length >= targetSets;

  const [editing, setEditing] = useState(false);

  return (
    <div className="animate-fade-slide-up rounded-2xl bg-atlas-surface border border-atlas-border overflow-hidden elevation-1 transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-atlas-border">
        <h3 className="font-bold text-atlas-text text-base">{name}</h3>
        <div className="flex items-center gap-2 ml-auto mr-3">
          <span className="text-xs text-atlas-text-muted">
            <span className="font-semibold text-atlas-text">{currentWeight}</span>kg
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {plateau.isPlateau && (
            <span className="animate-scale-pop flex items-center gap-1 px-2 py-1 rounded-full bg-atlas-warning/20 text-atlas-warning text-xs font-semibold">
              <AlertTriangle size={12} />
              Plateau
            </span>
          )}
          {/* Edit toggle button */}
          {!allSetsDone && (
            <button
              type="button"
              onClick={() => setEditing((prev) => !prev)}
              className={`ripple w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 ${
                editing
                  ? 'bg-atlas-accent text-white'
                  : 'bg-atlas-surface-alt text-atlas-text-muted hover:text-atlas-text'
              }`}
              aria-label={editing ? 'Close editor' : 'Edit weight & reps'}
            >
              {editing ? <X size={14} /> : <Pencil size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Weight & Reps input — shown only when editing */}
      {!allSetsDone && editing && (
        <div className="px-4 pb-4 pt-3 border-b border-atlas-border/50 animate-fade-slide-up space-y-3">
          <NumberStepper
            value={currentWeight}
            onChange={onWeightChange}
            step={2.5}
            min={0}
            label="Weight"
            unit="kg"
            horizontal
          />
          <NumberStepper
            value={targetReps}
            onChange={handleRepsChange}
            step={1}
            min={1}
            max={30}
            label="Reps"
            horizontal
          />
          <NumberStepper
            value={targetSets}
            onChange={handleSetsChange}
            step={1}
            min={1}
            max={10}
            label="Sets"
            horizontal
          />
        </div>
      )}

      {/* Set boxes — tap the next box to log a set */}
      <div className="px-4 py-3 flex items-center gap-2">
        {Array.from({ length: targetSets }, (_, i) => {
          const setNum = i + 1;
          const logged = loggedSets.find((s) => s.setNumber === setNum);
          const isNext = !logged && loggedSets.length === i;
          const repsHit = logged ? logged.reps >= targetReps : false;
          const canTap = isNext && !!sessionId; // Only allow tapping if session is active

          return (
            <button
              key={setNum}
              type="button"
              disabled={!canTap}
              onClick={canTap ? onLogSet : undefined}
              className={`flex-1 flex flex-col items-center justify-center rounded-xl py-2.5 border-2 min-h-[44px]
                transition-all duration-200
                ${logged
                  ? repsHit
                    ? 'animate-scale-pop bg-atlas-success/15 border-atlas-success text-atlas-success'
                    : 'animate-scale-pop bg-atlas-warning/15 border-atlas-warning text-atlas-warning'
                  : canTap
                    ? 'animate-glow-pulse bg-atlas-accent/10 border-atlas-accent text-atlas-accent cursor-pointer active:scale-90'
                    : 'bg-atlas-surface-alt/50 border-atlas-border text-atlas-text-muted cursor-not-allowed opacity-60'
                }`}
            >
              <span className="text-lg font-bold leading-none">
                {logged ? logged.reps : targetReps}
              </span>
              <span className="text-[10px] mt-0.5 opacity-70">
                {logged ? `${logged.weight}kg` : canTap ? 'TAP' : `Set ${setNum}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Suggestion area */}
      {(plateau.progressionSuggestion || plateau.isPlateau) && (
        <div
          className={`animate-fade-slide-up px-4 py-2.5 text-xs font-medium border-t ${
            plateau.isPlateau
              ? 'bg-atlas-warning/10 text-atlas-warning border-atlas-warning/20'
              : 'bg-atlas-success/10 text-atlas-success border-atlas-success/20'
          }`}
        >
          {plateau.isPlateau ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>Deload to {plateau.suggestedDeloadWeight} kg</span>
              </div>
              {plateau.suggestedRepScheme && (
                <div className="flex items-center gap-1">
                  <MinusIcon size={12} />
                  <span>Try switching to {plateau.suggestedRepScheme}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{plateau.progressionSuggestion}</span>
            </div>
          )}
        </div>
      )}

      {allSetsDone && (
        <div className="animate-fade-slide-up px-4 py-3 bg-atlas-success/10 border-t border-atlas-success/20 text-atlas-success text-sm font-semibold text-center">
          All {targetSets} sets complete!
        </div>
      )}
    </div>
  );
}
