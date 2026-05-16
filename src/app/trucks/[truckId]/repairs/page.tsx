"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DataList,
  DataListCard,
  DataListSkeleton,
} from "@/components/shared/data-list";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  CalendarClock,
  AlertTriangle,
  Clock,
  CalendarCheck,
} from "lucide-react";
import { formatDate, formatDateShort, formatCurrency } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface Repair {
  id: number;
  truckId: number;
  date: string;
  repairTypeId: number;
  repairTypeName: string | null;
  amount: number;
  notes: string | null;
}

interface MaintenanceLog {
  id: number;
  truckId: number;
  repairTypeId: number;
  repairTypeName: string | null;
  serviceDate: string | null;
  serviceOdometer: number | null;
  cost: number;
  notes: string | null;
  nextDueDate: string | null;
  nextDueOdometer: number | null;
  createdAt: string;
}

interface RepairType {
  id: number;
  name: string;
  isDefault: number;
}

const emptyRepairForm = { date: "", repairTypeId: "", amount: "", notes: "" };
const emptyMaintForm = {
  repairTypeId: "",
  serviceDate: "",
  serviceOdometer: "",
  cost: "",
  notes: "",
  nextDueDate: "",
  nextDueOdometer: "",
};

export default function RepairsPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [view, setView] = useState<"repairs" | "maintenance">("repairs");
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRepairs(), fetchMaintenance(), fetchTypes()]).then(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truckId]);

  async function fetchRepairs() {
    const res = await fetch(`/api/repairs?truckId=${truckId}`);
    setRepairs(await res.json());
  }

  async function fetchMaintenance() {
    const res = await fetch(`/api/maintenance?truckId=${truckId}`);
    setMaintenance(await res.json());
  }

  async function fetchTypes() {
    const res = await fetch("/api/repair-types");
    setRepairTypes(await res.json());
  }

  if (loading) {
    return (
      <div>
        <ViewToggle view={view} onChange={setView} />
        <DataListSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div>
      <ViewToggle view={view} onChange={setView} />
      {view === "repairs" ? (
        <RepairsSection
          truckId={truckId}
          repairs={repairs}
          repairTypes={repairTypes}
          onChange={fetchRepairs}
          onTypesChange={fetchTypes}
        />
      ) : (
        <MaintenanceSection
          truckId={truckId}
          logs={maintenance}
          repairTypes={repairTypes}
          onChange={fetchMaintenance}
          onTypesChange={fetchTypes}
        />
      )}
    </div>
  );
}

// ── View toggle ─────────────────────────────────────────────────────────────
function ViewToggle({
  view,
  onChange,
}: {
  view: "repairs" | "maintenance";
  onChange: (v: "repairs" | "maintenance") => void;
}) {
  return (
    <div className="mb-4 inline-flex w-full rounded-lg border bg-muted/30 p-1 sm:w-auto">
      <button
        type="button"
        onClick={() => onChange("repairs")}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
          view === "repairs"
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Repair Log
      </button>
      <button
        type="button"
        onClick={() => onChange("maintenance")}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
          view === "maintenance"
            ? "bg-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Maintenance
      </button>
    </div>
  );
}

// ── Repairs section ─────────────────────────────────────────────────────────
function RepairsSection({
  truckId,
  repairs,
  repairTypes,
  onChange,
  onTypesChange,
}: {
  truckId: string;
  repairs: Repair[];
  repairTypes: RepairType[];
  onChange: () => void;
  onTypesChange: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Repair | null>(null);
  const [form, setForm] = useState(emptyRepairForm);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyRepairForm);
    setShowNewType(false);
    setDialogOpen(true);
  }

  function openEdit(repair: Repair) {
    setEditing(repair);
    setForm({
      date: repair.date,
      repairTypeId: String(repair.repairTypeId),
      amount: String(repair.amount),
      notes: repair.notes || "",
    });
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
    onTypesChange();
    setForm((prev) => ({ ...prev, repairTypeId: String(newType.id) }));
    setNewTypeName("");
    setShowNewType(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      truckId: Number(truckId),
      ...form,
      repairTypeId: Number(form.repairTypeId),
      amount: Number(form.amount),
    };

    if (editing) {
      await fetch(`/api/repairs/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setDialogOpen(false);
    onChange();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/repairs/${id}`, { method: "DELETE" });
    onChange();
  }

  function updateForm(field: keyof typeof emptyRepairForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const totalAmount = repairs.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Repairs</h2>
          {repairs.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {repairs.length} repairs · {formatCurrency(totalAmount)}
            </p>
          )}
        </div>
        <Button onClick={openAdd} size="sm" className="shrink-0">
          <Plus className="h-4 w-4" /> Add Repair
        </Button>
      </div>

      <DataList
        items={repairs}
        getKey={(r) => r.id}
        emptyState={
          <EmptyState
            icon={<Wrench className="h-12 w-12" />}
            title="No repairs logged"
            description="Track unexpected repair costs as they happen"
            action={
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> Add Repair
              </Button>
            }
          />
        }
        renderCard={(repair) => (
          <DataListCard
            primary={
              <>
                {formatDateShort(repair.date)} ·{" "}
                {repair.repairTypeName || "Unknown"}
              </>
            }
            trailing={formatCurrency(repair.amount)}
            secondary={repair.notes || null}
            actions={
              <OverflowMenu
                actions={[
                  {
                    label: "Edit",
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => openEdit(repair),
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 className="h-4 w-4" />,
                    destructive: true,
                    onClick: () => setConfirmDeleteId(repair.id),
                  },
                ]}
              />
            }
          />
        )}
        renderTable={() => (
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
                      <TableCell className="text-right font-medium">
                        {formatCurrency(repair.amount)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {repair.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(repair)}
                            className="rounded p-1 hover:bg-accent"
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(repair.id)}
                            className="rounded p-1 text-destructive hover:bg-destructive/10"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Repair" : "Add Repair"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => updateForm("amount", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Repair Type</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.repairTypeId}
                    onChange={(e) => updateForm("repairTypeId", e.target.value)}
                    required
                    className="flex-1"
                  >
                    <option value="">Select type</option>
                    {repairTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewType(!showNewType)}
                    aria-label="Add new type"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {showNewType && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="New type name"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" size="sm" onClick={handleAddType}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Additional details"
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmSheet
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Delete repair?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmDeleteId !== null) handleDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}

// ── Maintenance section ─────────────────────────────────────────────────────
function MaintenanceSection({
  truckId,
  logs,
  repairTypes,
  onChange,
  onTypesChange,
}: {
  truckId: string;
  logs: MaintenanceLog[];
  repairTypes: RepairType[];
  onChange: () => void;
  onTypesChange: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceLog | null>(null);
  const [form, setForm] = useState(emptyMaintForm);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyMaintForm);
    setShowNewType(false);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(log: MaintenanceLog) {
    setEditing(log);
    setForm({
      repairTypeId: String(log.repairTypeId),
      serviceDate: log.serviceDate ?? "",
      serviceOdometer:
        log.serviceOdometer != null ? String(log.serviceOdometer) : "",
      cost: log.cost ? String(log.cost) : "",
      notes: log.notes ?? "",
      nextDueDate: log.nextDueDate ?? "",
      nextDueOdometer:
        log.nextDueOdometer != null ? String(log.nextDueOdometer) : "",
    });
    setShowNewType(false);
    setFormError("");
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
    onTypesChange();
    setForm((prev) => ({ ...prev, repairTypeId: String(newType.id) }));
    setNewTypeName("");
    setShowNewType(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.repairTypeId) {
      setFormError("Pick a maintenance type.");
      return;
    }
    if (!form.serviceDate && !form.nextDueDate && !form.nextDueOdometer) {
      setFormError(
        "Provide a service date, a next-due date, or a next-due odometer."
      );
      return;
    }

    const payload = {
      truckId: Number(truckId),
      repairTypeId: Number(form.repairTypeId),
      serviceDate: form.serviceDate || null,
      serviceOdometer: form.serviceOdometer || null,
      cost: form.cost || null,
      notes: form.notes || null,
      nextDueDate: form.nextDueDate || null,
      nextDueOdometer: form.nextDueOdometer || null,
    };

    const res = editing
      ? await fetch(`/api/maintenance/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error || "Failed to save");
      return;
    }

    setDialogOpen(false);
    onChange();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    onChange();
  }

  function updateForm(field: keyof typeof emptyMaintForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const seen = new Set<number>();
  const upcoming = logs
    .filter((l) => {
      if (seen.has(l.repairTypeId)) return false;
      seen.add(l.repairTypeId);
      return l.nextDueDate || l.nextDueOdometer != null;
    })
    .sort((a, b) => {
      const at = a.nextDueDate ?? "9999-12-31";
      const bt = b.nextDueDate ?? "9999-12-31";
      return at.localeCompare(bt);
    });

  const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Maintenance</h2>
          {logs.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {logs.length} entries · {upcoming.length} upcoming ·{" "}
              {formatCurrency(totalCost)} spent
            </p>
          )}
        </div>
        <Button onClick={openAdd} size="sm" className="shrink-0">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-12 w-12" />}
          title="No maintenance tracked"
          description="Log services like oil changes, brakes, and tires, and set when the next one is due."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Maintenance
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                Upcoming
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {upcoming.map((item) => (
                  <UpcomingCard
                    key={item.id}
                    item={item}
                    onEdit={() => openEdit(item)}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              History
            </h3>
            <DataList
              items={logs}
              getKey={(l) => l.id}
              renderCard={(log) => (
                <DataListCard
                  primary={
                    <>
                      {log.serviceDate
                        ? formatDateShort(log.serviceDate)
                        : "Scheduled"}{" "}
                      · {log.repairTypeName || "Unknown"}
                    </>
                  }
                  trailing={log.cost ? formatCurrency(log.cost) : null}
                  secondary={
                    <>
                      {log.serviceOdometer != null && (
                        <>at {log.serviceOdometer.toLocaleString()} mi</>
                      )}
                      {log.serviceOdometer != null &&
                        (log.nextDueDate || log.nextDueOdometer != null) &&
                        " · "}
                      {(log.nextDueDate || log.nextDueOdometer != null) && (
                        <>Next: {formatNextDue(log)}</>
                      )}
                    </>
                  }
                  meta={log.notes || null}
                  actions={
                    <OverflowMenu
                      actions={[
                        {
                          label: "Edit",
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => openEdit(log),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 className="h-4 w-4" />,
                          destructive: true,
                          onClick: () => setConfirmDeleteId(log.id),
                        },
                      ]}
                    />
                  }
                />
              )}
              renderTable={() => (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Odometer</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Next Due</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {log.serviceDate ? (
                                formatDate(log.serviceDate)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {log.repairTypeName || "Unknown"}
                            </TableCell>
                            <TableCell className="text-right">
                              {log.serviceOdometer != null
                                ? log.serviceOdometer.toLocaleString()
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {log.cost ? formatCurrency(log.cost) : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatNextDue(log)}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                              {log.notes || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEdit(log)}
                                  className="rounded p-1 hover:bg-accent"
                                  aria-label="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(log.id)}
                                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            />
          </section>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Maintenance" : "Add Maintenance"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
            <DialogBody className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.repairTypeId}
                    onChange={(e) => updateForm("repairTypeId", e.target.value)}
                    required
                    className="flex-1"
                  >
                    <option value="">Select type</option>
                    {repairTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewType(!showNewType)}
                    aria-label="Add new type"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {showNewType && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="New type name"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" size="sm" onClick={handleAddType}>
                      Add
                    </Button>
                  </div>
                )}
              </div>

              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="px-1 text-xs font-medium text-muted-foreground">
                  Service performed (optional)
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={form.serviceDate}
                      onChange={(e) => updateForm("serviceDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Odometer</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={form.serviceOdometer}
                      onChange={(e) =>
                        updateForm("serviceOdometer", e.target.value)
                      }
                      placeholder="e.g. 145000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cost ($)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => updateForm("cost", e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="px-1 text-xs font-medium text-muted-foreground">
                  Next due (optional)
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={form.nextDueDate}
                      onChange={(e) => updateForm("nextDueDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Odometer</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={form.nextDueOdometer}
                      onChange={(e) =>
                        updateForm("nextDueOdometer", e.target.value)
                      }
                      placeholder="e.g. 150000"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Additional details"
                />
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmSheet
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Delete maintenance entry?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmDeleteId !== null) handleDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}

// ── Upcoming card ───────────────────────────────────────────────────────────
function UpcomingCard({
  item,
  onEdit,
}: {
  item: MaintenanceLog;
  onEdit: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const daysUntil = item.nextDueDate
    ? daysBetween(today, item.nextDueDate)
    : null;

  let urgency: "overdue" | "due_soon" | "upcoming" = "upcoming";
  if (daysUntil !== null && daysUntil < 0) urgency = "overdue";
  else if (daysUntil !== null && daysUntil <= 14) urgency = "due_soon";

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50",
        urgency === "overdue" && "border-destructive/40 bg-destructive/5",
        urgency === "due_soon" && "border-amber-300 bg-amber-50"
      )}
    >
      <UrgencyIcon urgency={urgency} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="truncate font-semibold">
            {item.repairTypeName || "Maintenance"}
          </span>
          <UrgencyBadge urgency={urgency} />
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground break-words">
          {item.nextDueDate && (
            <span>
              Due {formatDate(item.nextDueDate)}
              {daysUntil !== null && (
                <>
                  {" "}
                  ({daysUntil < 0
                    ? `${Math.abs(daysUntil)}d overdue`
                    : `in ${daysUntil}d`}
                  )
                </>
              )}
            </span>
          )}
          {item.nextDueDate && item.nextDueOdometer != null && " · "}
          {item.nextDueOdometer != null && (
            <span>at {item.nextDueOdometer.toLocaleString()} mi</span>
          )}
        </div>
      </div>
    </button>
  );
}

function UrgencyIcon({
  urgency,
}: {
  urgency: "overdue" | "due_soon" | "upcoming";
}) {
  if (urgency === "overdue")
    return <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />;
  if (urgency === "due_soon")
    return <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />;
  return (
    <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
  );
}

function UrgencyBadge({
  urgency,
}: {
  urgency: "overdue" | "due_soon" | "upcoming";
}) {
  const label =
    urgency === "overdue"
      ? "Overdue"
      : urgency === "due_soon"
        ? "Due soon"
        : "Upcoming";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        urgency === "overdue" && "bg-destructive/10 text-destructive",
        urgency === "due_soon" && "bg-amber-100 text-amber-800",
        urgency === "upcoming" && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

function formatNextDue(log: MaintenanceLog): string {
  const parts: string[] = [];
  if (log.nextDueDate) parts.push(formatDate(log.nextDueDate));
  if (log.nextDueOdometer != null)
    parts.push(`${log.nextDueOdometer.toLocaleString()} mi`);
  return parts.length ? parts.join(" · ") : "—";
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T00:00:00Z").getTime();
  const b = new Date(toIso + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}
