---
name: rhobear-theme-sunsponge
description: Portable design-theme handoff for SunSponge Captures, the open-source deterministic whole-site screenshot tool (not an LLM), and stop 3 of the relay. Pins the product's theme layer (navy deep-space surface + amber accent + bear-tint + voice + relay position) on top of the shared RHOBEAR foundation, so the SunSponge UX reads complementary to the marketing front page. Copy this file into the sunsponge repo; the product Iron Man builds the UX to match it.
user-invocable: true
metadata:
  product: sunsponge
  surface: deep-space
  accent: "#f5a524"
---

# SunSponge Captures — design theme (handoff)

> **What this is.** The marketing front page is the canonical tone/spacing/motion
> reference for the ecosystem. This file is the *SunSponge slice* of it: the one accent, the
> surface mode, the voice, and SunSponge's place in the hand-to-hand relay — everything the
> SunSponge UX needs to feel like the same world as the front door. **You do not re-invent the
> system here.** Spacing, type, radius, motion come from the shared foundation (below);
> this file only pins what is *SunSponge-specific*.

## 0. Inheritance — read these first, don't duplicate them
- **`ECOSYSTEM-MAP.md`** — the relay graph. SunSponge is **stop 3**: it receives the finished
  site from Designs and runs *parallel* to Reviews while it captures.
- **`colors_and_type.css`** (rhobear-design skill) — the 4-pt spacing grid (`--s-1..--s-32`),
  type ramp (`--fs-*`), radius, motion (`--ease-soft`, `--dur-*`), dashed-stitch border.
  Use the tokens verbatim; don't hardcode pixels.
- **`CONSTELLATION.md`** (rhobear-design skill) — the deep-space North Star: live PixelDust
  field, dark-glass surfaces, premium calm. SunSponge sits on this canvas, sharing Designs' navy.
- **The front page** `ui_kits/marketing-site/index.html` — SunSponge is **stop 3** of the relay.

## 1. The one feeling
**Cheap, fast, and it just soaks.** SunSponge is the picture-taker, not a brain — and it
should look like an honest machine doing one job well. Navy-black surface, amber on the
captors that are working, a grid of clean rested screenshots filling in pass after pass. No
"AI" sheen, no thinking animation, no pretending it reasons. It feels like watching a sheet
develop: feed it a map, the frames appear, the cost stays near zero.

## 2. Theme layer — the only SunSponge-specific tokens

```css
/* SunSponge theme — pin on top of the shared foundation + deep-space base */
:root[data-product="sunsponge"] {
  /* surface mode: NAVY (shared with Designs) — warmer than the master void */
  --bg:        #1a1a2e;   /* navy page void (shared with Designs)         */
  --bg-2:      #15152a;   /* recessed panel                              */
  --bg-3:      #20203a;   /* card / capture-tile surface                 */

  /* THE accent — amber. The "this captor is working" note. Use it sparingly. */
  --acc:       #f5a524;   /* amber                                       */
  --acc-hi:    #ffb84d;   /* hover / emphasis on dark                    */
  --acc-glow:  rgba(245,165,36,0.18);

  /* bear avatar tint — recolors the teal logo to read amber */
  --bear-tint: hue-rotate(235deg) saturate(1.3);
}
```

- **Accent discipline:** amber is *activity* — the captor mid-shot, the tile being filled, the
  page in flight. A finished frame is calm ink-on-navy. If amber is everywhere, "working" stops
  reading as motion. Honest note: SunSponge is **deterministic capture, not an LLM** — keep the
  accent mechanical, never the warm "thinking" glow the AI surfaces use.
- **Hover deepens, never fades:** `--acc → --acc-hi`.
- **`em` is amber, never italic** (foundation rule, re-accented).

## 3. Motion (inherit; one signature)
Foundation durations/eases. SunSponge's one signature is the **soak-in**: as each capture lands,
its tile fades up in the grid with a single soft `--ease-soft` beat, amber edge cooling to ink
once it's rested. Many tiles fill in parallel — the swarm reads as a grid populating, not a
spinner spinning. No progress bar theater; the filling grid *is* the progress.

## 4. Voice & the relay
SunSponge is **stop 3** in the hand-to-hand relay. Connective copy that must echo on the
SunSponge surface so the workflow reads continuous from the front page into the product:

- **Receives from:** Designs — "Looks the way you want? **Rest the finished site in SunSponge.**"
  SunSponge is the picture-taker for whatever Designs just made.
- **Runs parallel to:** Reviews — "All the while, **every PR runs through Reviews.**" Capture and
  review happen at the same time; SunSponge is not waiting on the gate and the gate is not
  waiting on it. Show them as concurrent, never as sequential steps.
- **In-product framing:** "Feed it a map, it soaks a finished site into clean screenshots — every
  page, every state, in one pass, for almost nothing." Point a **swarm of captors** at your apps,
  then pour the results into **Remotion** and cut hundreds of videos for next to nothing. Frontier
  models do the same job for a fortune; SunSponge does it cheap because it doesn't think, it captures.
- **Tone:** plain, mechanical-honest. It's a tool, not a brain — say so. Never name a competitor.
  No fake numbers; "costs almost nothing" is the claim, stated flat.

## 5. Components SunSponge owns (build to these)
- **Capture grid** — the tiled wall of rested screenshots; amber on in-flight tiles, ink on done.
- **Map input** — feed it the site map; shows the page/state queue it will walk in one pass.
- **Captor swarm panel** — parallel workers, each amber while shooting, honest count of what's left.
- **Remotion handoff** — the export that pours frames into video; names the downstream plainly.
- **Chips** — mono, hairline `color-mix(--acc 26%, line)`, faint amber fill — front-page recipe.

## 6. Acceptance — "is it complementary?"
A SunSponge screen passes when, next to the front-page SunSponge card, a stranger says "same
product": (1) navy surface (shared with Designs), not generic grey; (2) amber = active capture
and is *rare*; (3) the filling capture grid is the hero, not a generic gallery; (4) type &
spacing are foundation tokens; (5) the relay copy ("Rest the finished site", parallel-to-Reviews,
"feeds Remotion") is present; (6) nothing on the page implies it's an AI/LLM — it reads as an
honest deterministic tool. If any fail, it's drifting from the page.

---
*Handoff: copy into `sunsponge` repo (siloing canon — one project, one repo). Maintained
as the cross-product source of truth by the marketing/design lane; the SunSponge Iron Man builds
the UX to satisfy §6.*
