import { useMemo } from 'react';
import { useStore } from '../store/StoreProvider';

export interface VolumeInfo {
  currentVolume: number;
  previousVolume: number;
  volumeDelta: number;
  percentChange: number;
}

/**
 * Calculates total volume for the current session and compares
 * it to the most recent previous session of the same workout.
 */
export function useSessionVolume(sessionId: string | null): VolumeInfo {
  const { store } = useStore();

  return useMemo(() => {
    const empty: VolumeInfo = {
      currentVolume: 0,
      previousVolume: 0,
      volumeDelta: 0,
      percentChange: 0,
    };
    if (!sessionId) return empty;

    const allSets = store.getTable('sets');
    const allSessions = store.getTable('sessions');
    const session = allSessions[sessionId];
    if (!session) return empty;

    // Current volume
    let currentVolume = 0;
    for (const set of Object.values(allSets)) {
      if (set.session_id === sessionId) {
        currentVolume += (set.weight as number) * (set.reps as number);
      }
    }

    // Find previous session with same workout_id
    const workoutId = session.workout_id as string;
    const startTime = session.start_time as number;

    let previousVolume = 0;
    let prevSessionId: string | null = null;
    let prevStartTime = 0;

    for (const [sid, s] of Object.entries(allSessions)) {
      if (
        sid !== sessionId &&
        s.workout_id === workoutId &&
        s.status === 'completed' &&
        (s.start_time as number) < startTime &&
        (s.start_time as number) > prevStartTime
      ) {
        prevSessionId = sid;
        prevStartTime = s.start_time as number;
      }
    }

    if (prevSessionId) {
      for (const set of Object.values(allSets)) {
        if (set.session_id === prevSessionId) {
          previousVolume += (set.weight as number) * (set.reps as number);
        }
      }
    }

    const volumeDelta = currentVolume - previousVolume;
    const percentChange =
      previousVolume > 0
        ? Math.round((volumeDelta / previousVolume) * 100)
        : 0;

    return { currentVolume, previousVolume, volumeDelta, percentChange };
  }, [store, sessionId, store.getTable('sets'), store.getTable('sessions')]);
}
