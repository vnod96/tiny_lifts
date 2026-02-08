import { useMemo } from 'react';
import { useExerciseHistory } from './useExerciseHistory';
import { useStore } from '../store/StoreProvider';

export interface PlateauResult {
  isPlateau: boolean;
  /** Number of stagnant sessions in a row */
  stagnantCount: number;
  /** Suggested deload weight (10% reduction) */
  suggestedDeloadWeight: number | null;
  /** Suggested rep scheme change */
  suggestedRepScheme: string | null;
  /** Standard progression suggestion */
  progressionSuggestion: string | null;
  /** Suggested next weight */
  suggestedNextWeight: number | null;
}

export function usePlateauDetection(exerciseId: string): PlateauResult {
  const history = useExerciseHistory(exerciseId, 3);
  const { store } = useStore();

  return useMemo(() => {
    const exercise = store.getRow('exercises', exerciseId);
    const category = (exercise?.category as string) || 'upper';
    const targetReps = (exercise?.target_reps as number) || 5;
    const targetSets = (exercise?.target_sets as number) || 5;

    const empty: PlateauResult = {
      isPlateau: false,
      stagnantCount: 0,
      suggestedDeloadWeight: null,
      suggestedRepScheme: null,
      progressionSuggestion: null,
      suggestedNextWeight: null,
    };

    if (history.length < 2) return empty;

    const latest = history[0];

    // Check for plateau: 3 sessions with no increase in weight OR reps
    let stagnantCount = 0;
    if (history.length >= 3) {
      const weights = history.map((h) => h.maxWeight);
      const reps = history.map((h) => h.totalReps);

      // Check if weight is flat or decreasing across all 3
      const weightStagnant =
        weights[0] <= weights[1] && weights[1] <= weights[2];
      // Check if reps are flat or decreasing across all 3
      const repsStagnant = reps[0] <= reps[1] && reps[1] <= reps[2];

      if (weightStagnant && repsStagnant) {
        stagnantCount = 3;
      } else if (history.length >= 2) {
        if (weights[0] <= weights[1] && reps[0] <= reps[1]) {
          stagnantCount = 2;
        }
      }
    }

    const isPlateau = stagnantCount >= 3;

    // Deload: 10% reduction
    const suggestedDeloadWeight = isPlateau
      ? Math.round(latest.maxWeight * 0.9 * 2) / 2 // Round to nearest 2.5
      : null;

    // Rep scheme change: if plateaued, suggest stepping down
    let suggestedRepScheme: string | null = null;
    if (isPlateau) {
      if (targetSets === 5 && targetReps === 5) {
        suggestedRepScheme = '3x5';
      } else if (targetSets === 3 && targetReps === 5) {
        suggestedRepScheme = '3x3';
      } else {
        suggestedRepScheme = `Deload to ${suggestedDeloadWeight} kg`;
      }
    }

    // Standard progression: if latest session hit all target reps
    let progressionSuggestion: string | null = null;
    let suggestedNextWeight: number | null = null;

    if (!isPlateau && latest) {
      const hitAllReps = latest.totalReps >= targetReps * targetSets;

      if (hitAllReps) {
        let increment: number;
        if (category === 'deadlift') {
          increment = 10;
        } else if (category === 'lower') {
          increment = 5;
        } else {
          increment = 2.5;
        }
        suggestedNextWeight = latest.maxWeight + increment;
        progressionSuggestion = `+${increment} kg next session → ${suggestedNextWeight} kg`;
      } else {
        progressionSuggestion = `Keep at ${latest.maxWeight} kg until all ${targetSets}x${targetReps} completed`;
      }
    }

    return {
      isPlateau,
      stagnantCount,
      suggestedDeloadWeight,
      suggestedRepScheme,
      progressionSuggestion,
      suggestedNextWeight,
    };
  }, [history, exerciseId, store]);
}
