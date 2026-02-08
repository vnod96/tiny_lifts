import { useMemo, useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { SessionCard } from '../components/history/SessionCard';
import { SessionDetail } from '../components/history/SessionDetail';
import { useStore } from '../store/StoreProvider';

export function HistoryPage() {
  const { store } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sessions = useMemo(() => {
    const allSessions = store.getTable('sessions');
    const allWorkouts = store.getTable('workouts');
    const allSets = store.getTable('sets');

    return Object.entries(allSessions)
      .filter(([, s]) => s.status === 'completed')
      .map(([id, s]) => {
        const wk = allWorkouts[s.workout_id as string];
        const startTime = s.start_time as number;
        const endTime = s.end_time as number;
        const durationMin = endTime
          ? Math.round((endTime - startTime) / 60000)
          : 0;

        // Count unique exercises
        const exerciseSet = new Set<string>();
        for (const set of Object.values(allSets)) {
          if (set.session_id === id) exerciseSet.add(set.exercise_id as string);
        }

        return {
          id,
          workoutName: (wk?.name as string) || 'Workout',
          date: startTime,
          totalVolume: (s.total_volume as number) || 0,
          durationMin,
          exerciseCount: exerciseSet.size,
        };
      })
      .sort((a, b) => b.date - a.date);
  }, [store, store.getTable('sessions'), store.getTable('sets')]);

  return (
    <PageShell title="History">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3 stagger-children">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-atlas-text mb-2">
              No workouts yet
            </h2>
            <p className="text-atlas-text-muted text-sm max-w-xs mx-auto">
              Complete your first workout and it will appear here.
            </p>
          </div>
        ) : (
          sessions.map((s) => (
            <SessionCard
              key={s.id}
              workoutName={s.workoutName}
              date={s.date}
              totalVolume={s.totalVolume}
              durationMin={s.durationMin}
              exerciseCount={s.exerciseCount}
              isExpanded={expandedId === s.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === s.id ? null : s.id))
              }
            >
              <SessionDetail sessionId={s.id} />
            </SessionCard>
          ))
        )}
      </div>
    </PageShell>
  );
}
