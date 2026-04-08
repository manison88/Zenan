"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LocationInput } from "@/components/shared/location-input";
import { Plus, Pencil, Trash2, Fuel } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/date-utils";
import { US_STATES } from "@/lib/us-states";

interface FuelLog {
  id: number;
  truckId: number;
  date: string;
  city: string;
  state: string;
  gallons: number;
  amount: number;
}

const emptyForm = { date: "", city: "", state: "", gallons: "", amount: "" };

export default function FuelPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FuelLog | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchLogs(); }, [truckId]);

  async function fetchLogs() {
    const res = await fetch(`/api/fuel?truckId=${truckId}`);
    setLogs(await res.json());
    setLoading(false);
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }

  function openEdit(log: FuelLog) {
    setEditing(log);
    setForm({ date: log.date, city: log.city, state: log.state, gallons: String(log.gallons), amount: String(log.amount) });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { truckId: Number(truckId), ...form, gallons: Number(form.gallons), amount: Number(form.amount) };

    if (editing) {
      await fetch(`/api/fuel/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/fuel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setDialogOpen(false);
    fetchLogs();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this fuel entry?")) return;
    await fetch(`/api/fuel/${id}`, { method: "DELETE" });
    setLogs(logs.filter((l) => l.id !== id));
  }

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const totalAmount = logs.reduce((s, l) => s + l.amount, 0);
  const totalGallons = logs.reduce((s, l) => s + l.gallons, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fuel Purchases</h2>
          {logs.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {totalGallons.toFixed(1)} gal | {formatCurrency(totalAmount)}
            </p>
          )}
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add Fuel</Button>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={<Fuel className="h-12 w-12" />} title="No fuel entries" description="Log fuel purchases to track gas expenses" action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Fuel</Button>} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Gallons</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">$/Gal</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell>{log.city}, {log.state}</TableCell>
                    <TableCell className="text-right">{log.gallons.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(log.amount)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{(log.amount / log.gallons).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(log)} className="rounded p-1 hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(log.id)} className="rounded p-1 hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader><DialogTitle>{editing ? "Edit Fuel Entry" : "Add Fuel Entry"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <LocationInput value={form.city} onChange={(v) => {
                  const parts = v.split(", ");
                  if (parts.length === 2) {
                    setForm((prev) => ({ ...prev, city: parts[0], state: parts[1] }));
                  } else {
                    updateForm("city", v);
                  }
                }} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={form.state} onChange={(e) => updateForm("state", e.target.value)} required>
                  <option value="">Select</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gallons</Label>
                <Input type="number" step="0.01" value={form.gallons} onChange={(e) => updateForm("gallons", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => updateForm("amount", e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
