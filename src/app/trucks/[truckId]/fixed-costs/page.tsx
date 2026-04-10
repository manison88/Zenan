"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/date-utils";

interface CustomCost {
  id: number;
  truckId: number;
  name: string;
  amount: number;
}

export default function FixedCostsPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [form, setForm] = useState({ insurance: "", parking: "", eld: "", tolls: "" });
  const [customCosts, setCustomCosts] = useState<CustomCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", amount: "" });
  const [editingCustom, setEditingCustom] = useState<CustomCost | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/fixed-costs?truckId=${truckId}`).then((r) => r.json()),
      fetch(`/api/custom-fixed-costs?truckId=${truckId}`).then((r) => r.json()),
    ]).then(([fcData, customData]) => {
      setForm({
        insurance: String(fcData.insurance || 0),
        parking: String(fcData.parking || 0),
        eld: String(fcData.eld || 0),
        tolls: String(fcData.tolls || 0),
      });
      setCustomCosts(customData);
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

  async function handleAddCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customForm.name.trim() || !customForm.amount) return;

    if (editingCustom) {
      const res = await fetch(`/api/custom-fixed-costs/${editingCustom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customForm.name, amount: Number(customForm.amount) }),
      });
      const updated = await res.json();
      setCustomCosts(customCosts.map((c) => (c.id === editingCustom.id ? updated : c)));
    } else {
      const res = await fetch("/api/custom-fixed-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truckId: Number(truckId), name: customForm.name, amount: Number(customForm.amount) }),
      });
      const created = await res.json();
      setCustomCosts([...customCosts, created]);
    }

    setCustomForm({ name: "", amount: "" });
    setShowAddCustom(false);
    setEditingCustom(null);
  }

  function startEditCustom(cost: CustomCost) {
    setEditingCustom(cost);
    setCustomForm({ name: cost.name, amount: String(cost.amount) });
    setShowAddCustom(true);
  }

  async function handleDeleteCustom(id: number) {
    if (!confirm("Delete this custom cost?")) return;
    await fetch(`/api/custom-fixed-costs/${id}`, { method: "DELETE" });
    setCustomCosts(customCosts.filter((c) => c.id !== id));
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
    <div className="max-w-lg space-y-6">
      <h2 className="text-lg font-semibold">Monthly Fixed Costs</h2>

      {/* Standard fixed costs */}
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

      {/* Custom fixed costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Custom Costs</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingCustom(null);
                setCustomForm({ name: "", amount: "" });
                setShowAddCustom(!showAddCustom);
              }}
            >
              <Plus className="h-4 w-4" /> Add Custom
            </Button>
          </CardTitle>
          <CardDescription>
            Add any other recurring monthly expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddCustom && (
            <form onSubmit={handleAddCustom} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="e.g. Truck Payment"
                  value={customForm.name}
                  onChange={(e) => setCustomForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="w-32 space-y-1">
                <Label className="text-xs">Monthly $</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={customForm.amount}
                  onChange={(e) => setCustomForm((p) => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" size="sm">{editingCustom ? "Update" : "Add"}</Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setShowAddCustom(false); setEditingCustom(null); }}
              >
                Cancel
              </Button>
            </form>
          )}

          {customCosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Monthly Amount</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{cost.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(cost.amount)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => startEditCustom(cost)} className="rounded p-1 hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDeleteCustom(cost.id)} className="rounded p-1 hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !showAddCustom && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom costs yet. Click &quot;Add Custom&quot; to add one.
              </p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
