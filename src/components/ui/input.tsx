
import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  type?: string;
  numberOnly?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, numberOnly, ...props }, ref) => {
    // Handle keydown for number-only inputs
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (numberOnly) {
        // Allow only numbers, arrows, backspace, delete, tab
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        const isNumber = /^[0-9]$/i.test(e.key);
        
        if (!isNumber && !allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      }
      
      // Call the original onKeyDown handler if provided
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
