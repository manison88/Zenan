"use client";

import type { ReactNode, MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  label: string;
  icon: ReactNode;
  className?: string;
}

/**
 * Mobile-only floating action button. Renders nothing on md+.
 * Positioned to clear both the bottom nav (h-14 + safe-area) and any
 * iOS home indicator.
 */
export function FloatingActionButton({
  onClick,
  label,
  icon,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "md:hidden",
        "fixed right-4 z-30 flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-primary-foreground shadow-lg",
        "transition-transform active:scale-95",
        "bottom-[calc(env(safe-area-inset-bottom,0px)+4rem)]",
        className
      )}
    >
      {icon}
    </button>
  );
}
