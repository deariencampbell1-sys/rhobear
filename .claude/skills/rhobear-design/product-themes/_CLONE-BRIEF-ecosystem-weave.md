cd C:\Users\slang\rhobear

The visual foundation + the Hub handshake are LIVE: the shell.js relay band now links to the
on-site product pages, app.html hands off on-site and cross-sells Plans/cloud from its Ollama
section, and Plans + Reviews have a "what it costs to run" block. Now we finish the
"everything shakes hands" weave the same split way. **Your half: four tasks below.**

## Read first (the pattern to match)
- `…/marketing-site/app.html` — see the on-site `.relay-next` + the Ollama section's
  cross-sell `<li>` linking to plans.html. That's the in-prose cross-link voice.
- `…/marketing-site/plans.html` + `reviews.html` — the "WHAT IT COSTS TO RUN" block pattern
  (two cards: a free/local path + a paid/cloud path, NO fake numbers).
- `product-themes/ECOSYSTEM-MAP.md` §2/§3 — the relay wording + honest framing.

## TASK 1 — Built-With reframing (`built-with.html`)
Rewrite the Claude / Codex / Ollama coverage so we shamelessly explain WHY we chose each, and
lean every capability back into our own ecosystem (never toward a competitor):
- **Claude Code:** why it's in our harness — the subscription path (sign in with your Claude
  sub, no per-token meter) and the quality bar we hold to. Link to app.html.
- **Codex:** we built MCP servers around it on the **OpenClaw network**; we loved its
  annotation + vision and didn't want to lose them; the zero-auth sub made it a clear win.
  And **Codex helped us design SunSponge Captures** so the crew can build products together —
  link to `sunsponge.html` right there.
- **Ollama:** bundled local model from minute one; link to app.html (the Hub) and note Plans
  runs a heavier on-device model for email with the Ursa cloud option — link `plans.html`.
Keep it honest, no fake numbers, allies named warmly.

## TASK 2 — "What it costs to run" block on designs.html, sunsponge.html, sales.html
Add the same two-card block (copy the markup from plans.html, swap the copy). Even the OSS
products get one, because they bundle a downloadable LLM:
- **designs.html (MIT):** free forever, local-LLM stub works on download · OR your own key via
  OpenRouter. No seat tax.
- **sunsponge.html (not AI):** free, deterministic, runs on your machine for almost nothing —
  no token meter because there's no model to bill.
- **sales.html:** the **$47 one-time** build, tiny Qwen-3B, no rented server / no hosting bill.
If a real price isn't known, write the honest free/paid shape and mark the number
`[owner to confirm]` — do NOT invent figures.

## TASK 3 — In-prose cross-links on the Hub-walkthrough pages
Pages: crew, workbench, worker-sessions, goal-autoloop, judgment-loop, handoff-bus,
safety-registry, hub-contract, openclaw, substrate, worlds, learn, faq, closer, compass,
drop-in, ease-of-use, story, spin-it-up. The bottom relay band auto-injects already — your job
is **1-2 contextual hyperlinks inside the prose** at the natural moment, e.g.:
- finished/built work → "run it through `reviews.html`"; running a business/calendar →
  `plans.html`; building or polishing a site → `designs.html`; screenshots/capture →
  `sunsponge.html`; closing leads/selling → `sales.html`; the harness/room → `app.html`.
Only where it reads natural. Never force it, never name a competitor.

## TASK 4 — sales.html chip hover-life
The A/B/C/D feature cards go nowhere (fine), but should feel alive: add a subtle hover lift +
border-accent transition (a `transform: translateY(-3px)` + accent border on `:hover`), scoped
in the page's `<style id="rho-tweaks-style">` block (don't touch shell.css).

## Rules
- Branch `teal-retheme`. Active checkout `C:\Users\slang\rhobear` only — never `D:\rhobear`.
- Do NOT touch shell.css, shell.js, colors_and_type.css, index.html, app.html, plans.html,
  reviews.html. Everything else listed above is yours.
- **stop-slop: zero prose em dashes** (periods/commas/colons), `·` middots in labels, active
  voice, no rule-of-three triads, owner-voice only where real.
- Honest framing: BYO-key / own-your-data, no fake numbers. Pi/Plot/OpenClaw/OpenRouter/Codex/
  Claude/Ollama are tools we USE — name them warmly. Competitors are never named.
- Commit to teal-retheme (clear message + Co-Authored-By). Do NOT push main. Do NOT deploy.
  I run the unification + the single deploy.

When done, reply "ecosystem weave: built-with + cost blocks + cross-links + sales chips done on
teal-retheme" and stop.
