"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataListSkeleton } from "@/components/shared/data-list";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { UpcomingMaintenanceCard } from "@/components/dashboard/upcoming-maintenance";
import { EmptyState } from "@/components/shared/empty-state";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { PageHeader } from "@/components/layout/page-header";
import { useDemo } from "@/lib/demo-context";
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
  Truck,
  Fuel,
  Wrench,
  Shield,
  ParkingCircle,
  Radio,
  CircleDollarSign,
  Download,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TruckSummary {
  truckId: number;
  truckNumber: string;
  grossPay: number;
  fuelTotal: number;
  repairsTotal: number;
  insurance: number;
  parking: number;
  eld: number;
  tolls: number;
  customFixedTotal: number;
  fixedTotal: number;
  totalDeductions: number;
  netPay: number;
}

interface FleetData {
  trucks: TruckSummary[];
  totals: {
    grossPay: number;
    fuelTotal: number;
    repairsTotal: number;
    insurance: number;
    parking: number;
    eld: number;
    tolls: number;
    customFixedTotal: number;
    fixedTotal: number;
    totalDeductions: number;
    netPay: number;
  };
  months: number;
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getPresetRange("this-month"));
  const [data, setData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const { demoVisible } = useDemo();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const demoParam = demoVisible ? "" : "&excludeDemo=1";
    const res = await fetch(
      `/api/summary/fleet?startDate=${dateRange.from}&endDate=${dateRange.to}${demoParam}`
    );
    setData(await res.json());
    setLoading(false);
  }, [dateRange, demoVisible]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function exportCSV() {
    if (!data) return;
    const headers = [
      "Truck #",
      "Gross Pay",
      "Fuel",
      "Repairs",
      "Insurance",
      "Parking",
      "ELD",
      "Tolls",
      "Total Deductions",
      "Net Pay",
    ];
    const rows = data.trucks.map((t) =>
      [
        t.truckNumber,
        t.grossPay,
        t.fuelTotal,
        t.repairsTotal,
        t.insurance,
        t.parking,
        t.eld,
        t.tolls,
        t.totalDeductions,
        t.netPay,
      ].join(",")
    );
    rows.push(
      [
        "TOTAL",
        data.totals.grossPay,
        data.totals.fuelTotal,
        data.totals.repairsTotal,
        data.totals.insurance,
        data.totals.parking,
        data.totals.eld,
        data.totals.tolls,
        data.totals.totalDeductions,
        data.totals.netPay,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-summary-${dateRange.from}-to-${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    if (!data) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Zenan Fleet Summary", 14, 22);
    doc.setFontSize(10);
    doc.text(`Period: ${dateRange.from} to ${dateRange.to}`, 14, 30);

    doc.setFontSize(12);
    doc.text(`Gross Pay: ${formatCurrency(data.totals.grossPay)}`, 14, 42);
    doc.text(`Total Deductions: ${formatCurrency(data.totals.totalDeductions)}`, 14, 50);
    doc.text(`Net Pay: ${formatCurrency(data.totals.netPay)}`, 14, 58);

    autoTable(doc, {
      startY: 68,
      head: [
        [
          "Truck #",
          "Gross",
          "Fuel",
          "Repairs",
          "Insurance",
          "Parking",
          "ELD",
          "Tolls",
          "Deductions",
          "Net Pay",
        ],
      ],
      body: [
        ...data.trucks.map((t) => [
          t.truckNumber,
          formatCurrency(t.grossPay),
          formatCurrency(t.fuelTotal),
          formatCurrency(t.repairsTotal),
          formatCurrency(t.insurance),
          formatCurrency(t.parking),
          formatCurrency(t.eld),
          formatCurrency(t.tolls),
          formatCurrency(t.totalDeductions),
          formatCurrency(t.netPay),
        ]),
        [
          "TOTAL",
          formatCurrency(data.totals.grossPay),
          formatCurrency(data.totals.fuelTotal),
          formatCurrency(data.totals.repairsTotal),
          formatCurrency(data.totals.insurance),
          formatCurrency(data.totals.parking),
          formatCurrency(data.totals.eld),
          formatCurrency(data.totals.tolls),
          formatCurrency(data.totals.totalDeductions),
          formatCurrency(data.totals.netPay),
        ],
      ],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
    });

    doc.save(`fleet-summary-${dateRange.from}-to-${dateRange.to}.pdf`);
  }

  const exportMenu = (
    <OverflowMenu
      label="Export"
      actions={[
        {
          label: "Export CSV",
          icon: <Download className="h-4 w-4" />,
          onClick: exportCSV,
        },
        {
          label: "Export PDF",
          icon: <Download className="h-4 w-4" />,
          onClick: exportPDF,
        },
      ]}
    />
  );

  const desktopExportButtons = (
    <>
      <Button variant="outline" size="sm" onClick={exportCSV}>
        <Download className="h-4 w-4" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF}>
        <Download className="h-4 w-4" /> PDF
      </Button>
    </>
  );

  if (loading) {
    return (
      <div>
        <PageHeader title="Fleet Dashboard" />
        <h1 className="mb-4 text-xl font-bold md:hidden">Fleet Dashboard</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} className="mb-6" />
        <DataListSkeleton rows={3} />
      </div>
    );
  }

  if (!data || data.trucks.length === 0) {
    return (
      <div>
        <PageHeader title="Fleet Dashboard" />
        <h1 className="mb-4 text-xl font-bold md:hidden">Fleet Dashboard</h1>
        <EmptyState
          icon={<Truck className="h-12 w-12" />}
          title="No trucks yet"
          description="Add trucks and log data to see your fleet summary"
          action={
            <Link href="/trucks/new">
              <Button>
                <Truck className="h-4 w-4" /> Add Truck
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const { totals } = data;

  const barData = data.trucks.map((t) => ({
    name: `#${t.truckNumber}`,
    gross: t.grossPay,
    deductions: t.totalDeductions,
    net: t.netPay,
  }));

  const expenseRows = [
    { name: "Fuel", value: totals.fuelTotal, icon: Fuel, color: "text-red-500" },
    { name: "Repairs", value: totals.repairsTotal, icon: Wrench, color: "text-orange-500" },
    { name: "Insurance", value: totals.insurance, icon: Shield, color: "text-blue-500" },
    { name: "Parking", value: totals.parking, icon: ParkingCircle, color: "text-purple-500" },
    { name: "ELD", value: totals.eld, icon: Radio, color: "text-cyan-500" },
    { name: "Tolls", value: totals.tolls, icon: CircleDollarSign, color: "text-green-500" },
    { name: "Other", value: totals.customFixedTotal, icon: DollarSign, color: "text-amber-500" },
  ].filter((d) => d.value > 0);

  const expenseTotal = expenseRows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      <PageHeader title="Fleet Dashboard" actions={desktopExportButtons} />

      {/* Mobile title bar */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <h1 className="text-xl font-bold">Fleet Dashboard</h1>
        {exportMenu}
      </div>

      <DateRangePicker value={dateRange} onChange={setDateRange} className="mb-6" />

      {/* Summary cards */}
      <div className="mb-6 grid gap-3 grid-cols-3">
        <SummaryStat
          icon={<TrendingUp className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />}
          label="Gross"
          value={totals.grossPay}
          tone="positive"
        />
        <SummaryStat
          icon={<TrendingDown className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />}
          label="Deductions"
          value={totals.totalDeductions}
          tone="negative"
        />
        <SummaryStat
          icon={<DollarSign className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />}
          label="Net Pay"
          value={totals.netPay}
          tone={totals.netPay >= 0 ? "positive" : "negative"}
          highlight
        />
      </div>

      {/* Upcoming Maintenance */}
      <div className="mb-6">
        <UpcomingMaintenanceCard />
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revenue by Truck</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  interval={0}
                  angle={barData.length > 5 ? -45 : 0}
                  textAnchor={barData.length > 5 ? "end" : "middle"}
                  height={barData.length > 5 ? 50 : 25}
                />
                <YAxis
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={50}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="gross" name="Gross" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deductions" name="Deductions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseRows.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No expenses in this period
              </div>
            ) : (
              <div className="space-y-3">
                {expenseRows.map((row) => {
                  const pct = expenseTotal > 0 ? (row.value / expenseTotal) * 100 : 0;
                  const Icon = row.icon;
                  return (
                    <div key={row.name}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-4 w-4 shrink-0 ${row.color}`} />
                          <span className="truncate">{row.name}</span>
                        </span>
                        <span className="shrink-0 tabular-nums">
                          {formatCurrency(row.value)}{" "}
                          <span className="text-muted-foreground text-xs">
                            ({pct.toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-truck breakdown: cards on mobile, table on desktop */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Per-Truck Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          {/* Mobile cards */}
          <div className="space-y-2 p-3 md:hidden">
            {data.trucks.map((t) => (
              <Link
                key={t.truckId}
                href={`/trucks/${t.truckId}/summary`}
                className="block rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-semibold text-primary">
                      #{t.truckNumber}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      Gross {formatCurrencyCompact(t.grossPay)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-base font-bold ${
                        t.netPay >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(t.netPay)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>
                    Fuel <span className="text-foreground">{formatCurrencyCompact(t.fuelTotal)}</span>
                  </span>
                  <span>
                    Repairs <span className="text-foreground">{formatCurrencyCompact(t.repairsTotal)}</span>
                  </span>
                  <span>
                    Fixed <span className="text-foreground">{formatCurrencyCompact(t.fixedTotal)}</span>
                  </span>
                </div>
              </Link>
            ))}
            {/* Totals card */}
            <div className="rounded-lg border bg-muted/50 p-3 font-semibold">
              <div className="flex items-center justify-between text-sm">
                <span>TOTAL</span>
                <span
                  className={totals.netPay >= 0 ? "text-green-700" : "text-red-600"}
                >
                  {formatCurrency(totals.netPay)}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground font-normal">
                <span>
                  Gross{" "}
                  <span className="text-green-700 font-medium">
                    {formatCurrencyCompact(totals.grossPay)}
                  </span>
                </span>
                <span>
                  Deductions{" "}
                  <span className="text-red-600 font-medium">
                    {formatCurrencyCompact(totals.totalDeductions)}
                  </span>
                </span>
                <span>
                  Fixed{" "}
                  <span className="text-foreground font-medium">
                    {formatCurrencyCompact(totals.fixedTotal)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Fuel</TableHead>
                  <TableHead className="text-right">Repairs</TableHead>
                  <TableHead className="text-right">Fixed</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.trucks.map((t) => (
                  <TableRow key={t.truckId}>
                    <TableCell>
                      <Link
                        href={`/trucks/${t.truckId}/summary`}
                        className="font-medium text-primary hover:underline"
                      >
                        #{t.truckNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-green-700">
                      {formatCurrency(t.grossPay)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(t.fuelTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(t.repairsTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(t.fixedTotal)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(t.totalDeductions)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        t.netPay >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(t.netPay)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right text-green-700">
                    {formatCurrency(totals.grossPay)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totals.fuelTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totals.repairsTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totals.fixedTotal)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(totals.totalDeductions)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      totals.netPay >= 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(totals.netPay)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SummaryStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "positive" | "negative";
  highlight?: boolean;
}

function SummaryStat({ icon, label, value, tone, highlight }: SummaryStatProps) {
  return (
    <Card className={highlight ? "border-2 border-primary/20" : ""}>
      <CardContent className="px-3 py-3 sm:p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        <p
          className={`mt-1 text-base font-bold sm:text-2xl tabular-nums ${
            tone === "positive" ? "text-green-700" : "text-red-600"
          }`}
        >
          <span className="sm:hidden">{formatCurrencyCompact(value)}</span>
          <span className="hidden sm:inline">{formatCurrency(value)}</span>
        </p>
      </CardContent>
    </Card>
  );
}
