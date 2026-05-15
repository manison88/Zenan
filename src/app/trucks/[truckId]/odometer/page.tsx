"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DataList, DataListCard, DataListSkeleton } from "@/components/shared/data-list";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { Plus, Pencil, Trash2, Gauge } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

interface OdometerLog {
  id: number;
  truckId: number;
  weekStartDate: string;
  startingReading: number;
  endingReading: number;
}

export default function OdometerPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [logs, setLogs] = useState<OdometerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OdometerLog | null>(null);
  const [form, setForm] = useState({
    weekStartDate: "",
    startingReading: "",
    endingReading: "",
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [truckId]);

  async function fetchLogs() {
    const res = await fetch(`/api/odometer?truckId=${truckId}`);
    setLogs(await res.json());
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ weekStartDate: "", startingReading: "", endingReading: "" });
    setDialogOpen(true);
  }

  function openEdit(log: OdometerLog) {
    setEditing(log);
    setForm({
      weekStartDate: log.weekStartDate,
      startingReading: String(log.startingReading),
      endingReading: String(log.endingReading),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      truckId: Number(truckId),
      weekStartDate: form.weekStartDate,
      startingReading: Number(form.startingReading),
      endingReading: Number(form.endingReading),
    };

    if (editing) {
      await fetch(`/api/odometer/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/odometer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setDialogOpen(false);
    fetchLogs();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/odometer/${id}`, { method: "DELETE" });
    setLogs(logs.filter((l) => l.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Weekly Odometer</h2>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" /> Add Entry
        </Button>
      </div>

      {loading ? (
        <DataListSkeleton rows={4} />
      ) : (
        <DataList
          items={logs}
          getKey={(log) => log.id}
          emptyState={
            <EmptyState
              icon={<Gauge className="h-12 w-12" />}
              title="No odometer entries"
              description="Log your weekly starting and ending miles"
              action={
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Add Entry
                </Button>
              }
            />
          }
          renderCard={(log) => (
            <DataListCard
              primary={`Week of ${formatDate(log.weekStartDate)}`}
              trailing={`${(log.endingReading - log.startingReading).toLocaleString()} mi`}
              secondary={
                <>
                  {log.startingReading.toLocaleString()} → {log.endingReading.toLocaleString()}
                </>
              }
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
                      <TableHead>Week Of</TableHead>
                      <TableHead className="text-right">Start Miles</TableHead>
                      <TableHead className="text-right">End Miles</TableHead>
                      <TableHead className="text-right">Miles Driven</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.weekStartDate)}</TableCell>
                        <TableCell className="text-right">
                          {log.startingReading.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {log.endingReading.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(log.endingReading - log.startingReading).toLocaleString()}
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
                              className="rounded p-1 hover:bg-destructive/10 text-destructive"
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
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Odometer Entry" : "Add Odometer Entry"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
            <DialogBody className="space-y-4">
              <div className="space-y-2">
                <Label>Week Start Date</Label>
                <Input
                  type="date"
                  value={form.weekStartDate}
                  onChange={(e) =>
                    setForm({ ...form, weekStartDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Starting Miles</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    step="0.1"
                    value={form.startingReading}
                    onChange={(e) =>
                      setForm({ ...form, startingReading: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ending Miles</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    step="0.1"
                    value={form.endingReading}
                    onChange={(e) =>
                      setForm({ ...form, endingReading: e.target.value })
                    }
                    required
                  />
                </div>
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
        title="Delete odometer entry?"
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
