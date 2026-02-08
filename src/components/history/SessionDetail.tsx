import { useStore } from '../../store/StoreProvider';
import { useMemo } from 'react';

interface Props {
  sessionId: string;
}

interface ExerciseSets {
  exerciseId: string;
  exerciseName: string;
  sets: Array<{ weight: number; reps: number; setNumber: number }>;
}

export function SessionDetail({ sessionId }: Props) {
  const { store } = useStore();

  const exercises = useMemo(() => {
    const allSets = store.getTable('sets');
    const allExercises = store.getTable('exercises');

    const grouped: Record<string, ExerciseSets> = {};

    for (const [, set] of Object.entries(allSets)) {
      if (set.session_id !== sessionId) continue;
      const eid = set.exercise_id as string;

      if (!grouped[eid]) {
        const ex = allExercises[eid];
        grouped[eid] = {
          exerciseId: eid,
          exerciseName: (ex?.name as string) || 'Unknown',
          sets: [],
        };
      }

      grouped[eid].sets.push({
        weight: set.weight as number,
        reps: set.reps as number,
        setNumber: set.set_number as number,
      });
    }

    // Sort sets within each exercise
    for (const g of Object.values(grouped)) {
      g.sets.sort((a, b) => a.setNumber - b.setNumber);
    }

    return Object.values(grouped);
  }, [sessionId, store]);

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-atlas-text-muted py-2">No sets recorded.</p>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map((ex) => (
        <div key={ex.exerciseId}>
          <h4 className="text-sm font-semibold text-atlas-text mb-1">
            {ex.exerciseName}
          </h4>
          <div className="space-y-0.5">
            {ex.sets.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-atlas-text-muted"
              >
                <span className="w-10 text-xs">Set {s.setNumber}</span>
                <span className="font-medium text-atlas-text">
                  {s.weight} kg × {s.reps}
                </span>
                <span className="text-xs ml-auto">
                  {(s.weight * s.reps).toLocaleString()} vol
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
