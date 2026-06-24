---
name: rhobear-theme-reviews
description: Portable design-theme handoff for RHOBEAR Reviews. Pins the product's theme layer (surface mode + accent + bear-tint + voice + relay position) on top of the shared RHOBEAR foundation, so the Reviews UX reads complementary to the marketing front page. Copy this file into the rhobear-reviews repo; the product Iron Man builds the UX to match it.
user-invocable: true
metadata:
  product: rhobear-reviews
  surface: deep-space
  accent: "#ffb800"
---

# RHOBEAR Reviews — design theme (handoff)

> **What this is.** The marketing front page is the canonical tone/spacing/motion
> reference for the whole ecosystem. This file is the *Reviews slice* of it: the one
> accent, the surface mode, the voice, and Reviews' place in the hand-to-hand relay —
> everything the Reviews UX needs to feel like the same world as the front door.
> **You do not re-invent the system here.** Spacing, type ramp, radius, and motion all
> come from the shared foundation (below). This file only pins what is *Reviews-specific*.

## 0. Inheritance — read these first, don't duplicate them
- **`colors_and_type.css`** (rhobear-design skill) — the 4-pt spacing grid (`--s-1..--s-32`),
  type ramp (`--fs-*`), radius (`--r-1..--r-pill`), motion (`--ease-soft`, `--dur-*`), and
  the dashed-stitch border signature. Use these tokens verbatim. Do not hardcode pixels.
- **`CONSTELLATION.md`** (rhobear-design skill) — the deep-space North Star: live starfield,
  dark-glass surfaces, premium Inter type, "quiet luxury / premium calm." Reviews sits on
  this canvas.
- **The front page** `ui_kits/marketing-site/index.html` — the relay card system this theme
  was sampled from. Reviews is **stop 4**.

> **Supersede note (conscious, owner-approved):** the original Constellation ran *amber as
> the single accent across all 22 pages*. The ecosystem front door evolved that to
> **per-product accents** (Designs red, Reviews gold, Sales blue, …). Reviews' accent is
> therefore **gold, not the legacy amber** — this is intentional, not drift. Keep the
> deep-space *base*; swap the *accent* to Reviews' gold.

## 1. The one feeling
**Honest verdict, black room, gold light.** Reviews is the gate every PR walks through —
it should feel like a calm, authoritative review desk, not an alarm panel. Black surfaces,
one warm gold note for the verdict/score, green for pass, red for block. Quiet until it has
something true to say.

## 2. Theme layer — the only Reviews-specific tokens

```css
/* Reviews theme — pin on top of the shared foundation + deep-space base */
:root[data-product="reviews"] {
  /* surface mode: BLACK (deeper than the generic deep-space void) — matches reviews.rhobear.ai */
  --bg:        #070912;   /* page void                                  */
  --bg-2:      #0b1020;   /* recessed panel                              */
  --bg-3:      #0e1428;   /* card surface                                */

  /* THE accent — gold. The verdict color. Use sparingly: score, active state, key numbers. */
  --acc:       #ffb800;   /* gold (real site --gold)                     */
  --acc-hi:    #ffd255;   /* hover / emphasis text on dark               */
  --acc-glow:  rgba(255,184,0,0.18);

  /* semantics (carried from the real Reviews site, keep these exact) */
  --pass:      #4ade80;   /* vetted / merge-ready                        */
  --block:     #f87171;   /* unvetted / failing                         */
  --link:      #60a5fa;   /* inline links (this is Sales' accent — fine as a neutral link on Reviews) */

  /* bear avatar tint — recolors the single teal logo to read gold.
     This is the exact filter the front-page Reviews card uses. */
  --bear-tint: hue-rotate(250deg) saturate(1.35) brightness(1.05);
}
```

- **Accent discipline:** gold is the *verdict*, not décor. A page should have one or two gold
  moments (the score, the merge-ready pill), everything else is ink-on-black. If gold is
  everywhere, it stops meaning "this is the answer."
- **Hover deepens, never fades** (Constellation rule): `--acc → --acc-hi`, not toward grey.
- **`em` is gold, never italic** (foundation rule, re-accented to gold here).

## 3. Motion (inherit; one signature)
Use the foundation durations/eases (`--dur-base`, `--ease-soft`). Reviews' one signature
moment is the **verdict reveal** — when a review lands, the score badge gets a single soft
gold pulse (mirror the front-page hero `sellPulse` at low intensity: a `drop-shadow` glow
breath, ~1 cycle, then rest). Don't loop it; the verdict is stated once, calmly.

## 4. Voice & the relay
Reviews is **stop 4** in the hand-to-hand relay. The connective copy that must echo on the
Reviews site itself (so the workflow reads continuous from the front page into the product):

- **Receives from:** the Hub/build lane — *"every PR runs through Reviews."* Reviews is where
  built work is checked before it merges.
- **Hands off to:** Plans — *"Clean and built? Take it to market with Plans."*
- **In-product framing:** *"AI code review on every pull request — an honest verdict before
  anything merges."* **Verifies is a feature *inside* Reviews**, not a separate product: it
  maps the app's pathways and flags dead code / dead routes / wasted tokens at PR time
  (3 full app-maps a month). Never present Verifies as its own product or its own page.
- **Tone:** plain, certain, non-hype. State the verdict; don't sell it. Never name a
  competitor. No fake numbers — Reviews is honest by definition, so the page must be too.

## 5. Components Reviews owns (build to these)
- **Verdict card** — black-glass surface (`--bg-3`), gold score, pass/block semantic dot,
  one-line honest summary. The hero unit.
- **Dead-path map (Verifies)** — present as a *section of the review*, gold-accented, showing
  flagged routes/dead code. Same card language, labeled as the Verifies feature.
- **PR row / list** — ink-on-black, status dot (`--pass`/`--block`), gold only on the active row.
- **Chips** — mono, hairline border `color-mix(--acc 26%, line)`, faint gold fill — exactly the
  front-page `.chips span` recipe so they read as siblings.

## 6. Acceptance — "is it complementary?"
A Reviews screen passes when, placed next to the front-page Reviews card, a stranger would say
"same product": (1) black surface, not generic grey; (2) gold is the verdict and is *rare*;
(3) pass=green / block=red semantics intact; (4) type & spacing are the foundation tokens, not
ad-hoc; (5) the relay copy ("…before anything merges", "→ Plans") is present; (6) Verifies reads
as a feature, never a separate product. If any fail, it's drifting from the page.

---
*Handoff: copy into `rhobear-reviews` repo (siloing canon — one project, one repo). Maintained
as the cross-product source of truth by the marketing/design lane; the Reviews Iron Man builds
the UX to satisfy §6.*
