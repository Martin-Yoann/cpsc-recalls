// ============================================================
// KOI Recall Platform — 404 Not Found (Candy Theme Enhanced)
// ============================================================

import Link from 'next/link';
import { ArrowLeft, Candy, Search, Sparkles, FileText, HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="candy-page-shell flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-8 shadow-[0_32px_80px_rgba(137,67,97,0.15)] backdrop-blur-xl sm:p-12">
        <div className="candy-card-ribbon" aria-hidden="true" />
        
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* 左侧文字与主要操作 */}
          <div className="text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f8d5a3] bg-[#fff7df] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#b07b17] shadow-sm">
              <Sparkles className="h-4 w-4 animate-spin-slow text-[#e97899]" /> Lost in the candy aisle?
            </div>
            
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF8CA3]">Error 404</p>
            
            <h1 className="mt-2 max-w-lg text-4xl font-black leading-tight tracking-[-0.04em] text-[#5d3047] sm:text-5xl">
              This page slipped out of the wrapper.
            </h1>
            
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#806874] sm:text-base">
              The sweet treat you are looking for may have moved, expired, or never existed. Head back home or check your claim status right away.
            </p>

            {/* 主按钮组：增加水平内边距，提升呼吸感 */}
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/">
                <Button 
                  size="lg" 
                  className="h-12 w-39 rounded-full border-none bg-gradient-to-r from-[#FF8CA3] to-[#C99FFF] 
                             px-10 font-semibold text-white whitespace-nowrap
                             shadow-[0_8px_20px_rgba(201,159,255,0.4)] cursor-pointer transition-all duration-300 
                             hover:scale-[1.03] hover:shadow-[0_12px_25px_rgba(201,159,255,0.5)] active:scale-95"
                  style={{
                    background: 'linear-gradient(to right, #FF8CA3, #C99FFF)',
                    boxShadow: '0 8px 20px rgba(201, 159, 255, 0.4)'
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              
              <Link href="/lookup">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 w-42 rounded-full border border-[#FF8DA1] bg-[#FFF0F4]/60 
                             px-10 font-semibold text-[#FF6B8A] whitespace-nowrap
                             cursor-pointer transition-all duration-300 
                             hover:bg-[#FFF0F4] hover:text-[#FF4D73] hover:-translate-y-0.5 active:scale-95"
                  style={{
                    backgroundColor: 'rgba(255, 240, 244, 0.6)',
                    borderColor: '#FF8DA1'
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Check Claim Status
                </Button>
              </Link>
            </div>
          </div>

          {/* 右侧视觉与图形 */}
          <div className="relative flex min-h-[260px] items-center justify-center">
            <div className="candy-404-swirl absolute inset-0 opacity-80" aria-hidden="true" />
            
            {/* 带有浮动动画的主图 */}
            <div className="relative flex h-48 w-48 animate-bounce-slow items-center justify-center rounded-full border border-white/90 bg-[radial-gradient(circle_at_30%_30%,#fffef7_0%,#ffe0ea_50%,#ffc7d7_100%)] shadow-[0_24px_50px_rgba(240,91,120,0.25)]">
              <Candy className="h-20 w-20 text-[#a54d70] drop-shadow-md" />
              <span className="absolute -bottom-3 rounded-full border border-white/80 bg-white/95 px-5 py-1.5 text-base font-black tracking-[0.18em] text-[#e97899] shadow-[0_10px_20px_rgba(137,67,97,0.18)]">
                404
              </span>
            </div>
          </div>
        </div>

        {/* 底部快捷导览板块：卡片内边距微调，避免文字拥挤 */}
        <div className="mt-12 border-t border-[#f4dbe4]/60 pt-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#a58694]">
            Looking for something else?
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link 
              href="/claim" 
              className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/50 
                         p-4 text-xs font-bold text-[#6d4b5a] whitespace-nowrap
                         transition-all duration-200 hover:bg-white hover:text-[#FF6B8A] hover:shadow-md cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE5EC] text-[#FF6B8A]">
                <FileText className="h-4 w-4" />
              </div>
              <span>Submit a Claim</span>
            </Link>

            <Link 
              href="/faq" 
              className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/50 
                         p-4 text-xs font-bold text-[#6d4b5a] whitespace-nowrap
                         transition-all duration-200 hover:bg-white hover:text-[#FF6B8A] hover:shadow-md cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3D6] text-[#D9822B]">
                <HelpCircle className="h-4 w-4" />
              </div>
              <span>Frequently Asked Questions</span>
            </Link>

            <Link 
              href="/support" 
              className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/50 
                         p-4 text-xs font-bold text-[#6d4b5a] whitespace-nowrap
                         transition-all duration-200 hover:bg-white hover:text-[#FF6B8A] hover:shadow-md cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF3FF] text-[#3B82F6]">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}