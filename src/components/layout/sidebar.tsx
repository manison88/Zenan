"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo-context";
import { usePin } from "@/lib/pin-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Truck, X, Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trucks", label: "Trucks", icon: Truck },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { demoVisible, setDemoVisible } = useDemo();
  const { updatePin } = usePin();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ current: "", newPin: "", confirm: "" });
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  function handlePinChange(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");

    if (pinForm.newPin.length < 4) {
      setPinError("PIN must be at least 4 characters");
      return;
    }
    if (pinForm.newPin !== pinForm.confirm) {
      setPinError("New PINs don't match");
      return;
    }

    const success = updatePin(pinForm.current, pinForm.newPin);
    if (!success) {
      setPinError("Current PIN is incorrect");
      return;
    }

    setPinSuccess(true);
    setTimeout(() => {
      setPinDialogOpen(false);
      setPinSuccess(false);
      setPinForm({ current: "", newPin: "", confirm: "" });
    }, 1500);
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 animate-fade-in md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[320px] flex-col border-r bg-sidebar transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/dashboard"
            onClick={onMobileClose}
            className="flex items-center gap-2"
          >
            <Truck className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">Zenan Fleet</span>
          </Link>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 space-y-1 safe-bottom">
          <button
            onClick={() => setDemoVisible(!demoVisible)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          >
            <span className="flex items-center gap-3">
              {demoVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Demo Data
            </span>
            <span
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                demoVisible ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                  demoVisible ? "translate-x-4.5" : "translate-x-0.5"
                )}
              />
            </span>
          </button>

          <button
            onClick={() => {
              setPinForm({ current: "", newPin: "", confirm: "" });
              setPinError("");
              setPinSuccess(false);
              setPinDialogOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          >
            <Lock className="h-4 w-4" />
            Change PIN
          </button>
        </div>
      </aside>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent onClose={() => setPinDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
          </DialogHeader>
          {pinSuccess ? (
            <DialogBody>
              <p className="py-4 text-center text-green-600 font-medium">
                PIN updated successfully
              </p>
            </DialogBody>
          ) : (
            <form onSubmit={handlePinChange} className="flex flex-1 flex-col min-h-0">
              <DialogBody className="space-y-4">
                <div className="space-y-2">
                  <Label>Current PIN</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    value={pinForm.current}
                    onChange={(e) =>
                      setPinForm((p) => ({ ...p, current: e.target.value }))
                    }
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>New PIN</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    value={pinForm.newPin}
                    onChange={(e) =>
                      setPinForm((p) => ({ ...p, newPin: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New PIN</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    value={pinForm.confirm}
                    onChange={(e) =>
                      setPinForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    required
                  />
                </div>
                {pinError && <p className="text-sm text-destructive">{pinError}</p>}
              </DialogBody>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPinDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update PIN</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
