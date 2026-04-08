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
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/date-utils";

interface Repair {
  id: number;
  truckId: number;
  date: string;
  repairTypeId: number;
  repairTypeName: string | null;
  amount: number;
  notes: string | null;
}

interface RepairType {
  id: number;
  name: string;
  isDefault: number;
}

const emptyForm = { date: "", repairTypeId: "", amount: "", notes: "" };

export default function RepairsPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Repair | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  useEffect(() => {
    Promise.all([fetchRepairs(), fetchTypes()]).then(() => setLoading(false));
  }, [truckId]);

  async function fetchRepairs() {
    const res = await fetch(`/api/repairs?truckId=${truckId}`);
    setRepairs(await res.json());
  }

  async function fetchTypes() {
    const res = await fetch("/api/repair-types");
    setRepairTypes(await res.json());
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowNewType(false); setDialogOpen(true); }

  function openEdit(repair: Repair) {
    setEditing(repair);
    setForm({ date: repair.date, repairTypeId: String(repair.repairTypeId), amount: String(repair.amount), notes: repair.notes || "" });
    setShowNewType(false);
    setDialogOpen(true);
  }

  async function handleAddType() {
    if (!newTypeName.trim()) return;
    const res = await fetch("/api/repair-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTypeName.trim() }),
    });
    const newType = await res.json();
    setRepairTypes((prev) => [...prev, newType].sort((a, b) => a.name.localeCompare(b.name)));
    setForm((prev) => ({ ...prev, repairTypeId: String(newType.id) }));
    setNewTypeName("");
    setShowNewType(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { truckId: Number(truckId), ...form, repairTypeId: Number(form.repairTypeId), amount: Number(form.amount) };

    if (editing) {
      await fetch(`/api/repairs/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/repairs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setDialogOpen(false);
    fetchRepairs();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this repair?")) return;
    await fetch(`/api/repairs/${id}`, { method: "DELETE" });
    setRepairs(repairs.filter((r) => r.id !== id));
  }

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const totalAmount = repairs.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Repairs</h2>
          {repairs.length > 0 && (
            <p className="text-sm text-muted-foreground">{repairs.length} repairs | {formatCurrency(totalAmount)}</p>
          )}
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> Add Repair</Button>
      </div>

      {repairs.length === 0 ? (
        <EmptyState icon={<Wrench className="h-12 w-12" />} title="No repairs logged" description="Track maintenance and repair costs" action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Repair</Button>} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell>{formatDate(repair.date)}</TableCell>
                    <TableCell>{repair.repairTypeName || "Unknown"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(repair.amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{repair.notes || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(repair)} className="rounded p-1 hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(repair.id)} className="rounded p-1 hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Repair" : "Add Repair"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => updateForm("amount", e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Repair Type</Label>
              <div className="flex gap-2">
                <Select value={form.repairTypeId} onChange={(e) => updateForm("repairTypeId", e.target.value)} required className="flex-1">
                  <option value="">Select type</option>
                  {repairTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewType(!showNewType)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {showNewType && (
                <div className="flex gap-2">
                  <Input placeholder="New type name" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} className="flex-1" />
                  <Button type="button" size="sm" onClick={handleAddType}>Add</Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Additional details" />
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
