---
name: rhobear-ecosystem-map
description: The from-above relay graph for the whole RHOBEAR product ecosystem. The single source of truth for the six stops, their accents, their place in the hand-to-hand workflow, and the exact connective wording each product surface must echo. Every per-product theme skill (hub/designs/sunsponge/reviews/plans/sales) inherits its relay position and handoff lines from here. Marketing/design lane owns this file; product Iron Men build to it.
user-invocable: true
metadata:
  type: reference
  surface: deep-space
  master_accent: "#7dffd5"
---

# RHOBEAR ecosystem — the relay map (from above)

> **What this is.** The marketing front page (`ui_kits/marketing-site/index.html`,
> the `#workflow` relay) is the canonical spine. This file is that spine written down
> so it can be enforced across separately-owned product repos. Each product surface is
> built in its own repo by its own Iron Man — this map is how they stay one world.
> **Read this before authoring any `product-themes/<product>.md`.**

## 0. The one sentence
**One workflow that hands off to itself.** A user follows a product from an idea to its
first paying customer without ever leaving the family. Build it → shape it → capture it →
keep it clean → take it to market → it sells itself → and back to the Hub for the next one.

## 1. The six stops (locked — MANIFEST §1)

| # | Product | Verb on card | Accent | Hex | `--bear-tint` | Surface destination |
|---|---|---|---|---|---|---|
| 1 | **RHOBEAR Hub** (flagship harness) | Build it | teal | `#7dffd5` | `hue-rotate(0deg) saturate(1.1)` | `app.html` (the Hub story on this site) |
| 2 | **RHOBEAR Designs** (OSS · MIT) | Shape it | red | `#e94560` | `hue-rotate(180deg) saturate(1.25)` | `github.com/deariencampbell1-sys/rhobear-designs` |
| 3 | **SunSponge Captures** (OSS · not AI) | Capture it | amber | `#f5a524` | `hue-rotate(235deg) saturate(1.3)` | `github.com/deariencampbell1-sys/sunsponge` |
| 4 | **RHOBEAR Reviews** (+ Verifies feature) | Keep it clean | gold | `#ffb800` | `hue-rotate(250deg) saturate(1.35) brightness(1.05)` | `reviews.rhobear.ai` · install `github.com/apps/rhobear-reviews` |
| 5 | **RHOBEAR Plans** | Take it to market | purple | `#7c5cff` | `hue-rotate(90deg) saturate(1.2)` | `plans.rhobear.ai` · install `github.com/apps/rhobear-plans` |
| 6 | **Sales, by RHOBEAR** | And it sells itself | blue | `#60a5fa` | `hue-rotate(55deg) saturate(1.25)` | `sales.rhobear.ai` |

Master brand stays **deep-space, teal + gold, never orange**. Shared neutrals:
teal `#7dffd5` / dim `#48d8b0`, gold `#ffd76a`, void `#04060c`. SunSponge + Designs
also share navy `#1A1A2E`. Org home: `github.com/rhobear-ai`.

## 2. The handoff chain — exact connective wording (copy verbatim)

This is the through-line. Each line lives on the front-page card *and must echo on the
product's own surface* so the workflow reads continuous in both directions.

1. **Hub → Designs:** "Got something built? **Hand it to Designs to make it yours.**"
2. **Designs → SunSponge:** "Looks the way you want? **Rest the finished site in SunSponge.**"
3. **SunSponge ∥ Reviews:** "All the while, **every PR runs through Reviews.**" *(parallel,
   not sequential — Reviews is the gate running the whole time, not a later step.)*
4. **Reviews → Plans:** "Clean and built? **Take it to market with Plans.**"
5. **Plans → Sales:** "And the rep that answers your leads? **Sales proves it closes.**"
6. **Sales ↺ Hub:** "↺ … **and back to the Hub for the next product.**"

## 3. The cross-link contract (what "links lead to one another" means)
Every product surface, no matter who builds it, must carry:
- **Back to the family:** a link home to `rhobear.ai` (the front door / relay).
- **Receives-from:** a one-line nod to the stop that hands work *in* (its inbound handoff).
- **Hands-off-to:** the outbound handoff line (above), linking to the next stop's surface.
- **Same chips language:** mono, hairline `color-mix(--acc 26%, line)`, faint accent fill —
  the front-page `.chips span` recipe, re-accented. Chips read as siblings across surfaces.
A surface that doesn't name where work came from and where it goes next is an orphan,
not a stop. The relay is the product.

## 4. Honest framing (locked — MANIFEST §3; binds every surface)
- **BYO-key / freemium / own-your-data.** Local-first, your key no markup, "for the price
  of a domain." Say it plainly; don't dress it up.
- **Never name a competitor.** Allies are named warmly (Pi, Plot, OpenClaw, OpenRouter).
  Saguaro is a *client/example*, never the brand.
- **No fake numbers, no hype verbs.** State what it does. The relay sells the relay.
- **Local model is honest about itself** (Plans = Qwen-4B on-device; Sales = Qwen-3B;
  Ursa = our onboard LLM for big moves). We never train on your data — say so on Plans.

## 5. Per-product skill = a slice of this map
Each `product-themes/<product>.md` pins only what is product-specific: its one accent,
surface mode, bear-tint, the one feeling, the components it owns, and **its two relay lines
from §2** (inbound + outbound). Everything else — spacing, type, radius, motion, the
deep-space base — comes from `colors_and_type.css` + `CONSTELLATION.md`. Template + the
gold standard for the format: **`reviews.md`** (stop 4). Match its section headings exactly.

## 6. Status
- ✅ Front-page relay spine (`index.html #workflow`) — live.
- ✅ `reviews.md` (stop 4) — done; the format template.
- ☐ In progress: `hub.md` (1), `designs.md` (2), `sunsponge.md` (3), `plans.md` (5), `sales.md` (6).
