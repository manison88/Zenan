"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemo } from "@/lib/demo-context";
import { type DateRange, getPresetRange, formatCurrency } from "@/lib/date-utils";
import {
  DollarSign, TrendingUp, TrendingDown, Truck, Fuel, Wrench, Shield,
  ParkingCircle, Radio, CircleDollarSign, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
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
    fixedTotal: number;
    totalDeductions: number;
    netPay: number;
  };
  months: number;
}

const PIE_COLORS = ["#ef4444", "#f97316", "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"];

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

  useEffect(() => { fetchData(); }, [fetchData]);

  function exportCSV() {
    if (!data) return;
    const headers = ["Truck #", "Gross Pay", "Fuel", "Repairs", "Insurance", "Parking", "ELD", "Tolls", "Total Deductions", "Net Pay"];
    const rows = data.trucks.map((t) =>
      [t.truckNumber, t.grossPay, t.fuelTotal, t.repairsTotal, t.insurance, t.parking, t.eld, t.tolls, t.totalDeductions, t.netPay].join(",")
    );
    rows.push(
      ["TOTAL", data.totals.grossPay, data.totals.fuelTotal, data.totals.repairsTotal, data.totals.insurance, data.totals.parking, data.totals.eld, data.totals.tolls, data.totals.totalDeductions, data.totals.netPay].join(",")
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

    // Summary totals
    doc.setFontSize(12);
    doc.text(`Gross Pay: ${formatCurrency(data.totals.grossPay)}`, 14, 42);
    doc.text(`Total Deductions: ${formatCurrency(data.totals.totalDeductions)}`, 14, 50);
    doc.text(`Net Pay: ${formatCurrency(data.totals.netPay)}`, 14, 58);

    // Table
    autoTable(doc, {
      startY: 68,
      head: [["Truck #", "Gross", "Fuel", "Repairs", "Insurance", "Parking", "ELD", "Tolls", "Deductions", "Net Pay"]],
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

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Fleet Dashboard</h1>
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      </div>
    );
  }

  if (!data || data.trucks.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Fleet Dashboard</h1>
        <EmptyState
          icon={<Truck className="h-12 w-12" />}
          title="No trucks yet"
          description="Add trucks and log data to see your fleet summary"
          action={<Link href="/trucks/new"><Button><Truck className="h-4 w-4" /> Add Truck</Button></Link>}
        />
      </div>
    );
  }

  const { totals } = data;

  // Prepare chart data
  const barData = data.trucks.map((t) => ({
    name: `#${t.truckNumber}`,
    gross: t.grossPay,
    deductions: t.totalDeductions,
    net: t.netPay,
  }));

  const pieData = [
    { name: "Fuel", value: totals.fuelTotal },
    { name: "Repairs", value: totals.repairsTotal },
    { name: "Insurance", value: totals.insurance },
    { name: "Parking", value: totals.parking },
    { name: "ELD", value: totals.eld },
    { name: "Tolls", value: totals.tolls },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold">Fleet Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <DateRangePicker value={dateRange} onChange={setDateRange} className="mb-6" />

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-5 w-5 text-green-600" /> Gross Pay
            </div>
            <p className="mt-2 text-2xl font-bold text-green-700">{formatCurrency(totals.grossPay)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-5 w-5 text-red-500" /> Total Deductions
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(totals.totalDeductions)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-5 w-5 text-blue-600" /> Net Pay
            </div>
            <p className={`mt-2 text-2xl font-bold ${totals.netPay >= 0 ? "text-green-700" : "text-red-600"}`}>
              {formatCurrency(totals.netPay)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue bar chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Truck</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="gross" name="Gross" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deductions" name="Deductions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense breakdown pie */}
        <Card>
          <CardHeader><CardTitle className="text-base">Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">No expenses in this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={(props: any) => `${props.name ?? ""} ${((props.percent || 0) * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deduction detail */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Deductions Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2"><Fuel className="h-4 w-4 text-red-500" /><span className="text-sm">Fuel:</span><span className="font-medium">{formatCurrency(totals.fuelTotal)}</span></div>
            <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-orange-500" /><span className="text-sm">Repairs:</span><span className="font-medium">{formatCurrency(totals.repairsTotal)}</span></div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500" /><span className="text-sm">Insurance:</span><span className="font-medium">{formatCurrency(totals.insurance)}</span></div>
            <div className="flex items-center gap-2"><ParkingCircle className="h-4 w-4 text-purple-500" /><span className="text-sm">Parking:</span><span className="font-medium">{formatCurrency(totals.parking)}</span></div>
            <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-cyan-500" /><span className="text-sm">ELD:</span><span className="font-medium">{formatCurrency(totals.eld)}</span></div>
            <div className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-green-500" /><span className="text-sm">Tolls:</span><span className="font-medium">{formatCurrency(totals.tolls)}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Per-truck table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Per-Truck Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
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
                    <Link href={`/trucks/${t.truckId}/summary`} className="font-medium text-primary hover:underline">
                      #{t.truckNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-green-700">{formatCurrency(t.grossPay)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(t.fuelTotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(t.repairsTotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(t.fixedTotal)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(t.totalDeductions)}</TableCell>
                  <TableCell className={`text-right font-bold ${t.netPay >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {formatCurrency(t.netPay)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right text-green-700">{formatCurrency(totals.grossPay)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.fuelTotal)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.repairsTotal)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.fixedTotal)}</TableCell>
                <TableCell className="text-right text-red-600">{formatCurrency(totals.totalDeductions)}</TableCell>
                <TableCell className={`text-right ${totals.netPay >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {formatCurrency(totals.netPay)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
