"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

export default function FixedCostsPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [form, setForm] = useState({ insurance: "", parking: "", eld: "", tolls: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/fixed-costs?truckId=${truckId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          insurance: String(data.insurance || 0),
          parking: String(data.parking || 0),
          eld: String(data.eld || 0),
          tolls: String(data.tolls || 0),
        });
        setLoading(false);
      });
  }, [truckId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/fixed-costs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        truckId: Number(truckId),
        insurance: Number(form.insurance),
        parking: Number(form.parking),
        eld: Number(form.eld),
        tolls: Number(form.tolls),
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const fields = [
    { key: "insurance", label: "Truck Insurance", desc: "Monthly insurance premium" },
    { key: "parking", label: "Parking", desc: "Monthly parking fee" },
    { key: "eld", label: "ELD", desc: "Electronic Logging Device monthly fee" },
    { key: "tolls", label: "Tolls", desc: "Monthly toll expenses" },
  ];

  return (
    <div className="max-w-lg">
      <h2 className="mb-4 text-lg font-semibold">Monthly Fixed Costs</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fixed Monthly Expenses
          </CardTitle>
          <CardDescription>
            These amounts are applied each month in your financial summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, desc }) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key}>{label}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id={key}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              {saved && <span className="text-sm text-green-600">Saved successfully</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
