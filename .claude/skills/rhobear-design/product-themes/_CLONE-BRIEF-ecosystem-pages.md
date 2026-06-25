cd C:\Users\slang\rhobear

Skills are done both sides — all six product theme skills + ECOSYSTEM-MAP.md are on
teal-retheme. Now we build the product PAGES the same way we split the skills. I built
Plans + Reviews. **Your half: three pages — designs.html, sunsponge.html, sales.html.**

## Build against these (don't re-invent)
- **Template (copy the structure exactly):** `…/marketing-site/plans.html` and `reviews.html`.
  They are full on-site product pages on the shared chassis. Mirror them: same `<head>` links,
  the `<style id="rho-tweaks-style">` per-page accent block, the standard `top-nav`, the
  `.relay-next` strip, the `prevnext`, the footer, `shell.js` at the end. **Do not touch the
  shell** — the accent is set ONLY through the `rho-tweaks-style` block in the page head.
- **Look/voice:** your `product-themes/designs.md`, `sunsponge.md`, `sales.md`.
- **Relay wording + loop order:** `product-themes/ECOSYSTEM-MAP.md` §2.
- **The card you're expanding:** each product's `.stop` card in `index.html #workflow` —
  quote its real desc/chips; don't invent product facts.

## Loop order (for prevnext + the .relay-next strip)
Hub(app.html) → **Designs(designs.html)** → **SunSponge(sunsponge.html)** → Reviews(reviews.html)
→ Plans(plans.html) → **Sales(sales.html)** → ↺ Hub.

## designs.html — stop 2, accent RED
- Head accent block:
```
:root{ --c-amber:#e94560 !important; --c-amber-deep:#ff6b81 !important;
  --c-amber-soft:rgba(233,69,96,0.16) !important; --c-amber-tint:rgba(233,69,96,0.10) !important; }
.btn-amber{ color:#fff !important; box-shadow:0 0 0 1px rgba(233,69,96,0.40),0 10px 26px -10px rgba(233,69,96,0.55) !important; }
.btn-amber:hover{ color:#fff !important; background:var(--c-amber-deep) !important; }
.eyebrow-row::before{ background:var(--c-amber) !important; }
```
  (use red in the .relay-next rules too — copy plans.html's strip and swap the rgba to 233,69,96)
- eyebrow "PRODUCT · DESIGNS · STOP 2 · SHAPE IT". nav CTA "Read the source →".
- Story: finish the last 10% by hand on an infinite canvas — drag it, swap a font, fix one color,
  no model round-trip; touches real JS/CSS/HTML with hidden embeds without wrecking them; local-LLM
  stub or your key via OpenRouter; MIT forever. Say MIT flat, it's the point.
- CTAs: "Read the source →" → https://github.com/deariencampbell1-sys/rhobear-designs ·
  "See the whole family →" → index.html#workflow.
- relay-next + prevnext: ← Hub (app.html, "The Hub") / Designs / SunSponge → (sunsponge.html).
- Inbound line "Got something built? Hand it to Designs to make it yours." / outbound "Looks the
  way you want? Rest the finished site in SunSponge."

## sunsponge.html — stop 3, accent AMBER (its real product accent — intentional, not a leak)
- Head accent block: same shape, swap to #f5a524 / deep #ffc35a / rgba(245,165,36,…). btn text #1a1300.
- eyebrow "PRODUCT · SUNSPONGE · STOP 3 · CAPTURE IT". nav CTA "Read the source →".
- Story: cheap, fast picture-taker — feed it a map, it soaks a finished site into clean screenshots
  in one pass, every page and state, for almost nothing; a swarm of captors; results pour into
  Remotion to cut hundreds of videos. **It is NOT AI — a deterministic tool. Say so; keep it honest.**
- CTAs: "Read the source →" → https://github.com/deariencampbell1-sys/sunsponge · "See the whole family →".
- relay-next + prevnext: ← Designs (designs.html) / SunSponge / Reviews → (reviews.html).
- Inbound "Rest the finished site in SunSponge." / it runs PARALLEL to Reviews ("All the while,
  every PR runs through Reviews.") — concurrent, not a later step.

## sales.html — stop 6, accent BLUE (closes the loop)
- Head accent block: same shape, swap to #60a5fa / deep #93c5fd / rgba(96,165,250,…). btn text #04140f.
- eyebrow "PRODUCT · SALES · STOP 6 · IT SELLS ITSELF". nav CTA "Get your chatbot →".
- Story: done-for-you, white-glove — "this page is me doing it." The greeting bot runs on a tiny
  Qwen-3B, no rented server, no hosting bill, just a domain. $47 one-time. Saguaro is a
  client/example, NEVER the brand. Never name a competitor. No urgency theater.
- CTAs: "Get your chatbot →" → https://sales.rhobear.ai · "See the whole family →".
- relay-next + prevnext: ← Plans (plans.html) / Sales / ↺ Hub (index.html, "Back to the Hub").
- Inbound "And the rep that answers your leads? Sales proves it closes." / it loops back to the Hub.

## Rules
- Branch teal-retheme. Active checkout C:\Users\slang\rhobear ONLY — never D:\rhobear.
- Author ONLY these three .html files. Do NOT touch shell.css/shell.js/colors_and_type.css,
  index.html, plans.html, reviews.html, or any .md.
- **stop-slop the copy: zero prose em dashes** (periods/commas/colons), no rule-of-three triads,
  active voice, no false agency, no pull-quote taglines, owner-voice only where it's real.
- Use `·` (middot) in titles/quant-lines, never `—`. Footer GitHub link = github.com/rhobear-ai.
- Match plans.html/reviews.html density. Commit to teal-retheme, clear message + Co-Authored-By.
  Do NOT push main. Do NOT deploy. I wire the home cards + run the unification + the single deploy.

When all three are committed, reply "ecosystem pages: designs / sunsponge / sales done on
teal-retheme" and stop.
