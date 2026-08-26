import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[4px] border border-outline bg-surface px-3 py-2 text-base text-foreground transition-colors outline-none placeholder:text-foreground-variant hover:border-secondary focus-visible:border-[2px] focus-visible:border-secondary focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-surface-dim disabled:text-foreground-variant disabled:opacity-100 aria-invalid:border-emergency aria-invalid:ring-0",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
