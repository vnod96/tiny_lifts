import { useMemo } from 'react';
import { Dumbbell } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { useStore } from '../store/StoreProvider';
import { NumberStepper } from '../components/shared/NumberStepper';

interface ExerciseConfig {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  target_reps: number;
  target_sets: number;
  default_weight: number;
}

function ExerciseSettingCard({ exercise }: { exercise: ExerciseConfig }) {
  const { store } = useStore();

  const update = (field: string, value: number) => {
    store.setCell('exercises', exercise.id, field, value);
  };

  return (
    <div className="animate-fade-slide-up rounded-2xl bg-atlas-surface border border-atlas-border overflow-hidden elevation-1">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-atlas-border">
        <div className="w-10 h-10 rounded-xl bg-atlas-accent/15 text-atlas-accent flex items-center justify-center shrink-0">
          <Dumbbell size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-atlas-text text-base">{exercise.name}</h3>
          <span className="text-xs text-atlas-text-muted">{exercise.muscle_group}</span>
        </div>
      </div>

      {/* Config fields */}
      <div className="px-4 py-4 grid grid-cols-3 gap-4">
        <NumberStepper
          value={exercise.default_weight}
          onChange={(v) => update('default_weight', v)}
          step={2.5}
          min={0}
          label="Weight"
          unit="kg"
        />
        <NumberStepper
          value={exercise.target_reps}
          onChange={(v) => update('target_reps', v)}
          step={1}
          min={1}
          max={30}
          label="Reps"
        />
        <NumberStepper
          value={exercise.target_sets}
          onChange={(v) => update('target_sets', v)}
          step={1}
          min={1}
          max={10}
          label="Sets"
        />
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { store } = useStore();

  const exercises = useMemo(() => {
    const table = store.getTable('exercises');
    return Object.entries(table).map(([id, ex]) => ({
      id,
      name: (ex.name as string) || '',
      category: (ex.category as string) || '',
      muscle_group: (ex.muscle_group as string) || '',
      target_reps: (ex.target_reps as number) || 5,
      target_sets: (ex.target_sets as number) || 5,
      default_weight: (ex.default_weight as number) || 20,
    }));
  }, [store, store.getTable('exercises')]);

  return (
    <PageShell title="Settings">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 stagger-children">
        <div className="animate-fade-slide-up">
          <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wide mb-1">
            Exercise Defaults
          </h2>
          <p className="text-xs text-atlas-text-muted mb-3">
            Configure starting weight, target reps, and sets for each exercise.
          </p>
        </div>

        {exercises.map((ex) => (
          <ExerciseSettingCard key={ex.id} exercise={ex} />
        ))}

        <p className="animate-fade-slide-up text-center text-xs text-atlas-text-muted pt-2">
          Changes are saved automatically.
        </p>
      </div>
    </PageShell>
  );
}
