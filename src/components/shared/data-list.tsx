"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DataList — paired card-stack (mobile) + table (desktop) primitive.
 *
 * Usage:
 *   <DataList
 *     items={trips}
 *     getKey={(t) => t.id}
 *     renderCard={(t) => <DataListCard primary={...} secondary={...} actions={...} />}
 *     renderTable={() => <Table>...</Table>}
 *   />
 *
 * The card list is shown < md, the table is shown >= md.
 */
interface DataListProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  renderCard: (item: T) => ReactNode;
  renderTable: () => ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

export function DataList<T>({
  items,
  getKey,
  renderCard,
  renderTable,
  emptyState,
  className,
}: DataListProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={className}>
      <div className="space-y-2 md:hidden">
        {items.map((item) => (
          <div key={getKey(item)}>{renderCard(item)}</div>
        ))}
      </div>
      <div className="hidden md:block">{renderTable()}</div>
    </div>
  );
}

interface DataListCardProps {
  primary: ReactNode;
  trailing?: ReactNode;
  secondary?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DataListCard({
  primary,
  trailing,
  secondary,
  meta,
  actions,
  onClick,
  className,
}: DataListCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-2 rounded-lg border bg-card p-3 shadow-sm",
        onClick && "cursor-pointer transition-colors hover:bg-accent/30",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0 text-sm font-medium">{primary}</div>
          {trailing && (
            <div className="shrink-0 text-sm font-semibold">{trailing}</div>
          )}
        </div>
        {secondary && (
          <div className="text-sm text-muted-foreground break-words">{secondary}</div>
        )}
        {meta && (
          <div className="text-xs text-muted-foreground break-words">{meta}</div>
        )}
      </div>
      {actions && <div className="shrink-0 -mr-1">{actions}</div>}
    </div>
  );
}

interface DataListSkeletonProps {
  rows?: number;
}

export function DataListSkeleton({ rows = 4 }: DataListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 shadow-sm"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
