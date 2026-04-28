import * as React from "react";
import { cn } from "@/src/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[32px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
