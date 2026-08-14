// ============================================================
// KOI Recall Platform — Root Loading State
// Shown while any route without its own loader is still rendering.
// ============================================================

export default function RootLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="flex min-h-[60vh] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="blade-dot blade-dot-safety" />
          <span className="blade-dot blade-dot-verification" />
          <span className="blade-dot blade-dot-resolution" />
        </span>
        <span className="text-sm font-medium text-text-tertiary">Loading…</span>
      </div>
    </div>
  );
}
