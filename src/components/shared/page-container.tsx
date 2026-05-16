import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Every authenticated page should be wrapped in this.
 * Hard-caps width and provides a defensive overflow boundary so a
 * misbehaving child component can never cause the whole page to
 * horizontally scroll on mobile.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full overflow-x-clip",
        className
      )}
    >
      {children}
    </div>
  );
}
