"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { DataListSkeleton } from "@/components/shared/data-list";
import {
  type DateRange,
  getPresetRange,
  formatCurrency,
  formatCurrencyCompact,
} from "@/lib/date-utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wrench,
  Fuel,
  Shield,
  ParkingCircle,
  Radio,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TruckSummary {
  grossPay: number;
  fuelTotal: number;
  repairsTotal: number;
  insurance: number;
  parking: number;
  eld: number;
  tolls: number;
  customFixedTotal: number;
  customCosts: { name: string; total: number }[];
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

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-3 text-lg font-semibold">Financial Summary</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl border bg-card animate-pulse" />
            ))}
          </div>
          <DataListSkeleton rows={4} />
        </div>
      ) : summary ? (
        <div className="space-y-4">
          {/* Mobile: compact 3-up tiles */}
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            <CompactStat
              icon={<TrendingUp className="h-3 w-3" />}
              label="Gross"
              value={formatCurrencyCompact(summary.grossPay)}
              tone="positive"
            />
            <CompactStat
              icon={<TrendingDown className="h-3 w-3" />}
              label="Deductions"
              value={formatCurrencyCompact(summary.totalDeductions)}
              tone="negative"
            />
            <CompactStat
              icon={<DollarSign className="h-3 w-3" />}
              label="Net Pay"
              value={formatCurrencyCompact(summary.netPay)}
              tone={summary.netPay >= 0 ? "positive" : "negative"}
              highlight
            />
          </div>
          {/* Desktop: 3-up cards */}
          <div className="hidden gap-3 sm:grid sm:grid-cols-3">
            <SummaryCard
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
              label="Gross"
              value={summary.grossPay}
              positive
            />
            <SummaryCard
              icon={<TrendingDown className="h-5 w-5 text-red-500" />}
              label="Deductions"
              value={summary.totalDeductions}
            />
            <SummaryCard
              icon={<DollarSign className="h-5 w-5 text-blue-600" />}
              label="Net Pay"
              value={summary.netPay}
              positive={summary.netPay >= 0}
              highlight
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Deductions Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <DeductionRow icon={<Fuel className="h-4 w-4 text-red-500" />} label="Fuel/Gas" amount={summary.fuelTotal} />
                <DeductionRow icon={<Wrench className="h-4 w-4 text-orange-500" />} label="Repairs" amount={summary.repairsTotal} />
                <DeductionRow icon={<Shield className="h-4 w-4 text-blue-500" />} label={`Insurance (${summary.months} mo)`} amount={summary.insurance} />
                <DeductionRow icon={<ParkingCircle className="h-4 w-4 text-purple-500" />} label={`Parking (${summary.months} mo)`} amount={summary.parking} />
                <DeductionRow icon={<Radio className="h-4 w-4 text-cyan-500" />} label={`ELD (${summary.months} mo)`} amount={summary.eld} />
                <DeductionRow icon={<CircleDollarSign className="h-4 w-4 text-green-500" />} label={`Tolls (${summary.months} mo)`} amount={summary.tolls} />
                {summary.customCosts?.map((cc) => (
                  <DeductionRow
                    key={cc.name}
                    icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                    label={`${cc.name} (${summary.months} mo)`}
                    amount={cc.total}
                  />
                ))}
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600 tabular-nums">
                    {formatCurrency(summary.totalDeductions)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  positive,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  positive?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-2 border-primary/20" : ""}>
      <CardContent className="px-3 py-3 sm:p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        <p
          className={cn(
            "mt-1 text-base font-bold sm:text-2xl tabular-nums",
            positive ? "text-green-700" : "text-red-600"
          )}
        >
          <span className="sm:hidden">{formatCurrencyCompact(value)}</span>
          <span className="hidden sm:inline">{formatCurrency(value)}</span>
        </p>
      </CardContent>
    </Card>
  );
}

function CompactStat({
  icon,
  label,
  value,
  tone,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "positive" | "negative";
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border bg-card p-2.5 shadow-sm",
        highlight && "ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={cn(
          "mt-0.5 font-mono text-sm font-bold tabular-nums",
          tone === "positive" ? "text-green-700" : "text-red-600"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function DeductionRow({
  icon,
  label,
  amount,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="font-medium tabular-nums shrink-0">{formatCurrency(amount)}</span>
    </div>
  );
}
