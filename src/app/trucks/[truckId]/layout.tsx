"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TabPillBar } from "@/components/shared/tab-pill-bar";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/shared/page-container";

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
    { label: "Miles", href: `/trucks/${truckId}/odometer` },
    { label: "Fuel", href: `/trucks/${truckId}/fuel` },
    { label: "Repairs", href: `/trucks/${truckId}/repairs` },
    { label: "Costs", href: `/trucks/${truckId}/fixed-costs` },
    { label: "Summary", href: `/trucks/${truckId}/summary` },
  ];

  const title = truck ? `Truck #${truck.truckNumber}` : "Truck";

  return (
    <PageContainer>
      <PageHeader title={title} />
      <TabPillBar tabs={tabs} className="mb-4 md:mb-6" />
      {children}
    </PageContainer>
  );
}
