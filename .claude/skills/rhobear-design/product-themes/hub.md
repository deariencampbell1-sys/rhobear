---
name: rhobear-theme-hub
description: Portable design-theme handoff for RHOBEAR Hub, the flagship desktop harness and stop 1 of the relay. Pins the Hub's theme layer (deep-space teal surface + accent + bear-tint + voice + relay position) on top of the shared RHOBEAR foundation, so the desktop app reads as the front door of the whole ecosystem. The Hub is where the loop opens and closes.
user-invocable: true
metadata:
  product: rhobear-hub
  surface: deep-space
  accent: "#7dffd5"
---

# RHOBEAR Hub — design theme (handoff)

> **What this is.** The marketing front page is the canonical tone/spacing/motion
> reference for the ecosystem. This file is the *Hub slice* of it: the one accent, the
> surface mode, the voice, and the Hub's place in the hand-to-hand relay. The Hub is
> **stop 1** — it is also the front door, so its theme IS the master teal the rest of the
> family is sampled from. You do not re-invent the system here; you set the reference for it.

## 0. Inheritance — read these first, don't duplicate them
- **`ECOSYSTEM-MAP.md`** — the relay graph. Hub is stop 1; it opens the loop and Sales
  closes it back here.
- **`colors_and_type.css`** (rhobear-design skill) — the 4-pt spacing grid (`--s-1..--s-32`),
  type ramp (`--fs-*`), radius, motion (`--ease-soft`, `--dur-*`), dashed-stitch border.
- **`CONSTELLATION.md`** (rhobear-design skill) — the deep-space North Star: live PixelDust
  starfield, dark-glass surfaces, "quiet luxury / premium calm." The Hub sits dead-center on it.
- **The front page** `ui_kits/marketing-site/index.html` — Hub is **stop 1** of the relay.

## 1. The one feeling
**The room turns on with you in it.** The Hub is a calm command deck, not a dashboard.
Black void, teal running lights, the crew already on deck and the last session restored
the moment it boots. Warm, lived-in, never busy. Teal is "alive and ready," never alarm.

## 2. Theme layer — the only Hub-specific tokens

```css
/* Hub theme — the master teal; the rest of the family hue-rotates off this */
:root[data-product="hub"] {
  --bg:        #04060c;   /* page void (the canonical master void)        */
  --bg-2:      #070b16;   /* recessed panel                              */
  --bg-3:      #0b1424;   /* card / window surface                       */

  /* THE accent — teal. "Online, on deck, ready." The running-lights color. */
  --acc:       #7dffd5;   /* master teal                                 */
  --acc-hi:    #9affe0;   /* hover / emphasis on dark                    */
  --acc-glow:  rgba(125,255,213,0.18);
  --gold:      #ffd76a;   /* the one north-star note (logo star, rare)   */

  /* bear avatar tint — the base logo already reads teal; barely touch it */
  --bear-tint: hue-rotate(0deg) saturate(1.1);
}
```

- **Accent discipline:** teal is the live state — active tab, connected crew, the cursor
  of attention. One gold note allowed per view (the north-star mark), nothing more gold.
- **Hover deepens, never fades** (Constellation rule): `--acc → --acc-hi`.
- **`em` is teal, never italic** (foundation rule).

## 3. Motion (inherit; one signature)
Foundation durations/eases. The Hub's signature is the **boot wake**: on cold start the
room comes up in three calm beats (rails greet → codec drops → crew wires in), each a
soft fade-up, never a spinner. Steady-state is still; the crew strip breathes faintly.
Mirror the front-page calm — no bounce, no confetti.

## 4. Voice & the relay
Hub is **stop 1**; it opens the loop and is where Sales returns it.

- **Receives from:** Sales, closing the loop — "↺ … and back to the Hub for the next product."
  The Hub is home base; every cycle starts and ends here.
- **Hands off to:** Designs — "Got something built? **Hand it to Designs to make it yours.**"
- **In-product framing:** "One hub for every model you use. Your crew lives on the desktop,
  no terminal required." Pi, Plot, OpenClaw, and OpenRouter all flow through it; any model is
  a tab away; run more than one harness at once. Skills, lessons, and a ready crew are baked
  in to **teach** you, not gatekeep. Hub-to-hub: one at home, one at work.
- **Tone:** warm, plain, teacherly. The Hub welcomes; it never lectures. Never name a
  competitor. $47 one-time — state the price flat, no urgency theater.

## 5. Components the Hub owns (build to these)
- **The one window** — single shell, crew strip always visible, tabs inside (Hub · Agents ·
  Board · Vault · Skills · Worlds). Never a five-app alt-tab.
- **Crew strip** — teal-lit avatars on deck, last session restored. The "room is populated" cue.
- **Boot sequence** — the three-beat wake (§3), greeting the user by name.
- **Voice-first composer** — mic in, transcript lands in the active prompt.
- **Chips** — mono, hairline `color-mix(--acc 26%, line)`, faint teal fill — front-page recipe.

## 6. Acceptance — "is it the front door?"
A Hub screen passes when, next to the front-page Hub card, a stranger says "same product":
(1) master void `#04060c`, teal running lights, not generic grey/blue; (2) teal = live
state and is purposeful, one gold note max; (3) one window, crew strip present, no alt-tab
sprawl; (4) type & spacing are foundation tokens; (5) the relay copy is present — it welcomes
the loop back from Sales and hands off to Designs; (6) it teaches, never gatekeeps. If any
fail, it has stopped being the front door.

---
*Handoff: the Hub is this lane's own product (rhobear-app repo). Maintained as the master
teal reference for the ecosystem; all other product themes hue-rotate off this one.*
