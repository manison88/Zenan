"use client";

import { Menu } from "lucide-react";
import { usePageHeader } from "./page-header";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { title } = usePageHeader();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-3 md:hidden safe-x">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="flex-1 truncate text-base font-semibold">{title ?? "Zenan Fleet"}</h1>
    </header>
  );
}
