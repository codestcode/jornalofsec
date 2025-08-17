import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = ({ className, variant, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className
      )}
      {...props}
    />
  );
};

export { Badge };