import { useMemo } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ExerciseProgressCard } from '../components/progress/ExerciseProgressCard';
import { PlateauBanner } from '../components/progress/PlateauBanner';
import { ContributionCalendar } from '../components/progress/ContributionCalendar';
import { useStore } from '../store/StoreProvider';
import { usePlateauDetection } from '../hooks/usePlateauDetection';

function PlateauCheck({ exerciseId, exerciseName }: { exerciseId: string; exerciseName: string }) {
  const plateau = usePlateauDetection(exerciseId);
  if (!plateau.isPlateau) return null;
  return (
    <PlateauBanner
      exerciseName={exerciseName}
      deloadWeight={plateau.suggestedDeloadWeight}
      repScheme={plateau.suggestedRepScheme}
    />
  );
}

export function ProgressPage() {
  const { store } = useStore();

  const exercises = useMemo(() => {
    const table = store.getTable('exercises');
    return Object.entries(table).map(([id, ex]) => ({
      id,
      name: ex.name as string,
    }));
  }, [store, store.getTable('exercises')]);

  return (
    <PageShell title="Progress">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 stagger-children">
        {/* Contribution calendar */}
        <ContributionCalendar />

        {/* Plateau banners at top */}
        {exercises.map((ex) => (
          <PlateauCheck key={`plateau-${ex.id}`} exerciseId={ex.id} exerciseName={ex.name} />
        ))}

        {/* Exercise progress cards */}
        {exercises.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-atlas-text mb-2">
              No exercises yet
            </h2>
            <p className="text-atlas-text-muted text-sm">
              Start logging workouts to see your progress.
            </p>
          </div>
        ) : (
          exercises.map((ex) => (
            <ExerciseProgressCard
              key={ex.id}
              exerciseId={ex.id}
              exerciseName={ex.name}
            />
          ))
        )}
      </div>
    </PageShell>
  );
}
