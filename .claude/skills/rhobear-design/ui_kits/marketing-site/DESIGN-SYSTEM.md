# RHOBEAR marketing site — DESIGN SYSTEM CONTRACT

> The frozen spec every page is built against. Authored by the rhobear-app design
> Iron Man (the one who built the front page). A second instance of the same
> designer builds half the pages from this same contract; the original does the
> final unification pass + the only deploy. Locked 2026-06-24.
>
> **Who touches what:** the shared chassis files — `colors_and_type.css`,
> `shell.css`, `shell.js` — are owned by ONE hand (the original). Everyone else
> edits **page-body files only** (`<page>.html`). That is why two instances never
> collide: different page files, one frozen shell.

---

## 0. The job, in one line

The deep-space teal chassis is ALREADY on every page (shared `shell.css`). This is
NOT a retheme. The real job per page: **stop-slop the copy, give the page its own
Hybrid personality (so 24 pages don't read templated), and kill the residual amber
leaks** — every line through `stop-slop`, every layout through `design-taste-frontend`.

**Confirmed live state (rhobear.ai, 2026-06-24):** `shell.css` (the version every
page links) carries a site-wide deep-space override block (~lines 1858-1949):
`html{color-scheme:dark}`, `body{background:#08080a}`, `#rho-stars` PixelDust sky,
dark-glass cards, teal nav pills, transparent footer. So `crew.html`,
`workbench.html`, etc. already render dark + teal. What is NOT done: (1) the prose
is full of AI slop — em dashes alone run from 5 to 93 per page; (2) some text still
pulls `var(--c-amber-deep)` (old amber `#d97a1a`) — relay `.now` pill, nav-dropdown
active, `::first-letter`, dashed borders. The base `colors_and_type.css` is still
warm-paper but is overridden by that `shell.css` block, so it does not render — leave
it (it is shared with the `app` UI kit; touching it has blast radius).

---

## 1. FROZEN chassis (never varies — this is what makes 24 pages read as one family)

- **PixelDust sky** — jet-black void, teal pixel-stars, ONE gold north star,
  faint constellation links, gentle pointer parallax. Reference impl: the
  `#sky` canvas + draw loop in `index.html`. Promote to a shared include.
- **Nav + footer + relay band** — identical on every page. The relay band carries
  the hand-to-hand wording ("one hand passes to the next").
- **Type scale** — keep the existing scale in `colors_and_type.css` (it is good):
  `--fs-display/h1/h2/h3/lead/body/...`, `--font-display` = Silkscreen pixel stack,
  `--font-body` = system sans. Do NOT add webfonts / CDN @imports.
- **Master = teal + gold. Never orange. Never warm paper.**

### 1a. The ONE chassis fix the original owns (bg/ink/cards are already deep-space)

Backgrounds, ink, and cards are already flipped by the `shell.css` override block —
do NOT touch them. The only residual leak: text/accents still pull the old amber
through `var(--c-amber*)`. Fix it once, scoped to the marketing site, by adding a
`:root` override near the TOP of `shell.css` (loads after `colors_and_type.css`, so
it wins; stays out of the shared root file → no `app`-kit blast radius):

```css
:root{
  --c-amber:      #7dffd5;            /* was #f59e2c — now teal  */
  --c-amber-deep: #ffd76a;            /* was #d97a1a — now gold  */
  --c-amber-soft: rgba(125,255,213,0.14);
  --c-amber-tint: rgba(125,255,213,0.07);
  --teal:#7dffd5; --teal-dim:#48d8b0; --gold:#ffd76a;
  --void:#04060c; --void-2:#070b16;
}
```

That single block flips every `var(--c-amber*)` leak (relay `.now`, nav-dropdown
active, `::first-letter`, dashed borders) to teal/gold at once. Hardcoded hex amber
inside a page (rare — only `spin-it-up` had any) gets cleaned in that page's pass.

---

## 2. Per-product accent (only for the FUTURE standalone product pages)

The 22 deep pages are all **Hub** pages → accent = teal. The per-product accent
table applies when we build the standalone product pages (Designs/SunSponge/
Reviews/Plans/Sales), which do not exist yet — they are cards on the front page.
Locked accents live in `D:\rhobear-design-ecosystem-cache\MANIFEST.md` §1
(Hub teal · Designs red · SunSponge amber · Reviews gold · Plans purple · Sales blue).

---

## 3. HYBRID divergence rule

Fixed shell on every page (sky · nav · footer · relay · type · token set). The
page **body** gets its own personality — section composition, hierarchy,
whitespace, motion — via the `design-taste-frontend` skill. Taste works INSIDE
the chassis; it never repaints the shell. One family, many personalities.

---

## 4. Per-page pass — the gate (run for EVERY page; the chassis is already done)

1. **Design Read** one-liner first (per `design-taste-frontend`): "Reading this as: …".
2. **stop-slop the copy — the main work.** No em dashes, no rule-of-three triads,
   no "Stop X" openers, active voice, no false agency, no pull-quote taglines,
   first-person only where it is the owner's real voice. (Front page = the bar.)
3. **Hybrid taste polish** — vary layout/hierarchy/rhythm so the page reads distinct
   from its siblings, NOT identical dark-glass-card stacks. Only where a page reads
   templated or weak; do not redesign a page that already works.
4. **Chassis sanity check** — sky still seats behind content, relay band present,
   no hardcoded amber hex left (`grep -E '#f59e2c|#d97a1a'`). Do NOT edit `shell.css`
   / `shell.js` / `colors_and_type.css` — those are the original's, frozen.
5. Regenerate the self-contained preview to the Desktop:
   `python D:\rhobear-design-ecosystem-cache\tools\build_preview.py` — eyeball it.
6. Commit to branch `teal-retheme`. Do NOT push main.

---

## 5. Branch + deploy protocol (protects the live site)

- All retheme work happens on branch **`teal-retheme`** off `main`. Main stays
  live + untouched until the unification pass, so the site never shows a
  half-converted mix.
- **Active checkout = `C:\Users\slang\rhobear\…` ONLY.** `D:\rhobear` is STALE —
  never build or push from it. (MANIFEST §0 divergence flag.)
- Deploy = `deariencampbell1-sys/rhobear`, `.github/workflows/pages.yml`, push to
  `main`. **Only the original deploys, and only after the unification pass.**
- Copy through `stop-slop`; never `rtk git commit -F -` (garbles the message —
  use `-m`).

---

## 6. Ownership split

- **Original (me):** Step 1 (re-author `colors_and_type.css` + the shell, write
  this contract, add the shared sky/relay include, freeze) → my half of the pages
  → Step 3 unification pass (chassis byte-identical across all 24 + stop-slop
  consistency + taste polish) → the single deploy.
- **Second instance (clone-of-me):** its half of the page bodies only, against
  this frozen contract, on `teal-retheme`. Never touches the shell. Never deploys.
- **Proposed page cut** (adjust freely):
  - *Original:* app, hub, hub-contract, story, learn, faq, closer, compass,
    handoff-bus, judgment-loop, drop-in.
  - *Clone:* crew, workbench, worker-sessions, openclaw, substrate, worlds,
    spin-it-up, goal-autoloop, safety-registry, built-with, ease-of-use, try.

---

## 7. End state

This contract + the re-authored tokens = the shared design system. After the
pages land, each page's look gets extracted into a per-page theme skill (in
`product-themes/`) that inherits from this contract, then hands off to that
product's Iron Man. See `[[canon-marketing-page-styling-system]]`.
