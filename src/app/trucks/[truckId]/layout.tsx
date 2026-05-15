"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TabNav } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { Truck } from "lucide-react";

interface TruckRecord {
  id: number;
  truckNumber: string;
}

export default function TruckDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const title = truck ? `Truck #${truck.truckNumber}` : "Truck";

  return (
    <div>
      <PageHeader title={title} />

      {/* Mobile-only heading */}
      <div className="mb-4 flex items-center gap-2 md:hidden">
        <Truck className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      <TabNav tabs={tabs} className="mb-4 md:mb-6" />
      {children}
    </div>
  );
}
