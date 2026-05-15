import Link from "next/link";
import {
  Truck,
  LayoutDashboard,
  Fuel,
  Wrench,
  Receipt,
  Route,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TryDemoButton } from "@/components/landing/try-demo-button";
import { cn } from "@/lib/utils";

const features = [
  {
    Icon: LayoutDashboard,
    title: "One dashboard, every truck",
    description:
      "See revenue, miles, fuel spend, and net per truck. Filter by week, month, or any custom range.",
  },
  {
    Icon: Route,
    title: "Trip-level revenue",
    description:
      "Log each haul with origin, destination, miles, and pay. Spot which lanes actually make money.",
  },
  {
    Icon: Fuel,
    title: "Fuel logs that add up",
    description:
      "Capture gallons, price, and odometer at the pump. MPG and cost-per-mile fall out automatically.",
  },
  {
    Icon: Wrench,
    title: "Repair history that stays put",
    description:
      "Track what broke, who fixed it, what it cost. No more lost receipts when warranty questions come up.",
  },
  {
    Icon: Receipt,
    title: "Fixed costs that hide nothing",
    description:
      "Insurance, parking, ELD, permits. Allocate the steady bleed across the trucks that incur it.",
  },
  {
    Icon: Gauge,
    title: "Real cost per mile",
    description:
      "Every entry feeds a true CPM — variable plus fixed — so quoting a load isn't a guess.",
  },
];

const steps = [
  {
    title: "Set up your fleet",
    description:
      "Name your operation, pick a PIN, and add your first truck. Takes under a minute.",
  },
  {
    title: "Log as you go",
    description:
      "Drop in trips, fuel stops, and repairs from anywhere. The math runs in the background.",
  },
  {
    title: "Know your numbers",
    description:
      "Open the dashboard for a real-time read on revenue, expenses, and where the margin actually is.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Zenan Fleet</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <Badge variant="secondary" className="mx-auto">
            For owner-operators & small fleets
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Run your trucking operation from one screen.
          </h1>
          <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
            Zenan keeps trips, fuel, repairs, and fixed costs in one place — so
            your real cost per mile is never more than a glance away.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <Link
              href="/onboarding"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <TryDemoButton />
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            No credit card. Your data stays on your fleet.
          </p>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to keep the wheels turning
            </h2>
            <p className="mt-3 text-muted-foreground">
              Purpose-built for the work — not a generic spreadsheet trying to
              moonlight.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardContent className="space-y-3 pt-6">
                  <f.Icon className="h-7 w-7 text-primary" />
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to a clearer picture
            </h2>
          </div>
          <ol className="mx-auto grid max-w-4xl gap-10 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-base font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to dig in?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Set up your fleet in under a minute, or kick the tires with a fully
            populated demo first.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Set up my fleet
              <ArrowRight className="h-4 w-4" />
            </Link>
            <TryDemoButton label="Tour the demo" />
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Zenan Fleet</span>
          </div>
          <div>© {new Date().getFullYear()} Zenan Fleet. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
