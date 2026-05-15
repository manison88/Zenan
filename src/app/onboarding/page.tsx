"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTenant } = useAuth();
  const { seedDemoData } = useDemo();

  const wantsDemo = searchParams.get("demo") === "1";

  const [step, setStep] = useState(1);
  const [fleetName, setFleetName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function goNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleFleetSubmit(e: React.FormEvent) {
    e.preventDefault();
    goNext();
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");
    if (pin.length < 4) {
      setPinError("PIN must be at least 4 digits.");
      return;
    }
    if (pin.length > 12) {
      setPinError("PIN must be 12 digits or fewer.");
      return;
    }
    if (!/^\d+$/.test(pin)) {
      setPinError("PIN must be numeric.");
      return;
    }
    if (pin !== confirmPin) {
      setPinError("PINs don't match.");
      return;
    }
    goNext();
  }

  async function finish(choice: "clean" | "demo") {
    setSubmitting(true);
    setSignupError("");

    const signupRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fleetName, email, pin }),
      credentials: "include",
    });
    const signupData = await signupRes.json().catch(() => ({}));
    if (!signupRes.ok) {
      setSignupError(signupData.error || "Failed to create account");
      setSubmitting(false);
      // If the email collision happened, jump back to step 1 so they can change it.
      if (signupRes.status === 409) setStep(1);
      return;
    }
    if (signupData.tenant) setTenant(signupData.tenant);

    if (choice === "demo") {
      await seedDemoData().catch(() => {});
      router.push("/dashboard");
    } else {
      localStorage.setItem("zenan-seed-demo", "false");
      router.push("/trucks/new");
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Zenan Fleet</span>
          </Link>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Cancel
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-xl px-6 py-12">
        <StepIndicator step={step} />

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <p className="text-sm text-muted-foreground">
                Two things up front: what to call your fleet and where to reach
                you.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFleetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fleet-name">Fleet name</Label>
                  <Input
                    id="fleet-name"
                    placeholder="e.g. Northridge Transport"
                    value={fleetName}
                    onChange={(e) => setFleetName(e.target.value)}
                    autoFocus
                    required
                    minLength={1}
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to sign in. We won&apos;t send you anything else.
                  </p>
                </div>
                {signupError && (
                  <p className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {signupError}
                  </p>
                )}
                <div className="flex justify-end pt-2">
                  <Button type="submit">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Set a PIN</CardTitle>
              <p className="text-sm text-muted-foreground">
                You&apos;ll use this with your email to sign in. 4–12 digits.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 12))
                    }
                    autoFocus
                    required
                    className="tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pin">Confirm PIN</Label>
                  <Input
                    id="confirm-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(
                        e.target.value.replace(/\D/g, "").slice(0, 12)
                      )
                    }
                    required
                    className="tracking-widest"
                  />
                </div>
                {pinError && (
                  <p className="text-sm text-destructive">{pinError}</p>
                )}
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={goBack}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Pick a starting point</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add your first truck, or load demo data to look around first.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <PathOption
                disabled={submitting}
                highlighted={!wantsDemo}
                onClick={() => finish("clean")}
                title="Start with my truck"
                description="Add your first truck now. Begin logging trips, fuel, and repairs right away."
                icon={<Truck className="h-5 w-5" />}
              />
              <PathOption
                disabled={submitting}
                highlighted={wantsDemo}
                onClick={() => finish("demo")}
                title="Explore with demo data"
                description="Drop in a sample truck with weeks of trips, fuel logs, and repairs to poke around."
                icon={<PlayCircle className="h-5 w-5" />}
              />
              {signupError && (
                <p className="flex items-center gap-2 pt-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {signupError}
                </p>
              )}
              {submitting && (
                <p className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up your fleet…
                </p>
              )}
              <div className="flex justify-start pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => {
        const isCurrent = n === step;
        const isDone = n < step;
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isDone && "border-primary bg-primary/10 text-primary",
                !isCurrent && !isDone && "border-border text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            {n < TOTAL_STEPS && (
              <div
                className={cn(
                  "h-px w-8",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PathOption({
  title,
  description,
  icon,
  onClick,
  disabled,
  highlighted,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors",
        "hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60",
        highlighted && "border-primary/40 bg-primary/5"
      )}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="space-y-1">
        <span className="block text-base font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowRight className="ml-auto mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
