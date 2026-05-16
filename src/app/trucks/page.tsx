"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { PageContainer } from "@/components/shared/page-container";
import { FloatingActionButton } from "@/components/shared/fab";
import { useDemo } from "@/lib/demo-context";
import { PageHeader } from "@/components/layout/page-header";
import { useRouter } from "next/navigation";
import { Plus, Truck, Trash2, ChevronRight } from "lucide-react";

interface TruckRecord {
  id: number;
  truckNumber: string;
  isDemo: number;
  createdAt: string;
}

export default function TrucksPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { demoVisible } = useDemo();

  useEffect(() => {
    fetchTrucks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <PageContainer>
      <PageHeader title="Trucks" subtitle="Manage your fleet vehicles" actions={addButton} />

      {/* On mobile, TopBar shows "Trucks" and the FAB handles "Add Truck"
          — no duplicate inline header needed. */}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />
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
              className="relative flex items-center gap-2 p-3 transition-shadow hover:shadow-md"
            >
              <Link
                href={`/trucks/${truck.id}/trips`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="truncate">Truck #{truck.truckNumber}</span>
                    {truck.isDemo === 1 && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        DEMO
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">View details</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
              <div className="shrink-0">
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

      <FloatingActionButton
        onClick={() => router.push("/trucks/new")}
        label="Add Truck"
        icon={<Plus className="h-6 w-6" />}
      />

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
    </PageContainer>
  );
}
