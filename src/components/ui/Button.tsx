import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl text-sm font-extrabold uppercase tracking-widest transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          "border-2 border-black px-6 py-3 shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#000000]",
          variant === 'primary' ? "bg-black text-white" : "bg-white text-black",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
