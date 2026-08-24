import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-[#dcdfe6] bg-white px-3 py-2 text-sm text-gray-900 shadow-none transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 hover:border-[#c0c4cc] focus-visible:border-[#409eff] focus-visible:ring-2 focus-visible:ring-[#409eff]/20 disabled:cursor-not-allowed disabled:bg-[#f5f7fa] disabled:text-[#c0c4cc] disabled:opacity-100 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
