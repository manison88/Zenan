# Zenan Fleet — Mobile-First Redesign v2

A re-audit of every screen with the auth + maintenance + multi-tenancy
features now in place, plus a concrete redesign plan and an honest
verification protocol that catches the kind of "shipped but not actually
on screen" failure mode that bit us last time.

---

## 0. Why this exists

The original mobile-UI overhaul (PR #1) shipped a card-on-mobile / table-on-
desktop pattern via a `<DataList>` primitive. The recovery PR (#2) brought
back landing-page, login, onboarding, multi-tenant auth, and a new
maintenance feature — but the repairs page came over from the landing-page
branch with raw tables. A follow-up commit (`0f6af62`) rewrote the repairs
page to also use cards.

User report from the live site: **every tab inside `/trucks/[id]/...`
still horizontally scrolls on mobile**. That should not be possible if all
the DataList migrations are actually live. Two possible explanations
remain open:

- **A) The deployed bundle is stale** — workflow runs reported success but
  some Next.js page chunks weren't actually rebuilt or weren't uploaded.
- **B) The DataList primitive itself has a layout bug** that lets a child
  table overflow even when `md:hidden` should be hiding it.

Either way, the redesign in this doc is built to be **robust against
both** — it explicitly forbids any element that can cause horizontal
overflow at the page level, regardless of which child component is
rendered, and the verification protocol at the end will catch a
deploy-vs-source mismatch before we tell you it's done.

---

## 1. Design system constraints

These are non-negotiable rules every screen must follow.

### 1.1 Layout invariants
- **Page width ≤ viewport width.** Always. `<main>` gets
  `overflow-x-hidden` (already set in `app-shell.tsx:30`); every immediate
  child also caps its own width with `max-w-full min-w-0`. If a table
  ever appears on mobile, it lives inside a `min-w-0 max-w-full` flex
  child and `overflow-x-auto` is allowed *inside* it — but the page
  itself never scrolls horizontally.
- **No element wider than `100vw - 32px`** (16 px gutter each side). If
  it can't fit, it wraps, truncates, scrolls inside its own bounds, or
  is hidden on mobile.
- **`min-w-0` on every flex child** that contains text. Without it,
  long words / un-broken strings will blow out the layout.

### 1.2 Touch targets
- Every interactive element ≥ 44 × 44 px on mobile (Apple HIG), ≥ 36 × 36 px
  on desktop (Material).
- Destructive actions (delete) live behind a confirmation, never as a
  single one-tap icon next to a navigation target.
- Icon-only buttons must have `aria-label`.

### 1.3 Typography & inputs
- All `<Input>` / `<Select>` / `<Textarea>` use `text-base` (16 px) on
  mobile — anything smaller triggers iOS auto-zoom on focus.
- `inputMode` set per field (`decimal`, `numeric`, `tel`, `email`).
- Page H1 lives in the sticky top bar on mobile, plain `<h1>` on desktop
  (via `<PageHeader>` — already exists).

### 1.4 Color & contrast
- Brand: black + gold (`#D4AF37` per the diamond-Z logo direction).
  Primary CTA stays solid black; brand color used for accents,
  highlighted-card borders, active-tab indicators, the live logo mark.
- Status colors:
  - Green (`text-green-700`) — positive money (gross, net when ≥ 0)
  - Red (`text-red-600`) — negative money (deductions, net when < 0)
  - Amber (`text-amber-700`) — warnings ("due soon")
  - Destructive (`text-destructive`) — overdue, delete actions
- All status colors meet WCAG AA on the white card background.

### 1.5 Density
- Mobile list rows: ~ 64–80 px tall (one line of primary text, one line
  of secondary, optional metadata). No row taller than 96 px without a
  good reason.
- Desktop tables: existing density (~ 48 px rows).
- Section padding: 16 px on mobile, 24 px on desktop.

---

## 2. Screen-by-screen audit & redesign spec

For each screen: *what's there* → *what's wrong on mobile* → *what it
should be*.

### 2.1 Landing page (`/`)
**Status:** ✅ Already mobile-friendly (verified in earlier screenshots —
hero, feature grid, three-step diagram, CTA all reflow correctly).
**No redesign needed.** Only follow-up: swap the lucide `Truck` icon
for the new diamond-Z logo.

### 2.2 Login (`/login`)
**Status:** ✅ Already mobile-friendly (single-card centered layout).
**No redesign needed.** Only follow-up: logo swap.

### 2.3 Onboarding (`/onboarding`)
**Status:** ✅ Already mobile-friendly (three-step wizard, single-column
forms).
**No redesign needed.** Only follow-up: logo swap.

### 2.4 Fleet Dashboard (`/dashboard`)
**Currently:**
- 3 summary stat cards (Gross / Deductions / Net) — `grid-cols-3` fixed.
- UpcomingMaintenance card.
- Two charts side-by-side on `lg+`, stacked on mobile (Revenue by
  Truck bar chart, Expense Breakdown ranked list).
- Per-Truck Breakdown — already has `md:hidden` cards + `hidden md:block`
  desktop table.
- CSV/PDF export in overflow menu on mobile, two buttons on desktop.

**Mobile issues:**
1. `grid-cols-3` on summary cards stays 3-up even at 320 px width →
   "Net Pay" currency wraps awkwardly inside a tiny card. Should be
   `grid-cols-1 sm:grid-cols-3` or use compact currency that always
   fits.
2. Bar chart at narrow widths overlaps x-axis labels even with the
   `angle={-45}` workaround. Better: switch to horizontal bars when
   `< sm`.
3. UpcomingMaintenance card width — need to verify it doesn't blow out
   on a 320 px viewport.
4. "TOTAL" row card uses a 3-column grid for sub-stats that's tight on
   320 px.

**Redesign:**
- Summary cards: stack 1-column on `< sm`, 3-column on `sm+`. Each
  stat is a horizontal row on mobile (icon + label on left, value on
  right) — denser than 3 stacked cards.
- Bar chart: horizontal bars on `< md`, vertical on `md+`. Always
  use compact currency ($1.2k / $47k) on chart labels.
- Per-truck card: keep as-is but add a destination indicator (gold
  chevron) to the right.
- All sub-stat grids: `grid-cols-3` becomes `flex flex-wrap gap-x-3
  gap-y-1` so they reflow gracefully at any width.

### 2.5 Trucks list (`/trucks`)
**Currently:** Card grid (`grid sm:grid-cols-2 lg:grid-cols-3`). Each
card is a Link with an OverflowMenu absolutely positioned in the
top-right.

**Mobile issues:**
1. OverflowMenu absolute positioning sits over the chevron — visual
   crowding.
2. Cards are very minimal (just truck number + "View details") — wastes
   vertical real estate. Each card should preview the truck's current
   state.

**Redesign:**
- One-column list on mobile (full-width cards), 2-up on `sm`, 3-up on `lg`.
- Each card shows: **Truck #101** · DEMO badge · this-month net pay ·
  miles driven · last-trip date. Tap → goes to Trips tab.
- OverflowMenu moves into the card body, right side, aligned with the
  primary line — not absolute.
- "Add Truck" button: floating action button (FAB) on mobile, fixed
  position bottom-right above the bottom nav. Header button on desktop.

### 2.6 Truck detail layout (tabs)
**Currently:** Native `<select>` on mobile, scroll strip on desktop. Six
tabs: Trips / Odometer / Fuel / Repairs / Fixed Costs / Summary.

**Mobile issues:**
1. The `<select>` works but has zero visual hint that it's the nav for
   tabs — it just looks like a form input.
2. The full truck #101 H1 is duplicated: once in the top bar, once on
   the page. (Verified earlier — `layout.tsx:48-50`.)

**Redesign:**
- Replace `<select>` with a **horizontal-scrolling pill bar** under the
  top bar, with the active tab indicated by a gold underline and
  auto-scroll-to-center. This actually looks like nav and uses native
  swipe.
- Hide the in-page `<h1>` on mobile (top bar already shows the truck
  number).
- Reduce tab labels to fit more on screen at once: "Trips · Miles ·
  Fuel · Repairs · Costs · Summary" (Odometer → Miles, Fixed Costs →
  Costs).

### 2.7 Trips tab (`/trucks/[id]/trips`)
**Currently:** Uses `<DataList>` → cards on mobile, table on desktop.
Card primary = date + from→to, trailing = amount, meta = trailer/bill.

**Mobile concerns (if shipped):**
- A trip with a long city name pair ("Schenectady, NY → Charlottesville, VA")
  could overflow the primary line. Need explicit `break-words` and
  test at 320 px.
- Date format "Mar 14" works; consider grouping by month with sticky
  date headers for a cleaner scroll.

**If NOT shipped (i.e., user still seeing tables):** the `<DataList>`
component is failing somehow. Need to audit:
- Whether `md:hidden` is being defeated by some parent style.
- Whether the React rendering branch is wrong.
- Verify by inspecting `<html>` on the live site for a `.md:hidden`
  class actually being hidden.

**Redesign:**
- Add monthly sticky date headers on the mobile card list. Reduces
  scanning cost.
- "Add Trip" → FAB on mobile.
- Empty state on mobile: full-bleed illustration + CTA.

### 2.8 Odometer tab (`/trucks/[id]/odometer`)
**Currently:** DataList — card shows "Week of Mar 14" + miles driven,
secondary shows start/end readings.

**Mobile concerns:** Same as Trips. Card is short (3 short lines), works
well on mobile.

**Redesign:** Minor — group by month with sticky headers, FAB.

### 2.9 Fuel tab (`/trucks/[id]/fuel`)
**Currently:** DataList — card shows date + location, trailing = amount,
secondary = gallons + $/gal.

**Mobile concerns:** Long city names again. $/gal is a useful side stat —
verify it doesn't push the trailing amount off-screen on 320 px.

**Redesign:** Add per-fill MPG calc (if odometer logs cover the period).
Group by month with sticky headers. FAB.

### 2.10 Repairs tab — Repair Log section (`/trucks/[id]/repairs`)
**Currently:** As of `0f6af62`, uses DataList. Card primary = date + type,
trailing = amount, secondary = notes (untruncated, breaks naturally).

**Mobile concerns:**
- View toggle pill stretches full-width on mobile — good, fixed in
  `0f6af62`.
- Notes that are 200+ chars will make the card very tall — consider
  line-clamp-2 + tap-to-expand.

**Redesign:** line-clamp-2 on notes, expand inline on tap. FAB.

### 2.11 Repairs tab — Maintenance section
**Currently:** Upcoming cards (grid `sm:grid-cols-2`) + History DataList
(cards on mobile, table on desktop).

**Mobile concerns:**
- Upcoming cards: single-column on mobile is correct. Verify urgency
  badge wraps cleanly with long type names.
- History card primary line: "Scheduled · Engine oil and filter change"
  could overflow.

**Redesign:**
- Upcoming cards: redesign as a **horizontal-scrolling carousel** on
  mobile (single visible card, swipe for next). Saves vertical
  real-estate before History.
- Or: cap to top 3 upcoming with a "View all" link to a dedicated
  upcoming view.

### 2.12 Fixed Costs tab (`/trucks/[id]/fixed-costs`)
**Currently:** Standard fixed-costs form (insurance/parking/eld/tolls)
+ custom-costs DataList.

**Mobile concerns:**
- Form is `max-w-lg` and stacks naturally — fine.
- "Add Custom" inline form uses `grid-cols-1 sm:grid-cols-2` already —
  fine.

**Redesign:** Minor — convert the four standard fields into a single
list of "Type · $ amount" rows with inline edit, instead of four
labeled inputs. Less visual noise.

### 2.13 Summary tab (`/trucks/[id]/summary`)
**Currently:** Three summary stat cards (`grid-cols-3`), deductions
breakdown card with stacked rows.

**Mobile concerns:** Same `grid-cols-3` issue as dashboard — currency
crammed on tiny cards.

**Redesign:** Same fix as dashboard. Stack 1-column on `< sm` or use
the horizontal-row format.

### 2.14 Add Truck (`/trucks/new`)
**Currently:** Centered `max-w-md` card with single field.
**Status:** ✅ Already mobile-friendly. No change.

### 2.15 All Add/Edit dialogs
**Currently:** `<Dialog variant="sheet">` slides up from bottom on
mobile, sticky footer with submit. `grid-cols-1 sm:grid-cols-2` forms.

**Mobile concerns:**
- If user is on a small phone with the iOS keyboard open, the sheet's
  `max-h-[90vh]` may not leave enough room — sheet should resize when
  keyboard appears (use `dvh` units instead of `vh`).
- Form fields with `<select>` on iOS open a wheel picker — fine for
  date and state, awkward for the long repair-types list. Consider a
  searchable combobox for lists > 10 items.

**Redesign:**
- Switch `max-h-[90vh]` → `max-h-[90dvh]` for proper keyboard handling.
- Repair-types: keep `<select>` for now but add an inline-search
  fallback when there are > 10 types.

---

## 3. New primitives needed

| Primitive | What it does | Where used |
|---|---|---|
| `<PageContainer>` | Enforces `max-w-full min-w-0 px-4 sm:px-6` and provides the page-level overflow safety net. Replaces ad-hoc `<div>` wrappers in every page. | Every screen |
| `<FloatingActionButton>` | Mobile-only fixed-position primary action (`bottom-20 right-4` to clear the bottom nav). Renders nothing on `md+`. | Trips, Fuel, Repairs, Odometer, Trucks list |
| `<MonthGroupedList>` | Wraps `<DataList>` and inserts sticky month headers between groups. | Trips, Fuel, Odometer, Repairs |
| `<SearchableSelect>` | `<select>` for ≤ 10 options, command-palette style search for > 10. | Repair-type picker |
| `<StatRow>` | Mobile alternative to `<SummaryStat>` card — horizontal row (icon, label, value). | Dashboard, Truck Summary |
| `<TabPillBar>` | Replacement for the truck-detail `<TabNav>` — horizontal-scrolling pills with auto-center. | Truck detail layout |

All new primitives go in `src/components/shared/` (layout) or
`src/components/ui/` (form widgets).

---

## 4. Implementation plan

Phased so each ships independently with verifiable mobile screenshots.

### Phase 0 — Diagnostic & safety nets (0.5 day)
1. **Diagnose the "horizontal table on every tab" report** by running
   the dev server and screenshotting `/trucks/[id]/trips`, `/fuel`,
   `/repairs`, `/odometer` at 390×844 viewport. If we see cards →
   it's a deploy/cache issue; we add cache-busting build IDs to the
   workflow. If we see tables → the DataList primitive is broken and
   we fix it.
2. **Add the safety net.** Make `<PageContainer>` the only acceptable
   page wrapper and apply it to every screen. Even if a child
   component has a bug, the page can't horizontally scroll.
3. **Workflow change.** Add a `wrangler deployments list` step at the
   end of the deploy workflow that prints the new version ID — so the
   GitHub Actions log proves whether wrangler actually shipped the
   build.

### Phase 1 — New primitives (1 day)
1. Build `<PageContainer>`, `<FloatingActionButton>`, `<MonthGroupedList>`,
   `<StatRow>`, `<TabPillBar>`. Each in its own file with a clear
   contract. No consumer changes yet.
2. Add Tailwind utility for `safe-area-bottom` if not already present
   (it is — `.safe-bottom` in `globals.css`).

### Phase 2 — Truck detail layout (0.5 day)
1. Replace `<TabNav>` with `<TabPillBar>` on the truck detail layout.
2. Hide the in-page H1 on mobile (use top bar).
3. Rename labels for compactness.

### Phase 3 — List screens, one by one (1.5 days)
1. Trips → `<PageContainer>` + `<MonthGroupedList>` + FAB.
2. Fuel → same pattern.
3. Odometer → same pattern.
4. Repairs (Repair Log section) → same pattern + line-clamp on notes.
5. Repairs (Maintenance section) → horizontal-scrolling upcoming
   carousel + `<MonthGroupedList>` history.

### Phase 4 — Dashboard + Summary (1 day)
1. Replace `<SummaryStat>` cards with `<StatRow>` on mobile (`< sm`).
2. Bar chart → horizontal bars on mobile.
3. Per-truck cards: add chevron, ensure no horizontal overflow at
   320 px.
4. Truck Summary: same `<StatRow>` swap.

### Phase 5 — Fixed Costs simplification (0.5 day)
1. Replace four labeled inputs with a single editable row list.

### Phase 6 — Logo + brand polish (0.5 day)
1. Convert the diamond-Z logo PNG to an inline SVG component
   `<ZenanLogo>`.
2. Replace lucide `Truck` icon in: sidebar header, login card,
   onboarding card, landing page header.
3. Generate favicons (16, 32, 192, 512) + Apple touch icon.
4. Add gold accent to: primary card border, active tab pill underline,
   chevron color.

### Phase 7 — Repair-type searchable select (0.5 day)
1. Build `<SearchableSelect>` (uses a Dialog/Sheet on mobile).
2. Apply on repairs + maintenance type pickers.

**Total: ~5.5 days core work.**

---

## 5. Verification protocol (the missing piece from last time)

Every phase **must** pass this before being marked complete and merged.

### 5.1 Visual smoke test (manual, ~5 min per phase)
1. `npm run dev` locally.
2. Open Chrome devtools → device toolbar → iPhone SE (375×667) and
   iPhone 14 Pro (393×852).
3. Navigate to every changed screen. Confirm:
   - Page does not horizontally scroll. (Try to scroll horizontally
     with a finger gesture — nothing should move.)
   - No element overlaps another. Inspect the top bar / page H1 area
     specifically.
   - Tap every interactive element — none feels too small.
4. Repeat at 1280 width — desktop layout still works.

### 5.2 Automated screenshot diff (committed to repo)
1. A new `screenshot.test.ts` that uses puppeteer to load every page
   at iPhone SE resolution and save a screenshot to `tests/screens/`.
2. Run it on every PR. Fails the build if any new screenshot has
   horizontal scroll (compare `scrollWidth > clientWidth` on
   `<body>`).
3. Optional: image diff against a baseline (skipped initially —
   too much noise — but worth adding once stable).

### 5.3 Deploy verification
After CI/CD reports success, the workflow's last step runs:
```bash
npx wrangler deployments list --name zenan-fleet --json \
  | jq -r '.[0] | "Latest: \(.created_on) version=\(.versions[0].id)"'
```
That string lands in the job summary, so we always know which version
is actually live. If two consecutive deploys produce the same version
ID → wrangler isn't actually shipping → workflow fails loudly.

### 5.4 Post-deploy live check
A separate workflow on a 5-minute cron does:
```bash
curl -sI https://zenan.312itconsulting.com \
  | grep -E "(HTTP|x-version|server)" \
  > "$GITHUB_STEP_SUMMARY"
```
Plus a quick public-page content sniff (look for a string from
the latest build, e.g. an `x-deploy-id` header we add in middleware).

---

## 6. What I want from you before I start

1. **Approve the plan in broad strokes** — yes / no on the seven phases
   and the verification protocol.
2. **Confirm the verification approach** is acceptable — specifically,
   that you're OK with me running the dev server locally and posting
   screenshots back here before claiming a phase is done.
3. **Logo file** — send the diamond-Z PNG again (it didn't make it
   through the first attempt). I'll convert to SVG and prep the
   favicon set as part of Phase 6.
4. **Priority order** — should I do Phase 0 (diagnosis) immediately and
   ship the safety-net `<PageContainer>` as a fast win before the rest?
   Or work through the phases in order?

Once you give a green light, I'll start with Phase 0 — diagnose what
the user is actually seeing on the live site, fix the immediate cause,
and ship the safety net so horizontal scroll becomes structurally
impossible regardless of which child component has a bug.
