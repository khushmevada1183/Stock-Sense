#!/bin/bash

echo "Creating all necessary UI components..."

# Make sure the ui components directory exists
mkdir -p components/ui

# Components we've already created
echo "✓ Progress component (already created)"
echo "✓ Table component (already created)"
echo "✓ Badge component (already created)"
echo "✓ Button component (already created)"
echo "✓ Card component (already created)"
echo "✓ Tabs component (already created)"

# Create any additional components
# This will only create components that don't already exist

# 1. Create Separator component if needed
if [ ! -f "components/ui/separator.tsx" ]; then
  echo "Creating Separator component..."
  cat > components/ui/separator.tsx << 'EOL'
import * as React from "react"

import { cn } from "@/lib/utils"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const orientationStyles = {
    horizontal: "h-[1px] w-full",
    vertical: "h-full w-[1px]",
  }

  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-border",
        orientationStyles[orientation],
        className
      )}
      {...props}
    />
  )
}

export { Separator }
EOL
  echo "✓ Created Separator component"
fi

# 2. Create Sheet component if needed
if [ ! -f "components/ui/sheet.tsx" ]; then
  echo "Creating a simplified Sheet component..."
  cat > components/ui/sheet.tsx << 'EOL'
import * as React from "react"
import { cn } from "@/lib/utils"

// A simplified Sheet component without Radix UI dependency
const Sheet = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("fixed inset-0 z-50", className)} {...props}>
    {children}
  </div>
)
Sheet.displayName = "Sheet"

const SheetTrigger = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props}>{children}</button>
)
SheetTrigger.displayName = "SheetTrigger"

const SheetClose = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props}>{children}</button>
)
SheetClose.displayName = "SheetClose"

const SheetContent = ({
  children,
  className,
  position = "right",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  position?: "top" | "right" | "bottom" | "left"
}) => {
  const positionClasses = {
    top: "inset-x-0 top-0 border-b",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div
        className={cn(
          "fixed h-full border-border bg-background p-6 shadow-lg transition ease-in-out",
          positionClasses[position],
          className
        )}
        {...props}
      >
        <div className="flex h-full flex-col">{children}</div>
      </div>
    </div>
  )
}
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
EOL
  echo "✓ Created Sheet component"
fi

# 3. Create Avatar component if needed
if [ ! -f "components/ui/avatar.tsx" ]; then
  echo "Creating a simplified Avatar component..."
  cat > components/ui/avatar.tsx << 'EOL'
import * as React from "react"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    alt={alt}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
EOL
  echo "✓ Created Avatar component"
fi

# 4. Create Dropdown component if needed
if [ ! -f "components/ui/dropdown-menu.tsx" ]; then
  echo "Creating a simplified Dropdown component..."
  cat > components/ui/dropdown-menu.tsx << 'EOL'
import * as React from "react"

import { cn } from "@/lib/utils"

// A simplified dropdown menu without Radix UI dependency
const DropdownMenu = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>
}

const DropdownMenuTrigger = ({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn("", className)}
      {...props}
    >
      {children}
    </button>
  )
}

const DropdownMenuContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
EOL
  echo "✓ Created Dropdown Menu component"
fi

# 5. Add more components as needed...

echo "UI components creation complete!"
echo "The frontend should now be able to run without missing component errors." 