"use client";

import { useState } from "react";
import { usePin } from "@/lib/pin-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck } from "lucide-react";

export function PinScreen() {
  const { unlock } = usePin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = unlock(pin);
    if (!success) {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Truck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl">Zenan Fleet</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your PIN to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive text-center">Incorrect PIN</p>
            )}
            <Button type="submit" className="w-full" disabled={!pin}>
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
