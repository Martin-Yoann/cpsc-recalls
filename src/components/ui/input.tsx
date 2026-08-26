import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[4px] border border-outline bg-surface px-3 py-2 text-base text-foreground shadow-none transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-variant hover:border-secondary focus-visible:border-[2px] focus-visible:border-secondary focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-surface-dim disabled:text-foreground-variant disabled:opacity-100 aria-invalid:border-emergency aria-invalid:ring-0 md:text-base",
        className
      )}
      {...props}
    />
  )
}

export { Input }
