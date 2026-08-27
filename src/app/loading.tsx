import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-10"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-5">
        {/* 黑色圆环旋转 */}
        <Loader2 className="h-12 w-12 animate-spin text-black" strokeWidth={1.5} />
        
        {/* 白色文字渐入，模拟“延伸”效果 */}
        <div className="overflow-hidden">
          <p className="animate-[fadeInUp_0.8s_ease-out] text-sm font-medium text-black/80">
            Loading…
          </p>
        </div>
      </div>

      {/* 自定义动画：从下向上淡入，模拟延伸 */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}