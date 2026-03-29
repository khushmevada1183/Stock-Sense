import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-slate-900 transition-all dark:bg-white"
          style={{ 
            transform: `translateX(-${100 - (value || 0)}%)`,
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress } 