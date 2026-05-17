import Link from "next/link";
import {
  Truck,
  Menu,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Fuel,
  Wrench,
  Check,
  ChevronDown,
} from "lucide-react";

// Brand palette (oklch). Kept inline so the deployed dark/gold look survives
// any future tailwind / theme refactor without needing to be re-translated.
const BG = "oklch(0.18 0.01 250)";
const BG_DEEP = "oklch(0.16 0.012 250)";
const BG_CARD = "oklch(0.22 0.012 250)";
const BG_CARD_DEEP = "oklch(0.14 0.01 250)";
const BG_INPUT = "oklch(0.18 0.012 250)";
const TEXT_MUTED = "oklch(0.72 0.01 250)";
const TEXT_DIM = "oklch(0.58 0.01 250)";
const GOLD = "oklch(0.78 0.16 75)";
const GOLD_SOFT = "oklch(0.78 0.16 75 / 0.12)";
const GOLD_BORDER = "oklch(0.78 0.16 75 / 0.35)";
const GOLD_TEXT_ON = "oklch(0.18 0.05 75)";
const RED = "oklch(0.62 0.22 25)";
const BORDER = "oklch(1 0 0 / 0.08)";
const BORDER_STRONG = "oklch(1 0 0 / 0.14)";

const ONBOARD = "/onboarding";

export default function Home() {
  return (
    <div
      style={{ background: BG, color: "oklch(0.96 0.005 250)" }}
      className="min-h-screen text-white"
    >
      <Header />
      <Hero />
      <BeforeAfter />
      <HowItWorks />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header
      style={{ background: "oklch(0.18 0.01 250 / 0.78)", borderBottom: `1px solid ${BORDER}` }}
      className="sticky top-0 z-30 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div
            style={{ background: GOLD_SOFT, color: GOLD }}
            className="flex h-8 w-8 items-center justify-center rounded-md"
          >
            <Truck className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Zenan Fleet</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#product" style={{ color: TEXT_MUTED }} className="text-sm transition-colors hover:text-white">Product</a>
          <a href="#pricing" style={{ color: TEXT_MUTED }} className="text-sm transition-colors hover:text-white">Pricing</a>
          <a href="#faq" style={{ color: TEXT_MUTED }} className="text-sm transition-colors hover:text-white">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            style={{ color: TEXT_MUTED }}
            className="hidden text-sm transition-colors sm:inline-block px-3 py-1.5 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href={ONBOARD}
            style={{ background: GOLD, color: GOLD_TEXT_ON }}
            className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all hover:opacity-90"
          >
            Start free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            style={{ color: TEXT_MUTED }}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
const HERO_TRUCKS = [
  { number: "101", net: "$4,210 net", positive: true },
  { number: "102", net: "−$340 net", positive: false },
  { number: "103", net: "$2,950 net", positive: true },
  { number: "104", net: "$3,820 net", positive: true },
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        style={{ background: `radial-gradient(ellipse at top, ${GOLD_SOFT.replace("/ 0.12", "/ 0.18")}, transparent 60%)` }}
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-4xl opacity-60"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto mb-6 flex justify-center">
          <div
            style={{ border: `1px solid ${GOLD_BORDER}`, background: GOLD_SOFT, color: GOLD }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
          >
            <span
              style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
              className="h-1.5 w-1.5 rounded-full"
            />
            Built for fleets of 3 to 10
          </div>
        </div>

        <h1 className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Know which trucks are <span style={{ color: GOLD }}>making money.</span>
        </h1>

        <p style={{ color: TEXT_MUTED }} className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed sm:text-lg">
          Trip revenue minus fuel, repairs, and fixed costs — split per truck, for fleets of 3 to 10. No spreadsheets, no integrations, no credit card.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={ONBOARD}
            style={{
              background: GOLD,
              color: GOLD_TEXT_ON,
              boxShadow: "0 8px 24px -10px oklch(0.78 0.16 75 / 0.5)",
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-semibold transition-all sm:w-auto hover:opacity-90"
          >
            Start tracking — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            style={{ color: "white", border: `1px solid ${BORDER_STRONG}`, background: "transparent" }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-medium transition-colors sm:w-auto hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>

        <p style={{ color: TEXT_DIM }} className="mt-4 text-center text-xs">
          New here? Click <span style={{ color: "white" }}>Start tracking</span> — first truck free.
        </p>

        {/* Truck profit chips */}
        <div className="mt-12 overflow-hidden">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label="Per-truck net profit examples">
            {HERO_TRUCKS.map((t, i) => (
              <div
                key={t.number}
                style={{
                  border: `1px solid ${BORDER}`,
                  background: BG_CARD,
                  animation: `pulseSoft 3s ease-in-out ${i * 0.4}s infinite`,
                }}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm"
              >
                <span style={{ color: TEXT_DIM }}>Truck {t.number}</span>
                <span
                  style={{ color: t.positive ? "white" : RED }}
                  className="font-mono font-semibold tabular-nums"
                >
                  {t.net}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </div>

      <style>{`
        @keyframes pulseSoft {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.7; }
        }
        @keyframes blink {
          0%, 50%      { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// ── Dashboard preview mockup ────────────────────────────────────────────────
const PREVIEW_ROWS = [
  { num: "101", gross: "$18,420", fuel: "$3,120", repairs: "$980", net: "$4,210", positive: true },
  { num: "102", gross: "$14,110", fuel: "$2,980", repairs: "$4,720", net: "−$340", positive: false },
  { num: "103", gross: "$13,280", fuel: "$2,510", repairs: "$620", net: "$2,950", positive: true },
  { num: "104", gross: "$12,610", fuel: "$2,290", repairs: "$540", net: "$3,820", positive: true },
];
const PREVIEW_BARS = [
  { num: "101", height: 100, positive: true },
  { num: "102", height: 8, positive: false },
  { num: "103", height: 70, positive: true },
  { num: "104", height: 91, positive: true },
];

function DashboardPreview() {
  return (
    <div className="mx-auto mt-12 max-w-5xl">
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: BG_CARD,
          border: `1px solid ${BORDER_STRONG}`,
          boxShadow: "0 30px 80px -30px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.02)",
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div className="mx-auto rounded px-3 py-0.5 font-mono text-[11px]" style={{ background: BG_CARD_DEEP, color: TEXT_DIM }}>
            app.zenanfleet.com/dashboard
          </div>
          <div className="w-12" />
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Fleet Dashboard</h3>
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>May 1 – May 31, 2026</p>
            </div>
            <div className="rounded px-2 py-1 text-[10px] font-mono" style={{ background: "oklch(1 0 0 / 0.05)", color: TEXT_DIM }}>
              This month
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
            <StatTile icon={<TrendingUp className="h-3 w-3" />} label="Gross" value="$58,420" valueColor="white" />
            <StatTile icon={<TrendingDown className="h-3 w-3" />} label="Deductions" value="$32,180" valueColor="white" />
            <StatTile label="Net" value="$26,240" valueColor={GOLD} highlight />
          </div>

          <div className="mb-4 rounded-lg p-4" style={{ background: BG_CARD_DEEP, border: `1px solid ${BORDER}` }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: TEXT_MUTED }}>Net by truck</span>
              <span className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>May 2026</span>
            </div>
            <div className="flex h-24 items-end justify-around gap-2 sm:gap-4">
              {PREVIEW_BARS.map((b) => (
                <div key={b.num} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex w-full justify-center">
                    <div
                      className="w-full max-w-[36px] rounded-t"
                      style={{
                        height: `${b.height}%`,
                        minHeight: "6px",
                        background: b.positive ? GOLD : RED,
                        boxShadow: b.positive
                          ? "0 0 12px oklch(0.78 0.16 75 / 0.35)"
                          : "0 0 8px oklch(0.62 0.22 25 / 0.3)",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>#{b.num}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg" style={{ background: BG_CARD_DEEP, border: `1px solid ${BORDER}` }}>
            <table className="w-full text-[11px] sm:text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: TEXT_DIM }}>Truck</th>
                  <th className="px-3 py-2 text-right font-medium" style={{ color: TEXT_DIM }}>Gross</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell" style={{ color: TEXT_DIM }}>Fuel</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell" style={{ color: TEXT_DIM }}>Repairs</th>
                  <th className="px-3 py-2 text-right font-medium" style={{ color: TEXT_DIM }}>Net</th>
                </tr>
              </thead>
              <tbody>
                {PREVIEW_ROWS.map((r, i) => (
                  <tr key={r.num} style={i < PREVIEW_ROWS.length - 1 ? { borderBottom: `1px solid ${BORDER}` } : undefined}>
                    <td className="px-3 py-2 font-mono text-white">#{r.num}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-white">{r.gross}</td>
                    <td className="hidden px-3 py-2 text-right font-mono tabular-nums sm:table-cell" style={{ color: TEXT_MUTED }}>{r.fuel}</td>
                    <td className="hidden px-3 py-2 text-right font-mono tabular-nums sm:table-cell" style={{ color: TEXT_MUTED }}>{r.repairs}</td>
                    <td
                      className="px-3 py-2 text-right font-mono font-semibold tabular-nums"
                      style={{ color: r.positive ? GOLD : RED }}
                    >
                      {r.net}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  valueColor,
  highlight,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: BG_CARD_DEEP,
        border: highlight ? `1px solid ${GOLD_BORDER}` : `1px solid ${BORDER}`,
      }}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: TEXT_DIM }}>
        {icon}
        {label}
      </div>
      <div className="mt-1 font-mono text-base font-semibold tabular-nums sm:text-lg" style={{ color: valueColor }}>
        {value}
      </div>
    </div>
  );
}

// ── Before / After ──────────────────────────────────────────────────────────
function BeforeAfter() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p style={{ color: GOLD }} className="text-xs font-medium uppercase tracking-[0.18em]">
            The math you&apos;ve been doing in your head
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            You know what you grossed. You don&apos;t really know what you kept.
          </h2>
          <p style={{ color: TEXT_MUTED }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed">
            Same month. Same four trucks. One view tells you what came in. The other tells you what actually stayed.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ExcelMock />
          <ZenanMock />
        </div>
      </div>
    </section>
  );
}

function ExcelMock() {
  const rows = [
    { d: "05/03", g: "2,800", f: "?", r: "" },
    { d: "05/07", g: "3,150", f: "640", r: "" },
    { d: "05/12", g: "1,920", f: "?", r: "1,200?" },
    { d: "05/18", g: "2,400", f: "", r: "" },
    { d: "05/22", g: "3,610", f: "?", r: "" },
    { d: "05/27", g: "2,940", f: "580", r: "" },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span style={{ color: TEXT_DIM }} className="text-xs font-mono uppercase tracking-wider">Before</span>
        <span style={{ background: BORDER }} className="h-px flex-1" />
      </div>
      <div
        className="overflow-hidden rounded-md"
        style={{
          background: "#ffffff",
          border: "1px solid #c7c7c7",
          boxShadow: "0 12px 30px -10px oklch(0 0 0 / 0.4)",
        }}
      >
        <div className="flex items-center gap-3 px-3 py-2 text-[10px]" style={{ background: "#f3f2f1", borderBottom: "1px solid #e1dfdd", color: "#605e5c" }}>
          <div className="flex gap-2 font-medium">
            <span style={{ color: "#107c41" }}>File</span>
            <span>Home</span>
            <span>Insert</span>
            <span>Data</span>
            <span>View</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono" style={{ background: "white", borderBottom: "1px solid #e1dfdd", color: "#605e5c" }}>
          <span className="rounded px-1.5 py-0.5" style={{ background: "#edebe9" }}>B7</span>
          <span>fx</span>
          <span style={{ color: "#a19f9d" }}>=</span>
        </div>
        <div className="text-[11px]" style={{ color: "#323130" }}>
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] border-b" style={{ background: "#f3f2f1", borderColor: "#e1dfdd", color: "#605e5c" }}>
            <div className="px-2 py-1.5 text-center font-medium" />
            <div className="px-2 py-1.5 font-medium">A</div>
            <div className="px-2 py-1.5 font-medium">B</div>
            <div className="px-2 py-1.5 font-medium">C</div>
            <div className="px-2 py-1.5 font-medium">D</div>
          </div>
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] border-b font-semibold" style={{ borderColor: "#e1dfdd", background: "#fafafa" }}>
            <div className="px-2 py-1.5 text-center" style={{ background: "#f3f2f1", color: "#605e5c" }}>1</div>
            <div className="px-2 py-1.5">Date</div>
            <div className="px-2 py-1.5">Gross</div>
            <div className="px-2 py-1.5">Fuel?</div>
            <div className="px-2 py-1.5">Repairs?</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] border-b font-mono" style={{ borderColor: "#e1dfdd" }}>
              <div className="px-2 py-1.5 text-center" style={{ background: "#f3f2f1", color: "#605e5c" }}>{i + 2}</div>
              <div className="px-2 py-1.5">{r.d}</div>
              <div className="px-2 py-1.5">{r.g}</div>
              <div className="px-2 py-1.5" style={{ color: r.f === "?" ? "#a4262c" : "#323130" }}>{r.f}</div>
              <div className="px-2 py-1.5" style={{ color: r.r.includes("?") ? "#a4262c" : "#323130" }}>{r.r}</div>
            </div>
          ))}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr]" style={{ background: "#fff4ce" }}>
            <div className="px-2 py-1.5 text-center" style={{ background: "#f3f2f1", color: "#605e5c" }}>8</div>
            <div className="px-2 py-1.5 font-semibold">Net?</div>
            <div className="px-2 py-1.5" style={{ color: "#a4262c" }}>???</div>
            <div className="px-2 py-1.5" />
            <div className="px-2 py-1.5" />
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 text-[10px]" style={{ background: "#f3f2f1", borderTop: "1px solid #e1dfdd", color: "#605e5c" }}>
            <span className="rounded-t px-2 py-0.5" style={{ background: "white", color: "#107c41", fontWeight: 600 }}>Truck 101</span>
            <span>Truck 102</span>
            <span>Truck 103</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZenanMock() {
  const rows = [
    { d: "May 3", g: "$2,800", f: "$640", r: "—", net: "$2,160" },
    { d: "May 7", g: "$3,150", f: "$720", r: "—", net: "$2,430" },
    { d: "May 12", g: "$1,920", f: "$510", r: "$1,200", net: "$210" },
    { d: "May 18", g: "$2,400", f: "$560", r: "—", net: "$1,840" },
    { d: "May 22", g: "$3,610", f: "$690", r: "—", net: "$2,920" },
    { d: "May 27", g: "$2,940", f: "$580", r: "—", net: "$2,360" },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span style={{ color: GOLD }} className="text-xs font-mono uppercase tracking-wider">After</span>
        <span style={{ background: GOLD_BORDER }} className="h-px flex-1" />
      </div>
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: BG_CARD,
          border: `1px solid ${BORDER_STRONG}`,
          boxShadow: "0 20px 50px -20px oklch(0 0 0 / 0.5)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded" style={{ background: GOLD_SOFT, color: GOLD }}>
              <Truck className="h-3.5 w-3.5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs font-semibold">Truck 101</div>
              <div className="text-[10px]" style={{ color: TEXT_DIM }}>May 2026</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: TEXT_DIM }}>Net</div>
            <div className="font-mono text-base font-bold tabular-nums" style={{ color: GOLD }}>$11,920</div>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_DIM }}>Date</th>
              <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_DIM }}>Gross</th>
              <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_DIM }}>Fuel</th>
              <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_DIM }}>Repairs</th>
              <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_DIM }}>Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={i < rows.length - 1 ? { borderBottom: `1px solid ${BORDER}` } : undefined}>
                <td className="px-4 py-2" style={{ color: TEXT_MUTED }}>{r.d}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">{r.g}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums" style={{ color: TEXT_MUTED }}>{r.f}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums" style={{ color: TEXT_MUTED }}>{r.r}</td>
                <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums" style={{ color: "white" }}>{r.net}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── How it works ────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="product" style={{ background: BG_DEEP }} className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p style={{ color: GOLD }} className="text-xs font-medium uppercase tracking-[0.18em]">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Three things in. Real numbers out.
          </h2>
          <p style={{ color: TEXT_MUTED }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed">
            Add your trucks, log what comes in and what goes out, and watch the per-truck net land where it should.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <StepCard number="01" title="Add your trucks" body="Just the truck number. Make, model, VIN can wait.">
            <StepAddTruck />
          </StepCard>
          <StepCard number="02" title="Log trips, fuel, repairs" body="Three fields. Costs are optional. Takes 20 seconds.">
            <StepLog />
          </StepCard>
          <StepCard number="03" title="See net profit per truck" body="Reconciled nightly. Sortable. Negative trucks flagged.">
            <StepNet />
          </StepCard>
        </div>
      </div>
    </section>
  );
}

function StepCard({ number, title, body, children }: { number: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-xl p-5" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
      <div className="mb-4 flex items-center gap-2">
        <span
          className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums"
          style={{ background: GOLD_SOFT, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
        >
          {number}
        </span>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <p className="mb-5 text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{body}</p>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

function StepAddTruck() {
  return (
    <div className="rounded-lg p-3" style={{ background: BG_CARD_DEEP, border: `1px solid ${BORDER}` }}>
      <label style={{ color: TEXT_DIM }} className="mb-1.5 block text-[10px] uppercase tracking-wider">Truck number</label>
      <div className="flex items-center justify-between rounded-md px-3 py-2" style={{ background: BG_INPUT, border: `1px solid ${BORDER_STRONG}` }}>
        <span className="font-mono text-sm">101</span>
        <span style={{ background: GOLD, animation: "blink 1s steps(1) infinite" }} className="h-4 w-px" />
      </div>
      <button
        type="button"
        style={{ background: GOLD, color: GOLD_TEXT_ON }}
        className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold"
      >
        Add truck
      </button>
    </div>
  );
}

function StepLog() {
  return (
    <div className="space-y-2 rounded-lg p-3" style={{ background: BG_CARD_DEEP, border: `1px solid ${BORDER}` }}>
      <LogRow label="Gross pay" value="$2,800" />
      <LogRow icon={<Fuel className="h-3 w-3" />} label="Fuel" value="$640" />
      <LogRow icon={<Wrench className="h-3 w-3" />} label="Repairs" value="—" valueIsDim />
    </div>
  );
}

function LogRow({ icon, label, value, valueIsDim }: { icon?: React.ReactNode; label: string; value: string; valueIsDim?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2 text-xs" style={{ background: BG_INPUT, border: `1px solid ${BORDER}` }}>
      <span className="flex items-center gap-1.5" style={{ color: TEXT_DIM }}>
        {icon}
        {label}
      </span>
      <span className={"font-mono " + (valueIsDim ? "" : "font-semibold")} style={valueIsDim ? { color: TEXT_DIM } : undefined}>
        {value}
      </span>
    </div>
  );
}

function StepNet() {
  return (
    <div className="rounded-lg p-3" style={{ background: BG_CARD_DEEP, border: `1px solid ${BORDER}` }}>
      <div className="rounded-lg p-3" style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" style={{ color: GOLD }} />
            <span className="text-xs font-medium">Truck 101</span>
          </div>
          <span className="font-mono text-base font-bold tabular-nums" style={{ color: GOLD }}>$1,420 net</span>
        </div>
        <div className="mt-1.5 text-[10px]" style={{ color: TEXT_MUTED }}>From 1 trip · 1 fuel entry</div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        <MicroStat label="Gross" value="$2,800" />
        <MicroStat label="Fuel" value="$640" />
        <MicroStat label="Other" value="$740" />
      </div>
    </div>
  );
}

function MicroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded px-2 py-1 text-[10px]" style={{ background: BG_INPUT }}>
      <div style={{ color: TEXT_DIM }}>{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  );
}

// ── Pricing ─────────────────────────────────────────────────────────────────
function Pricing() {
  const features = [
    "Unlimited trips, fuel, and repair logs",
    "Per-truck net profit dashboard",
    "Maintenance scheduling + upcoming alerts",
    "CSV and PDF exports",
    "Cancel anytime — your data exports cleanly",
  ];
  return (
    <section id="pricing" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p style={{ color: GOLD }} className="text-xs font-medium uppercase tracking-[0.18em]">Pricing</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            One price. Per truck. Cancel any time.
          </h2>
          <p style={{ color: TEXT_MUTED }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed">
            We don&apos;t sell add-ons, drivers, or seats. If you&apos;re under 10 trucks, this is the price.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <div
            style={{
              background: BG_CARD,
              border: `1px solid ${BORDER_STRONG}`,
              boxShadow: "0 24px 60px -30px oklch(0.78 0.16 75 / 0.25)",
            }}
            className="rounded-2xl p-8"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-semibold tracking-tight">$19</span>
              <span style={{ color: TEXT_MUTED }} className="text-sm">/ truck / month</span>
            </div>
            <div
              style={{ background: GOLD_SOFT, color: GOLD }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              First truck free · No card to start
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <span style={{ color: "white" }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={ONBOARD}
              style={{
                background: GOLD,
                color: GOLD_TEXT_ON,
                boxShadow: "0 8px 24px -10px oklch(0.78 0.16 75 / 0.5)",
              }}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-semibold transition-all hover:opacity-90"
            >
              Start tracking — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p style={{ color: TEXT_DIM }} className="mt-4 text-center text-xs">
              Billing kicks in only after you add a second truck.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Does this connect to my ELD, fuel card, or factoring company?",
    a: "Not yet — Zenan is manual entry by design, the same way your spreadsheet is. We're working on imports for the common fuel cards (Comdata, EFS, Wex). If that's a deal-breaker, email us and we'll prioritize it.",
  },
  {
    q: "Can my dispatcher or bookkeeper use it too?",
    a: "Today, one account per operation — your dispatcher signs in with the same email and PIN. Multi-user accounts with separate logins are on the roadmap.",
  },
  {
    q: "What happens to my data?",
    a: "Your data lives on Cloudflare's global network in a database only your account can access. CSV and PDF export are built in. Delete your account and your data goes with it — no copies, no archive.",
  },
  {
    q: "Is this a TMS?",
    a: "No. Zenan is operational P&L tracking — what came in, what went out, and what each truck actually netted. If you need dispatch, load tendering, billing, IFTA filing, or driver management, you need a real TMS. Use one alongside Zenan.",
  },
  {
    q: "What if I cancel?",
    a: "Export your data first (CSV or PDF, one click from the dashboard), then cancel from your account settings. No retention period, no win-back emails — we keep nothing once you're out.",
  },
];

function Faq() {
  return (
    <section id="faq" style={{ background: BG_DEEP }} className="relative scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p style={{ color: GOLD }} className="text-xs font-medium uppercase tracking-[0.18em]">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            The questions operators actually ask.
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
              className="group rounded-xl"
            >
              <summary
                style={{ color: "white" }}
                className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium [&::-webkit-details-marker]:hidden"
              >
                <span>{f.q}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                  style={{ color: TEXT_MUTED }}
                />
              </summary>
              <div style={{ color: TEXT_MUTED }} className="px-5 pb-5 pt-1 text-sm leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
        <p style={{ color: TEXT_MUTED }} className="mt-10 text-center text-sm">
          Other question?{" "}
          <a href="mailto:hello@zenan-fleet.com" style={{ color: "white" }} className="underline-offset-4 hover:underline">
            Email us.
          </a>
        </p>
      </div>
    </section>
  );
}

// ── Final CTA ───────────────────────────────────────────────────────────────
function FinalCta() {
  return (
    <section>
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start tracking the trucks you already own.
        </h2>
        <p style={{ color: TEXT_MUTED }} className="mx-auto mt-4 max-w-xl text-base">
          Create an account in 30 seconds. Add your first truck in 60. See your first net-profit number tonight.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={ONBOARD}
            style={{
              background: GOLD,
              color: GOLD_TEXT_ON,
              boxShadow: "0 8px 24px -10px oklch(0.78 0.16 75 / 0.5)",
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-semibold transition-all sm:w-auto hover:opacity-90"
          >
            Start tracking — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            style={{ color: "white", border: `1px solid ${BORDER_STRONG}`, background: "transparent" }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-medium transition-colors sm:w-auto hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${BORDER}` }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div style={{ background: GOLD_SOFT, color: GOLD }} className="flex h-7 w-7 items-center justify-center rounded-md">
            <Truck className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <span style={{ color: TEXT_MUTED }} className="text-sm">© 2026 Zenan Fleet</span>
        </div>
        <div className="flex gap-6 text-sm">
          <a href="#privacy" style={{ color: TEXT_MUTED }} className="transition-colors hover:text-white">Privacy</a>
          <a href="#terms" style={{ color: TEXT_MUTED }} className="transition-colors hover:text-white">Terms</a>
          <a href="#contact" style={{ color: TEXT_MUTED }} className="transition-colors hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
