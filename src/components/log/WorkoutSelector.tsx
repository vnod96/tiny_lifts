import { ChevronRight, Dumbbell } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';

interface Props {
  onSelect: (workoutId: string) => void;
}

const WORKOUT_LETTERS: Record<string, string> = {
  'Workout A': 'A',
  'Workout B': 'B',
};

export function WorkoutSelector({ onSelect }: Props) {
  const { store } = useStore();
  const workouts = store.getTable('workouts');
  const allExercises = store.getTable('exercises');
  const weTable = store.getTable('workout_exercises');

  const getExerciseNames = (workoutId: string): string[] => {
    return Object.values(weTable)
      .filter((we) => we.workout_id === workoutId)
      .sort((a, b) => (a.order as number) - (b.order as number))
      .map((we) => {
        const ex = allExercises[we.exercise_id as string];
        return (ex?.name as string) || '';
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-3 stagger-children">
      {Object.entries(workouts).map(([id, w]) => {
        const name = w.name as string;
        const exercises = getExerciseNames(id);
        const letter = WORKOUT_LETTERS[name] || name.charAt(0);

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="animate-fade-slide-up ripple hover-elevate
                       w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-atlas-border bg-atlas-surface
                       hover:border-atlas-accent hover:bg-atlas-accent/5
                       active:scale-[0.97] transition-all duration-200 text-left cursor-pointer"
          >
            {/* Letter badge */}
            <div className="w-12 h-12 rounded-xl bg-atlas-accent/15 text-atlas-accent flex items-center justify-center text-xl font-bold shrink-0
                            transition-transform duration-200">
              {letter}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="font-bold text-base text-atlas-text">{name}</span>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {exercises.map((ex) => (
                  <span
                    key={ex}
                    className="text-xs text-atlas-text-muted flex items-center gap-1"
                  >
                    <Dumbbell size={10} className="shrink-0" />
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight size={20} className="text-atlas-text-muted shrink-0 transition-transform duration-200" />
          </button>
        );
      })}
    </div>
  );
}
