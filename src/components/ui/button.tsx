import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 cursor-pointer items-center justify-center",
    "rounded border text-sm font-medium whitespace-nowrap",
    "bg-clip-padding px-3 py-1.5",
    "transition-colors duration-200",
    "outline-none select-none",
    // 焦点：仅边框变化，无光晕
    "focus-visible:border-2 focus-visible:border-secondary focus-visible:ring-0",
    // 禁用
    "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
    // 图标
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // 按下反馈：仅颜色变深，无位移
    "active:not-aria-[haspopup]:brightness-90",
  ].join(" "),
  {
    variants: {
      variant: {
        // 主按钮 — 深石板背景，白色文字
        default: [
          "bg-[#263238] text-white",
          "border-[#263238]",
          "hover:bg-[#1A2429] hover:border-[#1A2429]",
          "active:bg-[#111D23] active:border-[#111D23]",
        ].join(" "),

        // 副按钮 — 冷灰背景，深色文字
        secondary: [
          "bg-[#546E7A] text-white",
          "border-[#546E7A]",
          "hover:bg-[#455A64] hover:border-[#455A64]",
          "active:bg-[#37474F] active:border-[#37474F]",
        ].join(" "),

        // 描边按钮 — 透明背景，深色描边
        outline: [
          "bg-transparent text-[#263238]",
          "border-[#B0BEC5]",
          "hover:bg-[#ECEFF1] hover:border-[#546E7A]",
          "active:bg-[#CFD8DC] active:border-[#263238]",
        ].join(" "),

        // 幽灵按钮 — 极简，仅 hover 背景
        ghost: [
          "bg-transparent text-[#263238]",
          "border-transparent",
          "hover:bg-[#ECEFF1]",
          "active:bg-[#CFD8DC]",
        ].join(" "),

        // 危险/删除按钮 — 紧急红
        destructive: [
          "bg-[#C62828] text-white",
          "border-[#C62828]",
          "hover:bg-[#B71C1C] hover:border-[#B71C1C]",
          "active:bg-[#8E0000] active:border-[#8E0000]",
        ].join(" "),

        // 链接按钮 — 无边框，仅文字
        link: [
          "bg-transparent text-[#263238]",
          "border-transparent",
          "hover:text-[#546E7A] hover:underline",
          "active:text-[#111D23]",
        ].join(" "),
      },

      size: {
        default: "h-9 gap-1.5 px-3 text-sm",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-4 text-base",
        icon: "size-9 p-0",
        "icon-xs": "size-6 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 p-0",
        "icon-lg": "size-10 p-0",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }