import { useMemo } from 'react';
import { ChevronRight, Dumbbell, Calendar } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';

interface Props {
  onSelect: (workoutId: string) => void;
}

const WORKOUT_LETTERS: Record<string, string> = {
  'Workout A': 'A',
  'Workout B': 'B',
};

function formatRelativeDate(ts: number): string {
  const now = new Date();
  const date = new Date(ts);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getSuggestedDate(lastTs: number): string {
  if (!lastTs) return 'Start anytime';
  const suggested = new Date(lastTs);
  suggested.setDate(suggested.getDate() + 2); // Suggest 2 days after last session
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  suggested.setHours(0, 0, 0, 0);

  const diffDays = Math.round((suggested.getTime() - now.getTime()) / 86400000);

  if (diffDays < 0) return 'Due now';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return suggested.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function WorkoutSelector({ onSelect }: Props) {
  const { store } = useStore();
  const workouts = store.getTable('workouts');
  const allExercises = store.getTable('exercises');
  const weTable = store.getTable('workout_exercises');
  const allSessions = store.getTable('sessions');

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

  // Get last completed session time per workout, and sort by oldest first (due next)
  const sortedWorkouts = useMemo(() => {
    const entries = Object.entries(workouts).map(([id, w]) => {
      let lastSessionTime = 0;
      for (const s of Object.values(allSessions)) {
        if (
          s.workout_id === id &&
          s.status === 'completed' &&
          (s.start_time as number) > lastSessionTime
        ) {
          lastSessionTime = s.start_time as number;
        }
      }
      return { id, workout: w, lastSessionTime };
    });

    // Sort: workouts with no sessions first, then oldest session first (due next)
    entries.sort((a, b) => {
      if (a.lastSessionTime === 0 && b.lastSessionTime === 0) return 0;
      if (a.lastSessionTime === 0) return -1;
      if (b.lastSessionTime === 0) return -1;
      return a.lastSessionTime - b.lastSessionTime;
    });

    return entries;
  }, [workouts, allSessions]);

  return (
    <div className="space-y-3 stagger-children">
      {sortedWorkouts.map(({ id, workout: w, lastSessionTime }) => {
        const name = w.name as string;
        const exercises = getExerciseNames(id);
        const letter = WORKOUT_LETTERS[name] || name.charAt(0);
        const suggested = getSuggestedDate(lastSessionTime);
        const isDue = suggested === 'Due now' || suggested === 'Today';

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="animate-fade-slide-up ripple hover-elevate
                       w-full flex flex-col rounded-2xl border-2 border-atlas-border bg-atlas-surface
                       hover:border-atlas-accent hover:bg-atlas-accent/5
                       active:scale-[0.97] transition-all duration-200 text-left cursor-pointer overflow-hidden"
          >
            {/* Suggested date banner */}
            <div
              className={`px-4 py-1.5 flex items-center gap-1.5 text-xs font-medium w-full ${
                isDue
                  ? 'bg-atlas-success/15 text-atlas-success'
                  : 'bg-atlas-surface-alt/50 text-atlas-text-muted'
              }`}
            >
              <Calendar size={10} />
              <span>
                {lastSessionTime
                  ? `Last: ${formatRelativeDate(lastSessionTime)} · Next: ${suggested}`
                  : 'Not started yet'}
              </span>
            </div>

            {/* Card body */}
            <div className="flex items-center gap-4 p-4">
              {/* Letter badge */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 transition-transform duration-200 ${
                  isDue
                    ? 'bg-atlas-success/20 text-atlas-success'
                    : 'bg-atlas-accent/15 text-atlas-accent'
                }`}
              >
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
            </div>
          </button>
        );
      })}
    </div>
  );
}
