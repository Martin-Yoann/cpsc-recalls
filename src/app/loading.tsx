// ============================================================
// KOI Recall Platform — Root Loading State (Enhanced with Spinning Module)
// ============================================================

import { Candy, Sparkles, Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="candy-page-shell flex min-h-[70vh] items-center justify-center px-4 py-10"
    >
      <div className="candy-loading-panel relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 px-8 py-10 text-center shadow-[0_28px_70px_rgba(137,67,97,0.14)] backdrop-blur-xl">
        <div className="candy-card-ribbon" aria-hidden="true" />
        
        {/* 核心旋转模组：糖果在旋转光环内 */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          {/* 旋转光环 */}
          <div className="absolute inset-0 animate-spin-slow rounded-full border-[3px] border-transparent border-t-[#FF8CA3] border-r-[#C99FFF] border-b-[#FFD166]"></div>
          <div className="absolute inset-0 animate-spin-slower rounded-full border-[3px] border-transparent border-l-[#FFB3C6] border-b-[#A78BFA] opacity-50"></div>
          
          {/* 静态糖果图标 */}
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb6cf] to-[#f9a8c7] text-[#8e3c5c] shadow-[0_8px_20px_rgba(240,91,120,0.25)]">
            <Candy className="h-8 w-8" />
          </div>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f8d5a3] bg-[#fff7df] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#b07b17]">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Sweet progress
        </div>
        
        <h2 className="text-3xl font-black tracking-[-0.05em] text-[#5d3047]">We&apos;re unwrapping the next screen</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#806874]">
          KOI is getting your recall details, claims, and actions ready.
        </p>
        
        {/* 动画圆点（改为跳动） */}
        <div className="mt-6 flex justify-center gap-3" aria-hidden="true">
          <span className="h-3 w-3 animate-bounce rounded-full bg-[#FF8CA3] [animation-delay:-0.3s]"></span>
          <span className="h-3 w-3 animate-bounce rounded-full bg-[#FFD166] [animation-delay:-0.15s]"></span>
          <span className="h-3 w-3 animate-bounce rounded-full bg-[#A78BFA] [animation-delay:0s]"></span>
        </div>
        
        {/* 渐变流动进度条 */}
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#ffe7ef]">
          <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-[#FF8CA3] via-[#C99FFF] to-[#FFD166] bg-[length:200%_100%] animate-shimmer" />
        </div>
        
        <span className="mt-4 block text-xs font-medium uppercase tracking-[0.14em] text-[#987d89]">
          Loading...
        </span>
      </div>
    </div>
  );
}