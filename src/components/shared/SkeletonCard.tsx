export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-atlas-surface p-4 space-y-3 animate-pulse">
      <div className="skeleton h-5 w-1/3 rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  );
}
