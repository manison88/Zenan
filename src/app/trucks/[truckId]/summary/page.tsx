"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { type DateRange, getPresetRange, formatCurrency } from "@/lib/date-utils";
import { DollarSign, TrendingUp, TrendingDown, Wrench, Fuel, Shield, ParkingCircle, Radio, CircleDollarSign } from "lucide-react";

interface TruckSummary {
  grossPay: number;
  fuelTotal: number;
  repairsTotal: number;
  insurance: number;
  parking: number;
  eld: number;
  tolls: number;
  fixedTotal: number;
  totalDeductions: number;
  netPay: number;
  months: number;
}

export default function TruckSummaryPage() {
  const params = useParams();
  const truckId = params.truckId as string;
  const [dateRange, setDateRange] = useState<DateRange>(getPresetRange("this-month"));
  const [summary, setSummary] = useState<TruckSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/summary/truck?truckId=${truckId}&startDate=${dateRange.from}&endDate=${dateRange.to}`
    );
    setSummary(await res.json());
    setLoading(false);
  }, [truckId, dateRange]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Financial Summary</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Top cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard icon={<TrendingUp className="h-5 w-5 text-green-600" />} label="Gross Pay" value={summary.grossPay} positive />
            <SummaryCard icon={<TrendingDown className="h-5 w-5 text-red-500" />} label="Total Deductions" value={summary.totalDeductions} />
            <SummaryCard icon={<DollarSign className="h-5 w-5 text-blue-600" />} label="Net Pay" value={summary.netPay} positive={summary.netPay >= 0} highlight />
          </div>

          {/* Deductions breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deductions Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <DeductionRow icon={<Fuel className="h-4 w-4" />} label="Fuel/Gas" amount={summary.fuelTotal} />
                <DeductionRow icon={<Wrench className="h-4 w-4" />} label="Repairs" amount={summary.repairsTotal} />
                <DeductionRow icon={<Shield className="h-4 w-4" />} label={`Insurance (${summary.months} mo)`} amount={summary.insurance} />
                <DeductionRow icon={<ParkingCircle className="h-4 w-4" />} label={`Parking (${summary.months} mo)`} amount={summary.parking} />
                <DeductionRow icon={<Radio className="h-4 w-4" />} label={`ELD (${summary.months} mo)`} amount={summary.eld} />
                <DeductionRow icon={<CircleDollarSign className="h-4 w-4" />} label={`Tolls (${summary.months} mo)`} amount={summary.tolls} />
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">{formatCurrency(summary.totalDeductions)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ icon, label, value, positive, highlight }: { icon: React.ReactNode; label: string; value: number; positive?: boolean; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-2 border-primary/20" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
        <p className={cn("mt-2 text-2xl font-bold", positive ? "text-green-700" : "text-red-600")}>
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function DeductionRow({ icon, label, amount }: { icon: React.ReactNode; label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}<span>{label}</span></div>
      <span className="font-medium">{formatCurrency(amount)}</span>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
