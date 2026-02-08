import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Store } from 'tinybase';
import type { Relationships } from 'tinybase/relationships';
import type { Indexes } from 'tinybase/indexes';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { buildStore, seedIfEmpty } from './store';

// ── Context ────────────────────────────────────────────────
interface StoreCtx {
  store: Store;
  relationships: Relationships;
  indexes: Indexes;
  ready: boolean;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be inside <StoreProvider>');
  return ctx;
}

// ── Provider ───────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<StoreCtx | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { store, relationships, indexes } = buildStore();

      // Persist to LocalStorage
      const persister = createLocalPersister(store, 'agile-atlas-v1');

      // Load any existing data first
      await persister.load();

      // Seed only if store is empty after load
      seedIfEmpty(store);

      // Save after seeding (in case we just seeded)
      await persister.save();

      // Auto-save on every change going forward
      await persister.startAutoSave();

      if (!cancelled) {
        setCtx({ store, relationships, indexes, ready: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ctx) {
    return (
      <div className="flex items-center justify-center h-screen bg-atlas-bg">
        <div className="text-atlas-text-muted text-lg">Loading...</div>
      </div>
    );
  }

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}
