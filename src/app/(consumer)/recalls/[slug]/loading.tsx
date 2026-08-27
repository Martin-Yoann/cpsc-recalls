import { Loader2 } from "lucide-react";

// ============================================================
// KOI Recall Platform — Recall Page Loading State
// Minimal black-tone skeleton with stable layout
// ============================================================

export default function RecallLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading recall details"
      className="animate-in fade-in duration-300"
    >
      {/* ── Loader bar: 黑色旋转圆环 + 文字 ── */}
      <div className="container-content pt-10 pb-8">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-black" strokeWidth={1.5} />
          <span className="text-sm font-medium text-black/70">
            Loading recall details…
          </span>
        </div>
      </div>

      {/* Safety banner skeleton — 灰色调 */}
      <div className="bg-gray-50 border-l-4 border-black/20 p-4">
        <div className="container-content flex items-start gap-3">
          <div className="h-5 w-5 rounded bg-black/10 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 rounded bg-black/10 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-black/5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero skeleton — 浅灰背景，无边框 */}
      <div className="bg-gray-50/50 py-16">
        <div className="container-content">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 w-24 rounded bg-black/10 animate-pulse" />
              <div className="h-8 w-2/3 rounded bg-black/20 animate-pulse" />
              <div className="h-4 w-full rounded bg-black/10 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-black/10 animate-pulse" />
            </div>
            <div className="h-64 rounded-md bg-black/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeletons — 统一灰色 */}
      <div className="container-content py-12 space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-1 w-16 rounded-full bg-black/10" />
            <div className="h-6 w-48 rounded bg-black/20 animate-pulse" />
            <div className="h-48 rounded-md bg-black/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}