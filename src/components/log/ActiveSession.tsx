import { useCallback, useMemo, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { ExerciseCard } from './ExerciseCard';
import { RestTimerModal } from './RestTimerModal';
import { VolumeComparison } from '../progress/VolumeComparison';
import { useStore } from '../../store/StoreProvider';
import { useRestTimer, classifyIntensity } from '../../hooks/useRestTimer';
import { useSessionVolume } from '../../hooks/useSessionVolume';
import type { VolumeInfo } from '../../hooks/useSessionVolume';

interface Props {
  workoutId: string;
  sessionId: string;
  onEnd: () => void;
  sessionStart: number;
  onSetSessionStart: (ts: number) => void;
}

export function ActiveSession({
  workoutId,
  sessionId,
  onEnd,
  sessionStart,
  onSetSessionStart,
}: Props) {
  const { store } = useStore();
  const restTimer = useRestTimer();

  const [elapsedStr, setElapsedStr] = useState('00:00');

  // Per-exercise input state
  const [inputState, setInputState] = useState<
    Record<string, { weight: number; reps: number }>
  >({});

  // Get exercises for current workout
  const exerciseIds = useMemo(() => {
    const weTable = store.getTable('workout_exercises');
    return Object.entries(weTable)
      .filter(([, we]) => we.workout_id === workoutId)
      .sort((a, b) => (a[1].order as number) - (b[1].order as number))
      .map(([, we]) => we.exercise_id as string);
  }, [store, workoutId, store.getTable('workout_exercises')]);

  // Get logged sets for current session
  const loggedSets = useMemo(() => {
    const allSets = store.getTable('sets');
    const byExercise: Record<
      string,
      Array<{ id: string; weight: number; reps: number; setNumber: number }>
    > = {};

    for (const [id, s] of Object.entries(allSets)) {
      if (s.session_id !== sessionId) continue;
      const eid = s.exercise_id as string;
      if (!byExercise[eid]) byExercise[eid] = [];
      byExercise[eid].push({
        id,
        weight: s.weight as number,
        reps: s.reps as number,
        setNumber: s.set_number as number,
      });
    }

    for (const arr of Object.values(byExercise)) {
      arr.sort((a, b) => a.setNumber - b.setNumber);
    }
    return byExercise;
  }, [sessionId, store, store.getTable('sets')]);

  const volume = useSessionVolume(sessionId);

  // Session timer tick
  useEffect(() => {
    if (!sessionStart) return;
    const iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      setElapsedStr(
        `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      );
    }, 1000);
    return () => clearInterval(iv);
  }, [sessionStart]);

  // End session — discard if no sets were logged
  const endSession = useCallback(() => {
    const hasLoggedSets = Object.keys(loggedSets).length > 0;

    if (hasLoggedSets && volume.currentVolume > 0) {
      // Save as completed
      store.setCell('sessions', sessionId, 'end_time', Date.now());
      store.setCell('sessions', sessionId, 'total_volume', volume.currentVolume);
      store.setCell('sessions', sessionId, 'status', 'completed');
    } else {
      // Discard empty session — remove the session row and any stray sets
      const allSets = store.getTable('sets');
      for (const [setId, s] of Object.entries(allSets)) {
        if (s.session_id === sessionId) {
          store.delRow('sets', setId);
        }
      }
      store.delRow('sessions', sessionId);
    }

    restTimer.reset();
    onEnd();
  }, [sessionId, store, volume.currentVolume, loggedSets, restTimer, onEnd]);

  // Log a set for an exercise
  const logSet = useCallback(
    (exerciseId: string) => {
      const ex = store.getRow('exercises', exerciseId);
      const defaultWeight = (ex?.default_weight as number) || 20;
      const defaultReps = (ex?.target_reps as number) || 5;
      const input = inputState[exerciseId] || {
        weight: defaultWeight,
        reps: defaultReps,
      };
      const existing = loggedSets[exerciseId] || [];
      const setNumber = existing.length + 1;

      store.setRow('sets', `set-${nanoid(8)}`, {
        session_id: sessionId,
        exercise_id: exerciseId,
        weight: input.weight,
        reps: input.reps,
        timestamp: Date.now(),
        set_number: setNumber,
      });

      // Auto-start rest timer based on intensity
      const maxWeight = Math.max(
        input.weight,
        ...existing.map((s) => s.weight),
      );
      const intensity = classifyIntensity(input.weight, maxWeight);
      restTimer.start(intensity);

      // Vibrate feedback
      if (navigator.vibrate) navigator.vibrate(50);
    },
    [sessionId, inputState, loggedSets, store, restTimer],
  );

  const getInput = (eid: string) => {
    if (inputState[eid]) return inputState[eid];
    const ex = store.getRow('exercises', eid);
    return {
      weight: (ex?.default_weight as number) || 20,
      reps: (ex?.target_reps as number) || 5,
    };
  };
  const setWeight = (eid: string, w: number) =>
    setInputState((prev) => ({
      ...prev,
      [eid]: { ...getInput(eid), weight: w },
    }));
  const setReps = (eid: string, r: number) =>
    setInputState((prev) => ({
      ...prev,
      [eid]: { ...getInput(eid), reps: r },
    }));

  const workoutName =
    (store.getRow('workouts', workoutId)?.name as string) || 'Workout';

  return (
    <>
      {/* Session header */}
      <div className="animate-fade-slide-up flex items-center justify-between rounded-2xl bg-atlas-surface border border-atlas-border px-4 py-3 elevation-1">
        <div>
          <div className="text-xs text-atlas-text-muted">Current Workout</div>
          <div className="font-bold text-atlas-text">{workoutName}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-atlas-text-muted">Elapsed</div>
          <div className="text-lg font-bold text-atlas-text tabular-nums">
            {elapsedStr}
          </div>
        </div>
      </div>

      {/* Start and End session buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onSetSessionStart(Date.now())}
          className="animate-fade-slide-up ripple flex-1 h-12 rounded-2xl bg-atlas-success/20 text-atlas-success font-semibold text-base active:bg-atlas-success/30 active:scale-[0.98] transition-all duration-200 border border-atlas-success/30"
        >
          Start Workout
        </button>
        <button
          onClick={endSession}
          className="animate-fade-slide-up ripple flex-1 h-12 rounded-2xl bg-atlas-danger/20 text-atlas-danger font-semibold text-base active:bg-atlas-danger/30 active:scale-[0.98] transition-all duration-200 border border-atlas-danger/30"
        >
          End Workout
        </button>
      </div>

      {/* Volume comparison */}
      <VolumeComparison volume={volume} />

      {/* Exercise cards */}
      {exerciseIds.map((eid) => {
        const input = getInput(eid);
        return (
          <ExerciseCard
            key={eid}
            exerciseId={eid}
            sessionId={sessionId}
            loggedSets={loggedSets[eid] || []}
            currentWeight={input.weight}
            currentReps={input.reps}
            onWeightChange={(w) => setWeight(eid, w)}
            onRepsChange={(r) => setReps(eid, r)}
            onLogSet={() => logSet(eid)}
          />
        );
      })}

      {/* Rest timer overlay */}
      <RestTimerModal timer={restTimer} onDismiss={restTimer.reset} />
    </>
  );
}
