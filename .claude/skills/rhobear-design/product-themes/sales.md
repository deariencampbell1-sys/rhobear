---
name: rhobear-theme-sales
description: Portable design-theme handoff for Sales, by RHOBEAR, the done-for-you white-glove sales chatbot running on a tiny on-device Qwen-3B, and stop 6 of the relay that closes the loop back to the Hub. Pins the product's theme layer (deep-space blue surface + accent + bear-tint + voice + relay position) on top of the shared RHOBEAR foundation, so the Sales UX reads complementary to the marketing front page. Copy this file into the sales repo; the product Iron Man builds the UX to match it.
user-invocable: true
metadata:
  product: sales
  surface: deep-space
  accent: "#60a5fa"
---

# Sales, by RHOBEAR — design theme (handoff)

> **What this is.** The marketing front page is the canonical tone/spacing/motion
> reference for the ecosystem. This file is the *Sales slice* of it: the one accent, the
> surface mode, the voice, and Sales' place in the hand-to-hand relay — everything the
> Sales UX needs to feel like the same world as the front door. Sales is **stop 6**: it
> closes the loop back to the Hub. **You do not re-invent the system here.** Spacing, type,
> radius, motion come from the shared foundation (below); this file only pins what is
> *Sales-specific*.

## 0. Inheritance — read these first, don't duplicate them
- **`ECOSYSTEM-MAP.md`** — the relay graph. Sales is **stop 6**: it receives the closing rep
  from Plans and loops the visitor back to the Hub for the next product.
- **`colors_and_type.css`** (rhobear-design skill) — the 4-pt spacing grid (`--s-1..--s-32`),
  type ramp (`--fs-*`), radius, motion (`--ease-soft`, `--dur-*`), dashed-stitch border.
  Use the tokens verbatim; don't hardcode pixels.
- **`CONSTELLATION.md`** (rhobear-design skill) — the deep-space North Star: live PixelDust
  field, dark-glass surfaces, premium calm. Sales sits on this canvas.
- **The front page** `ui_kits/marketing-site/index.html` — Sales is **stop 6** of the relay.

## 1. The one feeling
**This page is me doing it.** Sales is the proof, not a pitch — the chatbot greeting you is the
exact thing the owner builds for a client, running live on the page you're reading. Black-blue
surface, one blue note on the bot that's talking to you, everything else calm. White-glove and
quiet: it should feel like a concierge who already set the table, not a popup begging for a lead.
The demo *is* the sell.

## 2. Theme layer — the only Sales-specific tokens

```css
/* Sales theme — pin on top of the shared foundation + deep-space base */
:root[data-product="sales"] {
  --bg:        #060912;   /* page void (matches sales.rhobear.ai)        */
  --bg-2:      #0a0f1c;   /* recessed panel                             */
  --bg-3:      #0e1626;   /* card / chat surface                        */

  /* THE accent — blue. The "the bot is talking" note. Use it sparingly. */
  --acc:       #60a5fa;   /* blue                                       */
  --acc-hi:    #85bdff;   /* hover / emphasis on dark                   */
  --acc-glow:  rgba(96,165,250,0.18);

  /* bear avatar tint — recolors the teal logo to read blue */
  --bear-tint: hue-rotate(55deg) saturate(1.25);
}
```

- **Accent discipline:** blue is the *live conversation* — the bot's reply, the active message,
  the cursor in the chat. Everything else is ink-on-black. If blue is everywhere, "it's talking
  to you" stops landing. One thread reads blue at a time.
- **Hover deepens, never fades:** `--acc → --acc-hi`.
- **`em` is blue, never italic** (foundation rule, re-accented).

## 3. Motion (inherit; one signature)
Foundation durations/eases. Sales' one signature is the **greeting beat**: when the page loads,
the bot's first line types in once, calm, with a single soft blue pulse on its avatar — the
"someone's here" cue — then rests. It greets, it doesn't pounce. No auto-open popups, no
attention-grab loops; the bot waits for you the way a good rep does.

## 4. Voice & the relay
Sales is **stop 6** in the hand-to-hand relay, and it closes the loop. Connective copy that must
echo on the Sales surface so the workflow reads continuous from the front page into the product:

- **Receives from:** Plans — "And the rep that answers your leads? **Sales proves it closes.**"
  Sales is the rep that Plans' booking and back-office work hands the lead to.
- **Loops back to:** the Hub — "↺ … **and back to the Hub for the next product.**" Sales is the
  last stop, and it points the visitor home to start the next cycle.
- **In-product framing:** "You like these tools but you don't want to set them up. So I do it
  for you." The owner hand-builds and runs your sales page **for** you, white-glove, and *this
  page is that*. The greeting bot runs on a tiny **Qwen-3B** with no rented server and no hosting
  bill, just a domain. It's the same setup stood up for clients. **$47 one-time.** Saguaro is a
  *client/example* of that work, never the brand.
- **Tone:** warm, owner-voice, first-person where it's real ("So I do it for you"). It sells by
  being the thing, not by claiming. Never name a competitor. No fake numbers, no urgency theater.

## 5. Components Sales owns (build to these)
- **Live greeting bot** — the on-page Qwen-3B chat; blue on its replies, the demo that is the sell.
- **"This page is me doing it" panel** — the meta line that the page itself is the deliverable.
- **Done-for-you offer** — white-glove setup, $47 one-time, stated flat with no countdown.
- **Loop-home CTA** — the close that returns the visitor to the Hub to start the next product.
- **Chips** — mono, hairline `color-mix(--acc 26%, line)`, faint blue fill — front-page recipe.

## 6. Acceptance — "is it complementary?"
A Sales screen passes when, next to the front-page Sales card, a stranger says "same product":
(1) black-blue surface, not generic grey; (2) blue = the live conversation and is *rare*; (3) the
live greeting bot is the hero and reads as the proof, not a pitch; (4) type & spacing are
foundation tokens; (5) the relay copy ("Sales proves it closes", "↺ back to the Hub") is present
and the loop is closed; (6) the Qwen-3B / "no server, just a domain" honesty and the $47 price are
plain, and Saguaro reads as an example, never the brand. If any fail, it's drifting from the page.

---
*Handoff: copy into the `sales` repo (siloing canon — one project, one repo). Maintained
as the cross-product source of truth by the marketing/design lane; the Sales Iron Man builds
the UX to satisfy §6.*
