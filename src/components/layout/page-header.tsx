"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface PageHeaderState {
  title: string | null;
  actions: ReactNode | null;
}

interface PageHeaderContextValue extends PageHeaderState {
  set: (state: Partial<PageHeaderState>) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
  title: null,
  actions: null,
  set: () => {},
});

export function usePageHeader() {
  return useContext(PageHeaderContext);
}

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageHeaderState>({ title: null, actions: null });
  const value: PageHeaderContextValue = {
    ...state,
    set: (patch) => setState((s) => ({ ...s, ...patch })),
  };
  return (
    <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  const { set } = usePageHeader();

  useEffect(() => {
    set({ title, actions: actions ?? null });
    return () => set({ title: null, actions: null });
  }, [title, actions, set]);

  return (
    <div className={`mb-4 hidden md:flex md:items-start md:justify-between md:gap-4 ${className ?? ""}`}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
