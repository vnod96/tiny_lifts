import { createStore, type Store } from 'tinybase';
import { createRelationships, type Relationships } from 'tinybase/relationships';
import { createIndexes, type Indexes } from 'tinybase/indexes';

// ── Seed IDs ──────────────────────────────────────────────
export const EXERCISE_IDS = {
  squat: 'ex-squat',
  bench: 'ex-bench',
  deadlift: 'ex-deadlift',
  ohp: 'ex-ohp',
  row: 'ex-row',
} as const;

export const WORKOUT_IDS = {
  a: 'wk-a',
  b: 'wk-b',
} as const;

// ── Store factory ─────────────────────────────────────────
export function buildStore(): {
  store: Store;
  relationships: Relationships;
  indexes: Indexes;
} {
  const store = createStore();

  // ── Schema ───────────────────────────────────────────
  store.setTablesSchema({
    workouts: {
      name: { type: 'string' },
      type: { type: 'string', default: 'program' },
    },
    exercises: {
      name: { type: 'string' },
      category: { type: 'string', default: 'upper' },
      muscle_group: { type: 'string', default: '' },
      target_reps: { type: 'number', default: 5 },
      target_sets: { type: 'number', default: 5 },
    },
    workout_exercises: {
      workout_id: { type: 'string' },
      exercise_id: { type: 'string' },
      order: { type: 'number', default: 0 },
    },
    sessions: {
      workout_id: { type: 'string' },
      start_time: { type: 'number', default: 0 },
      end_time: { type: 'number', default: 0 },
      total_volume: { type: 'number', default: 0 },
      status: { type: 'string', default: 'active' },
    },
    sets: {
      session_id: { type: 'string' },
      exercise_id: { type: 'string' },
      weight: { type: 'number', default: 0 },
      reps: { type: 'number', default: 0 },
      timestamp: { type: 'number', default: 0 },
      set_number: { type: 'number', default: 1 },
    },
  });

  // ── Relationships ────────────────────────────────────
  const relationships = createRelationships(store);

  relationships.setRelationshipDefinition(
    'sessionWorkout',   // relationship id
    'sessions',         // local table
    'workouts',         // remote table
    'workout_id',       // local cell linking to remote row id
  );

  relationships.setRelationshipDefinition(
    'setSession',
    'sets',
    'sessions',
    'session_id',
  );

  relationships.setRelationshipDefinition(
    'setExercise',
    'sets',
    'exercises',
    'exercise_id',
  );

  relationships.setRelationshipDefinition(
    'weWorkout',
    'workout_exercises',
    'workouts',
    'workout_id',
  );

  relationships.setRelationshipDefinition(
    'weExercise',
    'workout_exercises',
    'exercises',
    'exercise_id',
  );

  // ── Indexes ──────────────────────────────────────────
  const indexes = createIndexes(store);

  indexes.setIndexDefinition(
    'setsBySession',    // index id
    'sets',             // table
    'session_id',       // cell to index on
  );

  indexes.setIndexDefinition(
    'setsByExercise',
    'sets',
    'exercise_id',
  );

  indexes.setIndexDefinition(
    'sessionsByWorkout',
    'sessions',
    'workout_id',
  );

  indexes.setIndexDefinition(
    'exercisesByWorkout',
    'workout_exercises',
    'workout_id',
  );

  return { store, relationships, indexes };
}

// ── Seed data ─────────────────────────────────────────────
export function seedIfEmpty(store: Store) {
  // Only seed if no exercises exist yet
  if (Object.keys(store.getTable('exercises')).length > 0) return;

  // Exercises
  store.setRow('exercises', EXERCISE_IDS.squat, {
    name: 'Squat',
    category: 'lower',
    muscle_group: 'Quadriceps, Glutes',
    target_reps: 5,
    target_sets: 5,
  });
  store.setRow('exercises', EXERCISE_IDS.bench, {
    name: 'Bench Press',
    category: 'upper',
    muscle_group: 'Chest, Triceps',
    target_reps: 5,
    target_sets: 5,
  });
  store.setRow('exercises', EXERCISE_IDS.deadlift, {
    name: 'Deadlift',
    category: 'deadlift',
    muscle_group: 'Back, Hamstrings',
    target_reps: 5,
    target_sets: 1,
  });
  store.setRow('exercises', EXERCISE_IDS.ohp, {
    name: 'Overhead Press',
    category: 'upper',
    muscle_group: 'Shoulders, Triceps',
    target_reps: 5,
    target_sets: 5,
  });
  store.setRow('exercises', EXERCISE_IDS.row, {
    name: 'Barbell Row',
    category: 'upper',
    muscle_group: 'Back, Biceps',
    target_reps: 5,
    target_sets: 5,
  });

  // Workouts
  store.setRow('workouts', WORKOUT_IDS.a, {
    name: 'Workout A',
    type: 'program',
  });
  store.setRow('workouts', WORKOUT_IDS.b, {
    name: 'Workout B',
    type: 'program',
  });

  // Workout A: Squat, Bench, Row
  store.setRow('workout_exercises', 'we-a1', {
    workout_id: WORKOUT_IDS.a,
    exercise_id: EXERCISE_IDS.squat,
    order: 1,
  });
  store.setRow('workout_exercises', 'we-a2', {
    workout_id: WORKOUT_IDS.a,
    exercise_id: EXERCISE_IDS.bench,
    order: 2,
  });
  store.setRow('workout_exercises', 'we-a3', {
    workout_id: WORKOUT_IDS.a,
    exercise_id: EXERCISE_IDS.row,
    order: 3,
  });

  // Workout B: Squat, OHP, Deadlift
  store.setRow('workout_exercises', 'we-b1', {
    workout_id: WORKOUT_IDS.b,
    exercise_id: EXERCISE_IDS.squat,
    order: 1,
  });
  store.setRow('workout_exercises', 'we-b2', {
    workout_id: WORKOUT_IDS.b,
    exercise_id: EXERCISE_IDS.ohp,
    order: 2,
  });
  store.setRow('workout_exercises', 'we-b3', {
    workout_id: WORKOUT_IDS.b,
    exercise_id: EXERCISE_IDS.deadlift,
    order: 3,
  });
}
