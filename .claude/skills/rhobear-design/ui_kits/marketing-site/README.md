# Marketing site — UI kit

The 20-page story-flow website for RHOBEAR. Each `.html` is a short page on one topic, linked via the top nav + a sticky prev/next bar. Substrate-first, ingredients-later.

## Open it

Double-click any `.html` file. No build step, no server. All assets come from `../../assets/` (the flat sibling folder at the project root).

## Pages

| # | File | Topic |
|---|------|-------|
| 01 | `index.html` | Home — hero, 9-pillar ribbon, integration marquees, "It's lean." callout, install |
| 02 | `crew.html` | The six characters as roles |
| 03 | `hub.html` | One window, six tabs |
| 04 | `workbench.html` | 3-pane Cursor-2.0 workbench |
| 05 | `drop-in.html` | Drop a model card on a lane |
| 06 | `ease-of-use.html` | OAuth, voice, Telegram |
| 07 | `goal-autoloop.html` | `/goal` + autoloop hero |
| 08 | `judgment-loop.html` | The judge decision engine |
| 09 | `substrate.html` | Substrate overview, ingredients-vs-recipe |
| 10 | `compass.html` | Goal system + judge + autoloop + orchestrator |
| 11 | `worker-sessions.html` | Store + event stream + adapter contract |
| 12 | `handoff-bus.html` | Router, envelope, message bus, aggregator |
| 13 | `safety-registry.html` | Gates, registry, drift sync, neo mode |
| 14 | `hub-contract.html` | Visible workers contract |
| 15 | `openclaw.html` | Local bridge (we integrate, didn't build) |
| 16 | `built-with.html` | All 10 ingredients with receipts + hero stats |
| 17 | `worlds.html` | Three reskins — SPACE / WEST / NEON |
| 18 | `story.html` | Founder pull-quote, lesson band |
| 19 | `faq.html` | Six verbatim Q&A |
| 20 | `closer.html` | Curtain call + "It's yours." |

## Components in here

- **Shell** (`shell.css`) — top nav + sticky prev/next + footer.
- **Card patterns** — `card-paper.stitched feature-card` (the default), `card-paper.stitched paired` (HOOK/TECH split).
- **Marquee** — two-row opposite-direction logo scroller, pause-on-hover.
- **Terminal block** — `.terminal` with role-coloured speakers, used in every CLI trace.
- **Sprite perch** — `.sprite-tr / .sprite-tl / .sprite-br / .sprite-bl` for character placement, plus `.bob` for the idle loop.
- **Worlds card** — `.world-card` with full-bleed background and sprite-in-scene drop-shadow (this is the lifelike-realism anchor).
- **9-pillar ribbon** — `.pillar-ribbon` containing `.chip-amber` chips.
- **Receipt** — built-with.html per-ingredient block: logo + stars pill + repo link + 5 bullet subsections.

## Notes

- All character images get `image-rendering: pixelated` so browser scaling doesn't soften the pixel art.
- Sprite drop-shadows use `filter: drop-shadow()` (not box-shadow) so they follow the silhouette.
- No webfonts loaded. Pixel-display family relies on OS-installed Silkscreen / Press Start 2P / VT323 with monospace fallback.
- Animations gated on `prefers-reduced-motion: no-preference`.
