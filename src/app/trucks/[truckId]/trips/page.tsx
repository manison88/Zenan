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
import { LocationInput } from "@/components/shared/location-input";
import { DataListCard, DataListSkeleton } from "@/components/shared/data-list";
import { MonthGroupedList } from "@/components/shared/month-grouped-list";
import { FloatingActionButton } from "@/components/shared/fab";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { Plus, Pencil, Trash2, Route } from "lucide-react";
import { formatDate, formatDateShort, formatCurrency } from "@/lib/date-utils";
import { US_STATES } from "@/lib/us-states";

interface Trip {
  id: number;
  truckId: number;
  date: string;
  fromCity: string;
  fromState: string;
  toCity: string;
  toState: string;
  trailer: string | null;
  billNumber: string | null;
  amount: number;
}

const emptyForm = {
  date: "",
  fromCity: "",
  fromState: "",
  toCity: "",
  toState: "",
  trailer: "",
  billNumber: "",
  amount: "",
};

export default function TripsPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truckId]);

  async function fetchTrips() {
    const res = await fetch(`/api/trips?truckId=${truckId}`);
    setTrips(await res.json());
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(trip: Trip) {
    setEditing(trip);
    setForm({
      date: trip.date,
      fromCity: trip.fromCity,
      fromState: trip.fromState,
      toCity: trip.toCity,
      toState: trip.toState,
      trailer: trip.trailer || "",
      billNumber: trip.billNumber || "",
      amount: String(trip.amount),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      truckId: Number(truckId),
      ...form,
      amount: Number(form.amount) || 0,
    };

    if (editing) {
      await fetch(`/api/trips/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setDialogOpen(false);
    fetchTrips();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/trips/${id}`, { method: "DELETE" });
    setTrips(trips.filter((t) => t.id !== id));
  }

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const totalAmount = trips.reduce((sum, t) => sum + t.amount, 0);

  function renderCard(trip: Trip) {
    return (
      <DataListCard
        primary={
          <span className="break-words">
            {formatDateShort(trip.date)} · {trip.fromCity}, {trip.fromState} → {trip.toCity},{" "}
            {trip.toState}
          </span>
        }
        trailing={formatCurrency(trip.amount)}
        meta={
          <>
            {trip.trailer && <>Trailer {trip.trailer}</>}
            {trip.trailer && trip.billNumber && " · "}
            {trip.billNumber && <>Bill #{trip.billNumber}</>}
          </>
        }
        actions={
          <OverflowMenu
            actions={[
              {
                label: "Edit",
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => openEdit(trip),
              },
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                destructive: true,
                onClick: () => setConfirmDeleteId(trip.id),
              },
            ]}
          />
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Trips</h2>
          {trips.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {trips.length} trips · {formatCurrency(totalAmount)}
            </p>
          )}
        </div>
        <Button onClick={openAdd} size="sm" className="hidden shrink-0 md:inline-flex">
          <Plus className="h-4 w-4" /> Add Trip
        </Button>
      </div>

      {loading ? (
        <DataListSkeleton rows={4} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={<Route className="h-12 w-12" />}
          title="No trips logged"
          description="Start logging trips to track revenue"
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Trip
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: month-grouped cards */}
          <div className="md:hidden">
            <MonthGroupedList
              items={trips}
              getKey={(t) => t.id}
              getDate={(t) => t.date}
              renderItem={renderCard}
            />
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Trailer</TableHead>
                      <TableHead>Bill #</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>{formatDate(trip.date)}</TableCell>
                        <TableCell>
                          {trip.fromCity}, {trip.fromState}
                        </TableCell>
                        <TableCell>
                          {trip.toCity}, {trip.toState}
                        </TableCell>
                        <TableCell>{trip.trailer || "-"}</TableCell>
                        <TableCell>{trip.billNumber || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(trip.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(trip)}
                              className="rounded p-1 hover:bg-accent"
                              aria-label="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(trip.id)}
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
          </div>
        </>
      )}

      <FloatingActionButton
        onClick={openAdd}
        label="Add Trip"
        icon={<Plus className="h-6 w-6" />}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Trip" : "Add Trip"}</DialogTitle>
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
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => updateForm("amount", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>From City</Label>
                  <LocationInput
                    value={form.fromCity}
                    onChange={(v) => {
                      const parts = v.split(", ");
                      if (parts.length === 2) {
                        setForm((prev) => ({
                          ...prev,
                          fromCity: parts[0],
                          fromState: parts[1],
                        }));
                      } else {
                        updateForm("fromCity", v);
                      }
                    }}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From State</Label>
                  <Select
                    value={form.fromState}
                    onChange={(e) => updateForm("fromState", e.target.value)}
                    required
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>To City</Label>
                  <LocationInput
                    value={form.toCity}
                    onChange={(v) => {
                      const parts = v.split(", ");
                      if (parts.length === 2) {
                        setForm((prev) => ({
                          ...prev,
                          toCity: parts[0],
                          toState: parts[1],
                        }));
                      } else {
                        updateForm("toCity", v);
                      }
                    }}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>To State</Label>
                  <Select
                    value={form.toState}
                    onChange={(e) => updateForm("toState", e.target.value)}
                    required
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Trailer</Label>
                  <Input
                    value={form.trailer}
                    onChange={(e) => updateForm("trailer", e.target.value)}
                    placeholder="Trailer #"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bill #</Label>
                  <Input
                    value={form.billNumber}
                    onChange={(e) => updateForm("billNumber", e.target.value)}
                    placeholder="Bill number"
                  />
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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
        title="Delete trip?"
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
