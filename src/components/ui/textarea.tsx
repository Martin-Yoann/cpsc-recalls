import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-md border border-[#dcdfe6] bg-white px-3 py-2 text-sm text-gray-900 transition-colors outline-none placeholder:text-gray-400 hover:border-[#c0c4cc] focus-visible:border-[#409eff] focus-visible:ring-2 focus-visible:ring-[#409eff]/20 disabled:cursor-not-allowed disabled:bg-[#f5f7fa] disabled:text-[#c0c4cc] disabled:opacity-100 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
