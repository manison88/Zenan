import { redirect } from "next/navigation";

export default async function TruckDetailPage({ params }: { params: Promise<{ truckId: string }> }) {
  const { truckId } = await params;
  redirect(`/trucks/${truckId}/trips`);
}
