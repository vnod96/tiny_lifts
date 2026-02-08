import { useMemo } from 'react';
import { useStore } from '../store/StoreProvider';

export interface SessionSummary {
  sessionId: string;
  maxWeight: number;
  totalReps: number;
  totalVolume: number;
  date: number; // start_time epoch ms
  sets: Array<{ weight: number; reps: number; setNumber: number }>;
}

/**
 * Returns the last `count` session summaries for a given exercise,
 * sorted newest-first.
 */
export function useExerciseHistory(
  exerciseId: string,
  count = 3,
): SessionSummary[] {
  const { store } = useStore();

  return useMemo(() => {
    const allSets = store.getTable('sets');
    const allSessions = store.getTable('sessions');

    // Group sets by session for this exercise
    const sessionMap: Record<
      string,
      Array<{ weight: number; reps: number; setNumber: number }>
    > = {};

    for (const [setId, set] of Object.entries(allSets)) {
      if (set.exercise_id !== exerciseId) continue;
      const sid = set.session_id as string;
      if (!sessionMap[sid]) sessionMap[sid] = [];
      sessionMap[sid].push({
        weight: set.weight as number,
        reps: set.reps as number,
        setNumber: set.set_number as number,
      });
    }

    // Build summaries, attach session start_time for sorting
    const summaries: SessionSummary[] = [];

    for (const [sessionId, sets] of Object.entries(sessionMap)) {
      const session = allSessions[sessionId];
      if (!session) continue;
      // Only include completed sessions
      if (session.status !== 'completed') continue;

      const maxWeight = Math.max(...sets.map((s) => s.weight));
      const totalReps = sets.reduce((a, s) => a + s.reps, 0);
      const totalVolume = sets.reduce((a, s) => a + s.weight * s.reps, 0);

      summaries.push({
        sessionId,
        maxWeight,
        totalReps,
        totalVolume,
        date: session.start_time as number,
        sets: sets.sort((a, b) => a.setNumber - b.setNumber),
      });
    }

    // Sort newest-first, take `count`
    summaries.sort((a, b) => b.date - a.date);
    return summaries.slice(0, count);
  }, [store, exerciseId, count, store.getTable('sets'), store.getTable('sessions')]);
}
