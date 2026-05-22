import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function Card({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
