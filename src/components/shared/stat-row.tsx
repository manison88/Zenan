import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatRowProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  tone?: "positive" | "negative" | "neutral";
  highlight?: boolean;
  className?: string;
}

/**
 * Mobile-friendly stat display — horizontal row instead of stacked card.
 * Used for dashboard / summary headers where we previously had 3 tiny
 * grid-cols-3 cards.
 */
export function StatRow({
  icon,
  label,
  value,
  tone = "neutral",
  highlight,
  className,
}: StatRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm",
        highlight && "border-2 border-primary/20",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={cn(
          "shrink-0 text-base font-bold tabular-nums sm:text-lg",
          tone === "positive" && "text-green-700",
          tone === "negative" && "text-red-600"
        )}
      >
        {value}
      </div>
    </div>
  );
}
