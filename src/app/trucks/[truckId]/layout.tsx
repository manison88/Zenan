"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TabNav } from "@/components/ui/tabs";
import { Truck } from "lucide-react";

interface TruckRecord {
  id: number;
  truckNumber: string;
}

export default function TruckDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const truckId = params.truckId as string;
  const [truck, setTruck] = useState<TruckRecord | null>(null);

  useEffect(() => {
    fetch(`/api/trucks/${truckId}`)
      .then((r) => r.json())
      .then(setTruck);
  }, [truckId]);

  const tabs = [
    { label: "Trips", href: `/trucks/${truckId}/trips` },
    { label: "Odometer", href: `/trucks/${truckId}/odometer` },
    { label: "Fuel", href: `/trucks/${truckId}/fuel` },
    { label: "Repairs", href: `/trucks/${truckId}/repairs` },
    { label: "Fixed Costs", href: `/trucks/${truckId}/fixed-costs` },
    { label: "Summary", href: `/trucks/${truckId}/summary` },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Truck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          Truck #{truck?.truckNumber ?? "..."}
        </h1>
      </div>
      <TabNav tabs={tabs} className="mb-6" />
      {children}
    </div>
  );
}
