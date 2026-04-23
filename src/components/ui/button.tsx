import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--app-accent)] text-white shadow-[0_16px_30px_rgba(16,185,129,0.16)] hover:-translate-y-0.5 hover:bg-[color:var(--app-accent-strong)] hover:shadow-[0_18px_36px_rgba(16,185,129,0.22)]",
        destructive: "bg-red-600 text-white shadow-[0_16px_30px_rgba(220,38,38,0.16)] hover:-translate-y-0.5 hover:bg-red-700",
        outline: "border border-[color:var(--app-border)] bg-[color:var(--app-surface)] text-[color:var(--app-text-1)] hover:-translate-y-0.5 hover:bg-[color:var(--app-surface-2)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
        secondary: "bg-[color:var(--app-surface-2)] text-[color:var(--app-text-1)] hover:-translate-y-0.5 hover:bg-[color:var(--app-surface-2)] dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
        ghost: "text-[color:var(--app-text-1)] hover:bg-black/5 dark:text-white dark:hover:bg-white/10",
        link: "text-[color:var(--app-accent-strong)] underline-offset-4 hover:underline dark:text-[color:var(--app-accent)]",
        success: "bg-[color:var(--app-accent)] text-white shadow-[0_16px_30px_rgba(16,185,129,0.16)] hover:-translate-y-0.5 hover:bg-[color:var(--app-accent-strong)]",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 rounded-full px-3.5 text-xs",
        lg: "h-12 rounded-full px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }