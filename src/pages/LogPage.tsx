import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { MetronomeIcon } from '../components/shared/MetronomeIcon';
import { PageShell } from '../components/layout/PageShell';
import { WorkoutSelector } from '../components/log/WorkoutSelector';
import { ActiveSession } from '../components/log/ActiveSession';
import { MetronomeOverlay } from '../components/log/MetronomeOverlay';
import { useStore } from '../store/StoreProvider';
import { useMetronome } from '../hooks/useMetronome';
import { WORKOUT_IDS } from '../store/store';

export function LogPage() {
  const { store } = useStore();
  const metronome = useMetronome();

  const [workoutId, setWorkoutId] = useState<string>(WORKOUT_IDS.a);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStart, setSessionStart] = useState(0);

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
    },
    [store],
  );

  // End session
  const endSession = useCallback(() => {
    setSessionActive(false);
    setSessionId(null);
    setSessionStart(0);
    metronome.stop();
  }, [metronome]);

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

        {/* Active session */}
        {sessionActive && sessionId && (
          <ActiveSession
            workoutId={workoutId}
            sessionId={sessionId}
            onEnd={endSession}
            sessionStart={sessionStart}
            onSetSessionStart={setSessionStart}
          />
        )}
      </div>
    </PageShell>
  );
}
