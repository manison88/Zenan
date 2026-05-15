"use client";

import { useState, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface OverflowAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

interface OverflowMenuProps {
  actions: OverflowAction[];
  label?: string;
  className?: string;
}

export function OverflowMenu({ actions, label = "Actions", className }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="More actions"
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent",
          className
        )}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-1 py-2">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium transition-colors",
                  action.destructive
                    ? "text-destructive hover:bg-destructive/10"
                    : "hover:bg-accent"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
