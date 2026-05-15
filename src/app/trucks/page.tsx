"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { useDemo } from "@/lib/demo-context";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, Truck, Trash2, ChevronRight } from "lucide-react";

interface TruckRecord {
  id: number;
  truckNumber: string;
  isDemo: number;
  createdAt: string;
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { demoVisible } = useDemo();

  useEffect(() => {
    fetchTrucks();
  }, [demoVisible]);

  async function fetchTrucks() {
    const params = demoVisible ? "" : "?excludeDemo=1";
    const res = await fetch(`/api/trucks${params}`);
    const data = await res.json();
    setTrucks(data);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/trucks/${id}`, { method: "DELETE" });
    setTrucks(trucks.filter((t) => t.id !== id));
  }

  const addButton = (
    <Link href="/trucks/new">
      <Button size="sm">
        <Plus className="h-4 w-4" />
        Add Truck
      </Button>
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Trucks"
        subtitle="Manage your fleet vehicles"
        actions={addButton}
      />

      {/* Mobile-only header row (desktop uses PageHeader) */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <p className="text-sm text-muted-foreground">Manage your fleet vehicles</p>
        {addButton}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : trucks.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-12 w-12" />}
          title="No trucks yet"
          description="Add your first truck to start tracking"
          action={
            <Link href="/trucks/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Truck
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trucks.map((truck) => (
            <Card
              key={truck.id}
              className="relative transition-shadow hover:shadow-md"
            >
              <Link
                href={`/trucks/${truck.id}/trips`}
                className="flex items-center justify-between gap-2 p-4"
              >
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    Truck #{truck.truckNumber}
                    {truck.isDemo === 1 && (
                      <Badge variant="secondary" className="text-xs">
                        DEMO
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>View details</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="absolute right-2 top-2">
                <OverflowMenu
                  actions={[
                    {
                      label: "Delete truck",
                      icon: <Trash2 className="h-4 w-4" />,
                      destructive: true,
                      onClick: () => setConfirmDeleteId(truck.id),
                    },
                  ]}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmSheet
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Delete truck?"
        description="This will permanently delete the truck and all of its data."
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
