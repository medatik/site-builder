import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Centered max-width content column with responsive gutters. */
export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  const max =
    size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl";
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", max, className)}>
      {children}
    </div>
  );
}
