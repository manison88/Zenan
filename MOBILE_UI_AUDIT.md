# Zenan Fleet — Mobile UI Audit & Dev Plan

Audit of every page/component in `src/` from a mobile-first perspective. The
app is currently **desktop-first**: layouts assume ≥ 768 px, wide data tables
horizontally scroll on phones, dialog forms are locked to 2 columns, and core
touch targets are below platform minimums. Below are the specific problem
areas, mobile-friendly replacements, and a phased implementation plan.

---

## 1. Findings by area

### 1.1 App shell & navigation
**Files:** `src/app/layout.tsx`, `src/components/layout/sidebar.tsx`,
`src/components/layout/app-shell.tsx`

| # | Issue | Where |
|---|---|---|
| 1.1.1 | Page padding `p-6` (24 px) on all screens — eats ~13 % of a 360 px phone width. | `layout.tsx:38` |
| 1.1.2 | Hamburger is a free-floating fixed button at `top-4 left-4` that **overlaps the page H1** (e.g. "Fleet Dashboard", "Truck #101") because pages don't reserve space for it. | `sidebar.tsx:60-65` |
| 1.1.3 | No top app-bar on mobile — no persistent title, no back navigation, no place to put page-level actions. Users lose context after scrolling. | — |
| 1.1.4 | No bottom tab-bar / primary nav — common mobile pattern is missing. Users have to open the drawer for every navigation. | — |
| 1.1.5 | Drawer overlay closes only on backdrop click; no swipe-to-close. | `sidebar.tsx:68-72` |
| 1.1.6 | Sidebar fixed width `w-64` (256 px) → ~70 % of a small phone. Fine, but no safe-area inset handling for notched devices. | `sidebar.tsx:76-79` |
| 1.1.7 | Global font override `body { font-family: Arial }` defeats the Geist Sans variable loaded by `layout.tsx`. | `globals.css:131-134` |
| 1.1.8 | No `<meta name="viewport">` customisation (default works, but no `viewport-fit=cover` for safe-areas). | `layout.tsx` |

### 1.2 Data tables (the headline problem)
Every list view drops a wide `<Table>` inside `overflow-auto`, forcing
**horizontal scroll** on every phone.

| File | Columns | Min usable width |
|---|---|---|
| `src/app/dashboard/page.tsx` — Per-Truck Breakdown | 7 (Truck, Gross, Fuel, Repairs, Fixed, Deductions, Net) | ~720 px |
| `src/app/trucks/[truckId]/trips/page.tsx` | 7 (Date, From, To, Trailer, Bill #, Amount, actions) | ~780 px |
| `src/app/trucks/[truckId]/fuel/page.tsx` | 6 (Date, Location, Gallons, Amount, $/Gal, actions) | ~620 px |
| `src/app/trucks/[truckId]/repairs/page.tsx` | 5 (Date, Type, Amount, Notes 200 px, actions) | ~560 px |
| `src/app/trucks/[truckId]/odometer/page.tsx` | 5 (Week, Start, End, Driven, actions) | ~520 px |
| `src/app/trucks/[truckId]/fixed-costs/page.tsx` — custom costs | 3 | ~360 px (OK) |

All of these break the user's request: "too many tables which need
horizontal scrolling". Additional row-level problems:

- 1.2.1 Edit/delete are 14 px icons in `p-1` wrappers → ~22 px tap target,
  below the 44 px (iOS) / 48 px (Material) minimum.
- 1.2.2 Edit and delete sit side-by-side with 4 px gap — mis-taps are
  almost guaranteed; delete is destructive.
- 1.2.3 Repair "Notes" column uses `max-w-[200px] truncate` — content is
  invisible on phone width.
- 1.2.4 No row-level disclosure / "view detail" → users can't see the
  truncated values without editing.

### 1.3 Dashboard (`src/app/dashboard/page.tsx`)
- 1.3.1 Three summary cards are `grid sm:grid-cols-3` (stack OK on mobile)
  but currency in `text-2xl font-bold` — a fleet at `$1,234,567.89`
  overflows narrow phones.
- 1.3.2 Bar chart x-axis labels (`#101`, `#102`, …) overlap once you have
  > 5 trucks at 360 px width. `fontSize={12}` on `XAxis` is not auto-rotated.
- 1.3.3 Pie chart uses inline `label={(props) => name + percent%}` — labels
  collide and clip outside the SVG on small screens. No legend.
- 1.3.4 Deductions Summary uses `sm:grid-cols-3` of 7 chips — on mobile
  this becomes 7 vertical rows of single-line text and wastes a viewport.
- 1.3.5 The 7-column "Per-Truck Breakdown" table is the worst mobile
  offender — see §1.2.
- 1.3.6 CSV/PDF buttons sit beside the H1 in `flex` on `sm:` and above,
  fine; below `sm:` they stack but stay full-width inside a small button.

### 1.4 Truck detail tabs (`src/app/trucks/[truckId]/layout.tsx`)
- 1.4.1 Six tabs (Trips, Odometer, Fuel, Repairs, Fixed Costs, Summary)
  in a `space-x-6 overflow-x-auto` row → horizontal scroll, no fade
  affordance, no active-tab auto-scroll-into-view.
- 1.4.2 Tabs don't show counts/badges — users can't see "0 trips" before
  navigating.

### 1.5 Dialog forms
**Files:** `src/components/ui/dialog.tsx` and every page that uses it.

- 1.5.1 `Dialog` content has **no `max-h` / inner scroll** — long forms
  (Trip add has 8 fields) push past the viewport on a phone and the
  bottom action buttons disappear off-screen.
- 1.5.2 Forms hard-code `grid grid-cols-2 gap-4` (no `sm:` breakpoint),
  so Date | Amount, From City | From State etc. stay 2-up at 360 px and
  inputs become uncomfortably narrow. Files:
  - `trips/page.tsx:189-244` (4 × grid-cols-2 blocks)
  - `fuel/page.tsx:141-167` (2 × grid-cols-2)
  - `repairs/page.tsx:177-194` (1 × grid-cols-2)
  - `odometer/page.tsx:158-167` (1 × grid-cols-2)
  - `fixed-costs/page.tsx` custom-cost row `flex gap-2 items-end` — name
    input + 128 px amount + 2 buttons all in one row, wraps awkwardly.
- 1.5.3 `DialogContent` is `max-w-lg` (512 px) — on 360 px viewport with
  `p-4` outer padding it works, but `trips` dialog uses `max-w-2xl` which
  is fine on mobile (clamps to viewport) but means desktop and mobile
  share the same layout density.
- 1.5.4 No native sheet / bottom-sheet pattern — every form is a centred
  modal, which on mobile is awkward to dismiss and far from the thumb.

### 1.6 Touch targets & inputs
- 1.6.1 `Button` default size `h-9` (36 px) and `sm` size `h-8` (32 px) —
  both below the 44 px minimum. Every "Add Trip / Add Fuel / Add Repair"
  uses `size="sm"`.
- 1.6.2 `Input` height `h-9` — same issue, and `text-sm` (14 px) **causes
  iOS Safari to auto-zoom on focus** (it zooms whenever the input font is
  < 16 px). This is one of the most user-visible mobile bugs.
- 1.6.3 `Select` same as Input.
- 1.6.4 Numeric fields (`type="number"`) don't set `inputMode="decimal"`
  or `"numeric"` — iOS shows the default text keyboard with a tiny number
  row instead of the numeric pad. Affects: Trips amount, Fuel gallons /
  amount, Repair amount, Odometer readings, Fixed costs values.
- 1.6.5 Edit / delete icon buttons in table rows: ~22 px tap target.
- 1.6.6 Sidebar demo-toggle switch and Change-PIN button are
  `py-2.5` ≈ 40 px — borderline.

### 1.7 PIN screen (`src/components/layout/pin-screen.tsx`)
- 1.7.1 OK overall — uses `max-w-sm` and `inputMode="numeric"`. ✅
- 1.7.2 Input text is `text-lg` (18 px) so iOS won't zoom. ✅
- 1.7.3 Could add a numeric keypad UI for true mobile feel (optional).

### 1.8 Date-range picker (`src/components/dashboard/date-range-picker.tsx`)
- 1.8.1 Seven preset buttons in `flex flex-wrap` → wrap to 3-4 rows on
  phones; fine, but no visual grouping. Consider a `<Select>` dropdown
  on small screens.
- 1.8.2 Custom range row `flex items-end gap-3` — two date inputs side by
  side. OK but the inputs are `h-8 text-sm` → both small + iOS zoom.

### 1.9 Trucks list (`src/app/trucks/page.tsx`)
- 1.9.1 The whole card is a `<Link>` and the delete button is nested
  inside with `stopPropagation`. Touch behaviour is "nav unless you hit
  the small trash icon" — easy to misfire on a moving truck.
- 1.9.2 Header "Add Truck" button uses default size — fine, but no FAB
  pattern for primary action on long lists.
- 1.9.3 Truck cards show only the number — no live status (last trip,
  current revenue) which is what a fleet owner actually wants at a glance.

### 1.10 Misc
- 1.10.1 `confirm("Delete this …?")` everywhere — works on mobile but
  ugly and inconsistent with the rest of the UI.
- 1.10.2 Loading states use a centred spinner with no skeleton — on a
  flaky mobile connection there's no perception of structure.
- 1.10.3 No pull-to-refresh.
- 1.10.4 No empty-state CTA optimisation for narrow viewports (works but
  large icons take a lot of vertical space).

---

## 2. What "mobile friendly" looks like

### 2.1 Shell
- **Top app-bar**: sticky 56 px header with hamburger (left), current page
  title (centre/left), primary action (right). Replaces the floating
  hamburger and the in-page H1 collision.
- **Bottom tab-bar** (≤ md): Dashboard · Trucks · (active truck section).
  Sidebar becomes the secondary drawer (settings, demo toggle, PIN).
- **Container**: `px-4` mobile, `px-6` desktop; honour
  `env(safe-area-inset-*)` on iOS notch / home-indicator.
- **Drawer**: swipe-to-close, sized `min(85vw, 320px)`.

### 2.2 Tables → responsive cards
On `< md` every table renders as a **stack of cards**, one per row, using
the same data. Pattern:

```
┌──────────────────────────────┐
│  Mar 14   ·   $1,250.00      │  ← primary line: date + amount
│  Dallas, TX → Memphis, TN    │  ← secondary line
│  Trailer 4421 · Bill #88231  │  ← tertiary (muted)
│                              [⋮]│  ← single overflow menu (Edit / Delete)
└──────────────────────────────┘
```

Same component on `≥ md` switches to the existing `<Table>` (already
written). No horizontal scroll, no truncation, and the overflow menu
replaces the dual icon buttons (one 44 px target instead of two 22 px).

For the **Dashboard Per-Truck Breakdown** the card shows:
`#101  ·  Net $4,210` as the headline; tap to expand Gross / Fuel /
Repairs / Fixed inline (or link to truck summary).

### 2.3 Dialogs → bottom sheets
On `< md`, dialogs slide up from the bottom with a drag-handle, fill the
width, and use a single column. The `DialogContent` already supports
custom classNames — only the wrapper needs a sheet variant. The form
fields become `grid grid-cols-1 sm:grid-cols-2` and the dialog gets
`max-h-[90vh] overflow-y-auto` with sticky footer for the buttons.

### 2.4 Inputs
- Input / Select / Button minimum height **44 px** on mobile (`h-11`),
  `h-9` on `md`.
- Input font-size **16 px** on mobile to suppress iOS zoom (`text-base`,
  with `md:text-sm`).
- Add `inputMode` per field: `"decimal"` for currency / gallons,
  `"numeric"` for odometer / PIN, `"tel"` for phone-style entry.
- Replace dual edit/delete with a single overflow menu (3-dot button)
  that opens a sheet with destructive action separated.

### 2.5 Charts
- Bar chart: vertical bars **rotated 45°** on narrow viewports, or
  switch to horizontal bars (height ∝ truck count) when `< sm`.
- Pie chart: dropped on mobile, replaced with a compact ranked list
  ("Fuel 42 % · $12,304" rows with bar fills). Less canvas, more legible.
- Currency: use a compact formatter on mobile (`$1.2M`, `$47k`) for
  summary cards, full number on tap.

### 2.6 Tabs
- Six-tab strip becomes a **`<Select>`** (or segmented dropdown) on
  `< sm` — single tap reveals all sections without scroll. Keep tab strip
  for tablet / desktop.

### 2.7 Dashboard layout (mobile)
1. Sticky header with date-range chip (opens a sheet with the picker).
2. Three summary cards stacked, compact currency.
3. "Revenue by truck" chart (horizontal bars).
4. "Expense breakdown" ranked list.
5. Per-truck card list — tap row → truck summary.
6. CSV/PDF moved into an overflow menu in the app-bar (frees primary
   real-estate).

### 2.8 Confirmations
Native `confirm()` → in-app confirmation sheet using the existing Dialog
primitive (destructive action red, secondary "Cancel" stacked on
mobile).

---

## 3. Dev plan

Phases are ordered so each one ships independently and improves mobile
without breaking desktop.

### Phase 0 — Foundations (½ day)
**Goal:** kill the cheap, high-impact bugs in one PR.
1. `globals.css`: remove the `Arial` override, add `viewport-fit=cover`
   in `layout.tsx` metadata, add `pb-[env(safe-area-inset-bottom)]` to
   the shell.
2. `layout.tsx`: change container padding to `p-4 sm:p-6`.
3. `Input` / `Select`: `h-11 md:h-9`, `text-base md:text-sm`.
4. `Button`: bump `default` to `h-11 md:h-9`, `sm` to `h-9 md:h-8`.
5. Add `inputMode="decimal"` to every currency / gallons field; `"numeric"`
   to odometer & PIN. Grep: `type="number"` in `src/app/**`.
6. `Sidebar`: move hamburger into a new `<TopBar>` instead of a fixed
   overlay button, so it stops colliding with H1s. Reserve `pt-14` on
   mobile pages.

**Files touched:** `globals.css`, `app/layout.tsx`, `ui/input.tsx`,
`ui/select.tsx`, `ui/button.tsx`, `layout/sidebar.tsx`, six page files
for `inputMode`.

### Phase 1 — Shell & navigation (1 day)
1. New `src/components/layout/top-bar.tsx`: sticky 56 px bar with
   hamburger, dynamic title (read from a context or pass via a
   `<PageHeader>` slot), and an optional right-side action slot.
2. New `src/components/layout/bottom-nav.tsx`: visible `< md`, with
   Dashboard / Trucks, and contextual "Truck" entry when inside
   `/trucks/[id]/*`.
3. Refactor pages: replace inline `<h1>` with `<PageHeader title="…"
   actions={…}>`; the title appears in the top bar on mobile, as a normal
   page heading on desktop.
4. Sidebar becomes drawer-only on mobile; on desktop unchanged.

**Files touched:** new `top-bar.tsx`, new `bottom-nav.tsx`, new
`page-header.tsx`, `layout.tsx`, `sidebar.tsx`, every page (small
swap — H1 → `<PageHeader>`).

### Phase 2 — Responsive data list primitive (1.5 days)
This is the biggest single win and removes all horizontal scrolling.
1. Build `src/components/shared/data-list.tsx` exporting:
   - `DataList` — wrapper that picks card mode or table mode based on
     viewport (`useMediaQuery` or CSS-only via `md:hidden` / `hidden md:block`).
   - `DataListCard` — mobile card slot with `primary`, `secondary`,
     `meta`, `actions` props.
2. Build `src/components/ui/overflow-menu.tsx` — a 44 × 44 px button that
   opens a small action sheet (uses Dialog primitive); receives an array
   of `{ label, icon, onClick, destructive? }`.
3. Migrate each list page to use it. Order by complexity (smallest first):
   1. `odometer/page.tsx`
   2. `fuel/page.tsx`
   3. `repairs/page.tsx`
   4. `trips/page.tsx`
   5. `dashboard/page.tsx` per-truck breakdown
   6. `fixed-costs/page.tsx` custom-costs table

**Files touched:** new `data-list.tsx`, new `overflow-menu.tsx`, six
list pages.

### Phase 3 — Forms as bottom sheets (1 day)
1. Extend `Dialog` to accept a `variant="sheet" | "modal"` prop; on
   mobile default to sheet (slide-up, full width, drag handle, sticky
   footer). Desktop stays modal.
2. Add `max-h-[90vh] overflow-y-auto` + sticky footer to all dialog
   forms so the Submit button never disappears.
3. Change every form `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`.
4. Fix `fixed-costs/page.tsx` custom-cost row: stack name / amount on
   mobile, action buttons full-width below.

**Files touched:** `ui/dialog.tsx`, five form pages.

### Phase 4 — Dashboard mobile polish (1 day)
1. Summary cards: add a compact currency formatter
   (`formatCurrencyCompact` in `lib/date-utils.ts`) and use on `< sm`.
2. Bar chart: detect width via `ResponsiveContainer`'s render-prop or
   add `interval={0} angle={-45} textAnchor="end"` for `XAxis` on small
   widths; or swap to horizontal layout.
3. Pie chart: replace with `<ExpenseBreakdownList>` on `< md` — ranked
   bars with name, amount, % of total.
4. Deductions Summary: keep `grid-cols-1 sm:grid-cols-3`, but tighten
   row height to `py-2` and right-align amounts.
5. Move CSV/PDF buttons into a top-bar overflow menu on mobile.

**Files touched:** `dashboard/page.tsx`, `lib/date-utils.ts`,
`top-bar.tsx`.

### Phase 5 — Tabs & secondary nav (½ day)
1. `TabNav`: on `< sm`, render a styled `<Select>` instead of the scroll
   strip. Re-uses `next/navigation`'s `useRouter().push()` on change.
2. Auto-scroll active tab into view on `≥ sm` for the existing strip.

**Files touched:** `ui/tabs.tsx`.

### Phase 6 — Confirmation & feedback (½ day)
1. Replace every `confirm()` with a `<ConfirmSheet>` component (Dialog
   primitive, "Delete" destructive button, "Cancel" outline).
2. Add list-row skeleton states (3 placeholder cards) instead of a
   centred spinner.

**Files touched:** new `confirm-sheet.tsx`, six pages (replace
`confirm(`), six loading blocks.

### Phase 7 — Stretch (optional, ~1 day total)
- Pull-to-refresh on list pages (`overscroll-behavior-y: contain` +
  custom hook).
- Per-truck card on `/trucks` shows `Net this month` and a sparkline.
- FAB for "Add Trip / Add Fuel / Add Repair" on relevant tabs
  (`fixed bottom-20 right-4` so it sits above the bottom nav).
- Numeric keypad component for PIN screen.

---

## 4. Acceptance criteria

A page is "mobile-friendly" when, at a 360 × 780 px viewport:
- No horizontal scrolling anywhere except inside intentional
  visualisations.
- All interactive elements ≥ 44 × 44 px.
- iOS Safari does not zoom on input focus.
- Page H1 / app-bar title is never occluded by overlays.
- Every dialog/form is fully reachable: submit button visible without
  needing to scroll past the keyboard.
- Number-entry fields show the numeric keypad on iOS / Android.

## 5. Effort summary

| Phase | Estimate |
|---|---|
| 0 — Foundations | 0.5 d |
| 1 — Shell & nav | 1.0 d |
| 2 — Data list primitive + migration | 1.5 d |
| 3 — Sheet forms | 1.0 d |
| 4 — Dashboard polish | 1.0 d |
| 5 — Tabs | 0.5 d |
| 6 — Confirmation & skeletons | 0.5 d |
| **Total (core)** | **~6 days** |
| 7 — Stretch | +1.0 d |
