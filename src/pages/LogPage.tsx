import { useState, useCallback, useMemo, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { MetronomeIcon } from '../components/shared/MetronomeIcon';
import { PageShell } from '../components/layout/PageShell';
import { WorkoutSelector } from '../components/log/WorkoutSelector';
import { ExerciseCard } from '../components/log/ExerciseCard';
import { RestTimerModal } from '../components/log/RestTimerModal';
import { MetronomeOverlay } from '../components/log/MetronomeOverlay';
import { VolumeComparison } from '../components/progress/VolumeComparison';
import { useStore } from '../store/StoreProvider';
import { useRestTimer, classifyIntensity } from '../hooks/useRestTimer';
import { useMetronome } from '../hooks/useMetronome';
import { useSessionVolume } from '../hooks/useSessionVolume';
import { useExerciseHistory } from '../hooks/useExerciseHistory';
import { WORKOUT_IDS } from '../store/store';

export function LogPage() {
  const { store } = useStore();
  const restTimer = useRestTimer();
  const metronome = useMetronome();

  const [workoutId, setWorkoutId] = useState<string>(WORKOUT_IDS.a);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStart, setSessionStart] = useState(0);
  const [elapsedStr, setElapsedStr] = useState('00:00');

  // Per-exercise input state
  const [inputState, setInputState] = useState<
    Record<string, { weight: number; reps: number }>
  >({});

  // Get exercises for current workout
  const exerciseIds = useMemo(() => {
    const weTable = store.getTable('workout_exercises');
    const entries = Object.entries(weTable)
      .filter(([, we]) => we.workout_id === workoutId)
      .sort((a, b) => (a[1].order as number) - (b[1].order as number))
      .map(([, we]) => we.exercise_id as string);
    return entries;
  }, [store, workoutId, store.getTable('workout_exercises')]);

  // Get logged sets for current session
  const loggedSets = useMemo(() => {
    if (!sessionId) return {};
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
    if (!sessionActive) return;
    const iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      setElapsedStr(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [sessionStart]);

  // Start session — called directly when a workout card is tapped
  const startSession = useCallback(
    (wkId: string) => {
      setWorkoutId(wkId);
      const id = `ses-${nanoid(8)}`;
      store.setRow('sessions', id, {
        workout_id: wkId,
        start_time: Date.now(),
        end_time: 0,
        total_volume: 0,
        status: 'active',
      });
      setSessionId(id);
      setSessionActive(true);
      // setSessionStart(Date.now());
      setInputState({});
    },
    [store],
  );

  // End session
  const endSession = useCallback(() => {
    if (!sessionId) return;
    store.setCell('sessions', sessionId, 'end_time', Date.now());
    store.setCell('sessions', sessionId, 'total_volume', volume.currentVolume);
    store.setCell('sessions', sessionId, 'status', 'completed');
    setSessionActive(false);
    setSessionId(null);
    setElapsedStr('00:00');
    restTimer.reset();
    metronome.stop();
  }, [sessionId, store, volume.currentVolume, restTimer, metronome]);

  // Log a set for an exercise
  const logSet = useCallback(
    (exerciseId: string) => {
      if (!sessionId) return;

      const ex = store.getRow('exercises', exerciseId);
      const defaultWeight = (ex?.default_weight as number) || 20;
      const defaultReps = (ex?.target_reps as number) || 5;
      const input = inputState[exerciseId] || { weight: defaultWeight, reps: defaultReps };
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

  return (
    <PageShell
      title="TinyLifts"
      headerRight={
        sessionActive ? (
          <button
            onClick={metronome.toggle}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 ${
              metronome.isActive
                ? 'bg-atlas-accent text-white shadow-lg shadow-atlas-accent/25'
                : 'bg-atlas-surface-alt text-atlas-text-muted'
            }`}
            aria-label="Toggle Metronome"
          >
            <MetronomeIcon size={18} />
          </button>
        ) : undefined
      }
    >
      <MetronomeOverlay metronome={metronome} />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 stagger-children">
        {/* Workout selector cards — tap to start */}
        {!sessionActive && (
          <WorkoutSelector onSelect={startSession} />
        )}

        {/* Session header when active */}
        {sessionActive && (
          <div className="animate-fade-slide-up flex items-center justify-between rounded-2xl bg-atlas-surface border border-atlas-border px-4 py-3 elevation-1">
            <div>
              <div className="text-xs text-atlas-text-muted">Current Workout</div>
              <div className="font-bold text-atlas-text">
                {(store.getRow('workouts', workoutId)?.name as string) || 'Workout'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-atlas-text-muted">Elapsed</div>
              <div className="text-lg font-bold text-atlas-text tabular-nums">
                {elapsedStr}
              </div>
            </div>
          </div>
        )}

        {/* Start and End session buttons */}
        {sessionActive && (
          <div className="flex gap-3">
            <button
              onClick={() => setSessionStart(Date.now())}
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
        )}

        {/* Volume comparison */}
        {sessionActive && <VolumeComparison volume={volume} />}

        {/* Exercise cards */}
        {sessionActive &&
          exerciseIds.map((eid) => {
            const input = getInput(eid);
            return (
              <ExerciseCard
                key={eid}
                exerciseId={eid}
                sessionId={sessionId!}
                loggedSets={loggedSets[eid] || []}
                currentWeight={input.weight}
                currentReps={input.reps}
                onWeightChange={(w) => setWeight(eid, w)}
                onRepsChange={(r) => setReps(eid, r)}
                onLogSet={() => logSet(eid)}
              />
            );
          })}

        {/* Hint text below cards */}
        {!sessionActive && (
          <p className="animate-fade-slide-up text-center text-sm text-atlas-text-muted">
            Tap a workout to start
          </p>
        )}
      </div>

      {/* Rest timer overlay */}
      <RestTimerModal timer={restTimer} onDismiss={restTimer.reset} />
    </PageShell>
  );
}
