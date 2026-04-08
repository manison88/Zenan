"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Truck, Trash2 } from "lucide-react";

interface TruckRecord {
  id: number;
  truckNumber: string;
  createdAt: string;
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrucks();
  }, []);

  async function fetchTrucks() {
    const res = await fetch("/api/trucks");
    const data = await res.json();
    setTrucks(data);
    setLoading(false);
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this truck and all its data?")) return;
    await fetch(`/api/trucks/${id}`, { method: "DELETE" });
    setTrucks(trucks.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trucks</h1>
          <p className="text-muted-foreground">Manage your fleet vehicles</p>
        </div>
        <Link href="/trucks/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Truck
          </Button>
        </Link>
      </div>

      {trucks.length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trucks.map((truck) => (
            <Link key={truck.id} href={`/trucks/${truck.id}/trips`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Truck #{truck.truckNumber}</CardTitle>
                  <button
                    onClick={(e) => handleDelete(truck.id, e)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>View details</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
