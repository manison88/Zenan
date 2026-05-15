"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function TryDemoButton({
  size = "lg",
  variant = "outline",
  label = "Try the demo",
}: {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
  label?: string;
}) {
  return (
    <Link
      href="/onboarding?demo=1"
      className={cn(buttonVariants({ size, variant }))}
    >
      <PlayCircle className="h-4 w-4" />
      {label}
    </Link>
  );
}

// Re-export Button to keep tree-shaking happy when imports include it.
export { Button };
