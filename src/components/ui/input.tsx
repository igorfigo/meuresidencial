
import * as React from "react"
import { cn } from "@/lib/utils"
import { formatCurrencyInput } from "@/utils/currency";

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  type?: string;
  numberOnly?: boolean;
  isCurrency?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, numberOnly, isCurrency, onChange, ...props }, ref) => {
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

    // Handle change for currency inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const value = e.target.value.replace(/\D/g, '');
        const formattedValue = formatCurrencyInput(value);
        e.target.value = `R$ ${formattedValue}`;
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm box-border",
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
