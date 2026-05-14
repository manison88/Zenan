"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePin } from "@/lib/pin-context";
import { useDemo } from "@/lib/demo-context";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle } from "lucide-react";

const DEFAULT_DEMO_PIN = "122008";

export function TryDemoButton({
  size = "lg",
  variant = "outline",
  label = "Try the demo",
}: {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
  label?: string;
}) {
  const router = useRouter();
  const { setInitialPin, completeOnboarding, isOnboarded } = usePin();
  const { seedDemoData } = useDemo();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await seedDemoData();
      if (!isOnboarded) {
        setInitialPin(DEFAULT_DEMO_PIN);
        completeOnboarding("Demo Fleet");
      }
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button size={size} variant={variant} onClick={handleClick} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading demo…
        </>
      ) : (
        <>
          <PlayCircle className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
