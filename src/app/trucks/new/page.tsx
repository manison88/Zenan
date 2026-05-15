"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";

export default function NewTruckPage() {
  const router = useRouter();
  const [truckNumber, setTruckNumber] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!truckNumber.trim()) {
      setError("Truck number is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truckNumber: truckNumber.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create truck");
        return;
      }

      router.push("/trucks");
    } catch {
      setError("Failed to create truck");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Add New Truck" />
      <h1 className="mb-4 text-xl font-bold md:hidden">Add New Truck</h1>
      <Card>
        <CardHeader>
          <CardTitle>Truck Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="truckNumber">Truck Number</Label>
              <Input
                id="truckNumber"
                inputMode="numeric"
                placeholder="e.g. 101"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="sm:order-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="sm:order-2">
                {saving ? "Creating..." : "Create Truck"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
