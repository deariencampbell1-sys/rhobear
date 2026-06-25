---
name: rhobear-theme-designs
description: Portable design-theme handoff for RHOBEAR Designs, the open-source infinite canvas where you finish the last 10% by hand, and stop 2 of the relay. Pins the product's theme layer (navy deep-space surface + red accent + bear-tint + voice + relay position) on top of the shared RHOBEAR foundation, so the Designs UX reads complementary to the marketing front page. Copy this file into the rhobear-designs repo; the product Iron Man builds the UX to match it.
user-invocable: true
metadata:
  product: rhobear-designs
  surface: deep-space
  accent: "#e94560"
---

# RHOBEAR Designs — design theme (handoff)

> **What this is.** The marketing front page is the canonical tone/spacing/motion
> reference for the ecosystem. This file is the *Designs slice* of it: the one accent, the
> surface mode, the voice, and Designs' place in the hand-to-hand relay — everything the
> Designs UX needs to feel like the same world as the front door. **You do not re-invent the
> system here.** Spacing, type, radius, motion come from the shared foundation (below);
> this file only pins what is *Designs-specific*.

## 0. Inheritance — read these first, don't duplicate them
- **`ECOSYSTEM-MAP.md`** — the relay graph. Designs is **stop 2**: it receives built work
  from the Hub and rests the finished site into SunSponge.
- **`colors_and_type.css`** (rhobear-design skill) — the 4-pt spacing grid (`--s-1..--s-32`),
  type ramp (`--fs-*`), radius, motion (`--ease-soft`, `--dur-*`), dashed-stitch border.
  Use the tokens verbatim; don't hardcode pixels.
- **`CONSTELLATION.md`** (rhobear-design skill) — the deep-space North Star: live PixelDust
  field, dark-glass surfaces, premium calm. Designs sits on this canvas, warmed toward navy.
- **The front page** `ui_kits/marketing-site/index.html` — Designs is **stop 2** of the relay.

## 1. The one feeling
**Your hands on the work, no model in the way.** Designs is the quiet studio where the build
stops being the agent's and becomes yours. Navy-black canvas, one red note on the thing you're
touching right now, everything else resting. You drag a block, swap a font, fix the one color
that's off, and it answers instantly — no round-trip, no spinner, no asking permission. It
should feel like a drafting table, not an app: still until your hand moves.

## 2. Theme layer — the only Designs-specific tokens

```css
/* Designs theme — pin on top of the shared foundation + deep-space base */
:root[data-product="designs"] {
  /* surface mode: NAVY (shared with SunSponge) — warmer than the master void */
  --bg:        #1a1a2e;   /* navy page void (shared with SunSponge)       */
  --bg-2:      #15152a;   /* recessed panel                              */
  --bg-3:      #20203a;   /* card / canvas-chrome surface                */

  /* THE accent — red. The "this is the thing you're editing" note. Use it sparingly. */
  --acc:       #e94560;   /* red                                         */
  --acc-hi:    #ff5f78;   /* hover / emphasis on dark                    */
  --acc-glow:  rgba(233,69,96,0.18);

  /* bear avatar tint — recolors the teal logo to read red */
  --bear-tint: hue-rotate(180deg) saturate(1.25);
}
```

- **Accent discipline:** red is the *selection* — the active handle, the picked layer, the
  control you're dragging. Everything else is ink-on-navy. If red is everywhere, "you're
  editing this" stops meaning anything. One selection reads red at a time.
- **Hover deepens, never fades:** `--acc → --acc-hi`.
- **`em` is red, never italic** (foundation rule, re-accented).

## 3. Motion (inherit; one signature)
Foundation durations/eases. Designs' one signature is the **direct-drag**: the canvas answers
the cursor with zero latency and no easing on the grab itself, so a moved block tracks the
hand 1:1 — the proof there's no model in the loop. Snap and align settle with a single soft
`--ease-soft` beat. No spinners anywhere; the absence of a wait is the whole feeling.

## 4. Voice & the relay
Designs is **stop 2** in the hand-to-hand relay. Connective copy that must echo on the Designs
surface so the workflow reads continuous from the front page into the product:

- **Receives from:** the Hub — "Got something built? **Hand it to Designs to make it yours.**"
  Designs is where a crew-built site stops being generic and becomes the owner's.
- **Hands off to:** SunSponge — "Looks the way you want? **Rest the finished site in SunSponge.**"
- **In-product framing:** "You build ninety percent with your crew. Designs is the last ten,
  by hand." Open the near-done HTML on an **infinite canvas** and finish it directly: drag it,
  swap a font, fix the one color, no round-trip to the model. It touches real **JS, CSS, and
  HTML with hidden embeds** without wrecking what the agent already got right. Ships with a
  local-LLM stub that works the moment you download it, or pipe in your own key through
  **OpenRouter**. The file stays yours.
- **Tone:** plain, maker-to-maker. State what it does and let the directness sell it. Never
  name a competitor. **MIT, forever** — say the license flat; it's the point, not a footnote.

## 5. Components Designs owns (build to these)
- **Infinite canvas** — the studio surface; pan/zoom on navy, one red selection at a time.
- **Direct-edit handles** — drag, resize, recolor; red on the active control, instant response.
- **Embed-safe inspector** — edits real JS/CSS/HTML and preserves hidden embeds; shows what it
  will and won't touch before it touches it.
- **Model toggle** — local stub by default, your key via OpenRouter; honest about which is live.
- **Chips** — mono, hairline `color-mix(--acc 26%, line)`, faint red fill — front-page recipe.

## 6. Acceptance — "is it complementary?"
A Designs screen passes when, next to the front-page Designs card, a stranger says "same
product": (1) navy surface (shared with SunSponge), not generic grey; (2) red = the live
selection and is *rare*; (3) the infinite canvas is the hero, not a generic editor panel;
(4) type & spacing are foundation tokens; (5) the relay copy ("finish the last 10%",
"Hand it to Designs", "→ SunSponge") and the MIT line are present; (6) an edit answers with no
visible model round-trip. If any fail, it's drifting from the page.

---
*Handoff: copy into `rhobear-designs` repo (siloing canon — one project, one repo). Maintained
as the cross-product source of truth by the marketing/design lane; the Designs Iron Man builds
the UX to satisfy §6.*
