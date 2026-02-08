import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function PageShell({ title, children, headerRight }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-atlas-surface border-b border-atlas-border shrink-0">
        <h1 className="text-lg font-bold text-atlas-text tracking-tight">
          {title}
        </h1>
        {headerRight && (
          <div className="transition-all duration-200">{headerRight}</div>
        )}
      </header>

      {/* Scrollable body — 64px bottom tab bar + safe area */}
      <main className="flex-1 overflow-y-auto pb-20 animate-page-enter">
        {children}
      </main>
    </div>
  );
}
