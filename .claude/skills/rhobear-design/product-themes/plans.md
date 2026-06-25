---
name: rhobear-theme-plans
description: Portable design-theme handoff for RHOBEAR Plans, the local-first business cockpit and stop 5 of the relay. Pins the product's theme layer (deep-space purple surface + accent + bear-tint + voice + relay position) on top of the shared RHOBEAR foundation, so the Plans UX reads complementary to the marketing front page. Copy this file into the rhobear-plans repo; the product Iron Man builds the UX to match it.
user-invocable: true
metadata:
  product: rhobear-plans
  surface: deep-space
  accent: "#7c5cff"
---

# RHOBEAR Plans — design theme (handoff)

> **What this is.** The marketing front page is the canonical tone/spacing/motion
> reference for the ecosystem. This file is the *Plans slice* of it: the one accent, the
> surface mode, the voice, and Plans' place in the hand-to-hand relay — everything the
> Plans UX needs to feel like the same world as the front door. **You do not re-invent the
> system here.** Spacing, type, radius, motion come from the shared foundation (below);
> this file only pins what is *Plans-specific*.

## 0. Inheritance — read these first, don't duplicate them
- **`ECOSYSTEM-MAP.md`** — the relay graph. Plans is **stop 5**: it receives clean, built
  work from Reviews and hands the closing rep to Sales.
- **`colors_and_type.css`** (rhobear-design skill) — the 4-pt spacing grid, type ramp,
  radius, motion, dashed-stitch border. Use the tokens verbatim; don't hardcode pixels.
- **`CONSTELLATION.md`** (rhobear-design skill) — the deep-space North Star: live PixelDust
  field (Plans carries it subtler), dark-glass surfaces, premium calm. Plans sits on this canvas.
- **The front page** `ui_kits/marketing-site/index.html` — Plans is **stop 5** of the relay.

## 1. The one feeling
**Run your business where your agents read it.** Plans is a quiet cockpit, not a CRM wall.
Black surfaces, one purple note for the live/active thread, calendar accents kept muted.
It started as a handoff dock — the crew writes each build's path in Mermaid so drift shows
at a glance — and grew into the whole back office. It should feel like a calm desk that
happens to run everything, not a control panel shouting for attention.

## 2. Theme layer — the only Plans-specific tokens

```css
/* Plans theme — pin on top of the shared foundation + deep-space base */
:root[data-product="plans"] {
  --bg:        #08080f;   /* page void (matches plans.rhobear.ai)        */
  --bg-2:      #0c0c1a;   /* recessed panel                             */
  --bg-3:      #11122a;   /* card surface                               */

  /* THE accent — purple. The "live / active" note. Use it sparingly. */
  --acc:       #7c5cff;   /* purple                                     */
  --acc-hi:    #9b82ff;   /* hover / emphasis on dark                   */
  --acc-glow:  rgba(124,92,255,0.18);

  /* calendar accents — muted, never compete with the purple active note */
  --cal-personal: #7c5cff;  /* purple  */
  --cal-site:     #48d8b0;  /* teal    */
  --cal-support:  #f5a524;  /* amber   */
  --cal-billing:  #4ade80;  /* green   */

  /* bear avatar tint — recolors the teal logo to read purple */
  --bear-tint: hue-rotate(90deg) saturate(1.2);
}
```

- **Accent discipline:** purple is the *live thread* — the active calendar, the booked slot,
  the bot that's talking. Everything else is ink-on-black. If purple is everywhere, "active"
  loses meaning. Calendar category accents stay muted so the active note still reads.
- **Hover deepens, never fades:** `--acc → --acc-hi`.
- **`em` is purple, never italic** (foundation rule, re-accented).

## 3. Motion (inherit; one signature)
Foundation durations/eases. Plans' one signature is the **slot-fires beat**: when a booking
lands and the downstream (Zoom link, email, the bot's reply) fires, the live row gets a
single soft purple pulse, once, then rests. Mirror the front-page `sellPulse` at low
intensity. The Mermaid handoff diagrams render calmly, no animated edges.

## 4. Voice & the relay
Plans is **stop 5** in the hand-to-hand relay. Connective copy that must echo on the Plans
surface so the workflow reads continuous from the front page into the product:

- **Receives from:** Reviews — "Clean and built? **Take it to market with Plans.**" Plans is
  where checked, shipped work turns into a running business.
- **Hands off to:** Sales — "And the rep that answers your leads? **Sales proves it closes.**"
- **In-product framing:** "Run your business in the same place your agents read it." Calendar +
  appointments; PayPal and Stripe forms that track every sale; booking templates matched to
  your site; Zoom and email that fire the moment a slot books. **One Telegram bot per calendar**
  (personal, work, business) handling invites and email — you just talk to it. A local
  **Qwen-4B** keeps tokens cheap and reads your email on-device; for big moves (sharp diagrams,
  always-on crons wired to your own cloud) switch to **Ursa**, our onboard LLM.
- **Tone:** plain, owner-voice where it's real ("I built Plans as a handoff dock first…").
  **We don't train on your data — say it on the page.** Never name a competitor. No fake metrics.
- **Install paths:** the web surface is `plans.rhobear.ai`; the GitHub App is
  `github.com/apps/rhobear-plans`. Name both where a user would act.

## 5. Components Plans owns (build to these)
- **Handoff dock** — the Mermaid board where each build's path is drawn; the origin feature.
  Dark-glass, purple only on the active/drifted node.
- **Calendar + booking** — muted category accents (§2), purple on the active slot/thread.
- **Payment + booking forms** — PayPal/Stripe, black-glass card language, sale tracked inline.
- **Bot-per-calendar panel** — one bot each for personal/work/business; a settings log per bot.
- **Privacy line** — the Qwen-4B "on-device, nothing leaves your machine" note, stated plainly.
- **Chips** — mono, hairline `color-mix(--acc 26%, line)`, faint purple fill — front-page recipe.

## 6. Acceptance — "is it complementary?"
A Plans screen passes when, next to the front-page Plans card, a stranger says "same product":
(1) black surface, not generic grey; (2) purple = the live/active note and is *rare*; calendar
accents stay muted; (3) the Mermaid handoff dock is present (it's Plans' origin, not a generic
calendar); (4) type & spacing are foundation tokens; (5) the relay copy ("Take it to market",
"→ Sales") and the privacy line are present; (6) it never claims to train on your data. If any
fail, it's drifting from the page.

---
*Handoff: copy into `rhobear-plans` repo (siloing canon — one project, one repo). Maintained
as the cross-product source of truth by the marketing/design lane; the Plans Iron Man builds
the UX to satisfy §6.*
