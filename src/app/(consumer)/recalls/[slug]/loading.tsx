// ============================================================
// KOI Recall Platform — Recall Page Loading State
// Branded three-blade loader + skeleton for stable layout
// ============================================================

export default function RecallLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading recall details"
      className="animate-in fade-in duration-300"
    >
      {/* ── Loader bar ── */}
      <div className="container-content pt-10 pb-8">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="blade-dot blade-dot-safety" />
            <span className="blade-dot blade-dot-verification" />
            <span className="blade-dot blade-dot-resolution" />
          </span>
          <span className="text-sm font-medium text-text-tertiary">
            Loading recall details…
          </span>
        </div>
      </div>

      {/* Safety banner skeleton */}
      <div className="bg-blade-safety-light border-l-4 border-blade-safety p-4">
        <div className="container-content flex items-start gap-3">
          <div className="h-5 w-5 rounded bg-blade-safety-medium animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 rounded bg-blade-safety-medium/50 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-blade-safety-medium/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-blade-safety-light to-surface-primary py-16">
        <div className="container-content">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 w-24 rounded bg-blade-safety-medium/40 animate-pulse" />
              <div className="h-8 w-2/3 rounded bg-surface-secondary animate-pulse" />
              <div className="h-4 w-full rounded bg-surface-secondary animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-surface-secondary animate-pulse" />
            </div>
            <div className="h-64 rounded-xl bg-surface-secondary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeletons */}
      <div className="container-content py-12 space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-1 w-16 rounded-full bg-surface-secondary" />
            <div className="h-6 w-48 rounded bg-surface-secondary animate-pulse" />
            <div className="h-48 rounded-xl bg-surface-secondary animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
