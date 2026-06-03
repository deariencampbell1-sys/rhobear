# RHOBEAR Design System

> Lean. Local. Private. Yours.

The design system for **RHOBEAR.AI** — a local-first multi-agent build hub for non-developers, indie hackers, and vibe-coders. RHOBEAR runs on your machine or a $5 VPS; the AI never leaves your box unless you say so.

This folder is the design source-of-truth: foundations (color, type, spacing), a flat asset library (sprites, world backgrounds, integration logos, app screenshots), and two UI kits — the marketing site and the desktop app.

---

## What RHOBEAR is, in one breath

RHOBEAR is the desktop app where a crew of named agents (Pops, Architect, Foreman, Guardian, Spark, Wizard) plan, build, review, and ship code together inside a single Tauri window. Owners type `/goal`, walk away, and come back to merged PRs. The substrate underneath — Compass, the judgment loop, worker sessions, the handoff bus, the safety registry, OpenClaw — is what nobody else has; the ingredients (Claude, Codex, Pi, Whisper, Ollama, MCP) are off-the-shelf.

The owner is **non-technical**. Copy must respect that without ever talking down. Visual feel: *"LittleBigPlanet meets terminal"* — warm, handmade, pixel-art characters perched on the edges of UI like paper-cutout dolls living between the viewer and the content.

### Products represented in this DS

| Product | Surface | UI kit |
|---|---|---|
| **Marketing site** | 20-page story-flow website (substrate first, ingredients later) | `ui_kits/marketing-site/` |
| **RHOBEAR app** | Tauri desktop hub — Hub, Agents, Board, Vault, Skills, CLI, Worlds, Settings | `ui_kits/app/` |

### Sources I worked from

There is no Figma file or codebase URL attached — this DS was built from:
- **~100 pre-rendered uploaded assets** (`uploads/` → now flattened into `assets/`): app screenshots `01-hub.png` … `13-voice.png`, world backgrounds (`bg-ship`, `bg-western`, `bg-neon`), character spritesheets + per-world variants, off-brand hero characters (Archer / Armored / Tinker / Brute), and a 100+ SVG logo library for integrations.
- **Brand notes & generation prompt** pasted by the owner in chat, containing voice rules, the 9-pillar ribbon, verbatim copy for the closing band, and the 20-page site spec.

If you ever get a Figma or repo link, drop it into `EXTERNAL_SOURCES.md` next to this file and re-read screens from there — pixel screenshots are lossy and the codebase is canonical.

---

## CONTENT FUNDAMENTALS

### Voice — friend-first, autonomy-first, plainspoken

The owner is non-technical. Copy must be **direct over clever**. We talk *with* the reader, never *down at* them. "You" is the default subject; "we" is RHOBEAR-the-team when we're being explicit about a choice we made.

> ✅ "Drop a model in. No keys to wire, no env to juggle — the crew is on deck the moment you sign in."
> ❌ "Leverage best-in-class orchestration to unlock seamless multi-agent workflows."

### Honesty over hype

RHOBEAR is in pre-launch. The installer isn't public yet. The site says so plainly:

> "Honest install — repo first, for now. No installer release yet. If you can clone a repo and run a build command, you can boot RHOBEAR today."

Use this register everywhere. Never claim what hasn't shipped.

### Specific over abstract

Numbers are real. Receipts are receipts.
- "★129,446" — actual GitHub stars, not "thousands of"
- "ggml-base.bin is ~145MB, runs warm in 300-800ms on a normal laptop"
- "Built it on the side. Not a coder by trade — but knows how to build a house from its foundation. That's all it took."

### Casing

| Use | Casing |
|---|---|
| H1 / page titles | Sentence case ("Your AI, your data, your call.") |
| H2 / section headers | Sentence case |
| Eyebrows above sections | **ALL CAPS · MONO · LETTER-SPACED** ("SECTION · STORY · 02 / 20") |
| Nav items | UPPERCASE in pixel-display |
| Button labels | UPPERCASE in pixel-display ("SPIN IT UP") |
| Body | Sentence case, real punctuation |
| Character names in body | All-caps when introduced ("**ARCHITECT** plans."), title case otherwise |
| Footer micro-line | "Lean. Local. Private. Yours." — title case with periods, displayed mono small-caps |

### The 9 pillars (memorize these)

```
LEAN  ·  $5 VPS  ·  COST-EFFICIENT  ·  LOCAL  ·  PRIVATE  ·  CUSTOMIZABLE  ·  EASY  ·  TRUSTWORTHY  ·  YOURS
```

These appear as an amber-dashed pill ribbon on `index.html` under the hero, and again as the closing callout band. **Don't paraphrase.** They're the brand contract.

### Verbatim copy that must not drift

- **Closing callout band, every word:**
  - H2: "It's lean."
  - Body: "It can be spun up on a $5 VPS. It's cost-efficient. It's local. It's private. It's completely customizable. It's easy. It's trustworthy."
  - Closer (display, large): "It's yours."
- **Founder pull-quote** on `story.html` — verbatim, every word, no edits.
- **All 6 FAQ Q&A** on `faq.html` — verbatim.
- **Frame:** "Day one. Not month one."
- **Deeper line:** "He didn't learn to code. He learned to communicate with a coding fleet."

### Names to use / never use

| ✅ Use | ❌ Never |
|---|---|
| Pops, Architect, Foreman, Guardian, Spark, Wizard | Avengers / Iron Man / Hulk / Captain America |
| Builder, Designer, Reviewer (expansion crew) | Doctor Strange / Black Widow / any Marvel canon |
| Archer, Armored, Tinker, Brute (hero characters) | Anything trademarked or fan-named |

### Emoji & special chars

- **Emoji**: avoid. The brand voice is pixel-art, not emoji-art. The one exception: `📬` in CLI traces simulating a Telegram push is fine because that's what the user sees on their phone — quote, don't decorate.
- **Unicode `·`** (middle dot) is the universal separator. Use it between nav items, between quant pills, between CLI args.
- **Em dashes** (—) are welcome. They match the voice. Hyphens are not em dashes.
- **Curly quotes** — use them in body copy. Straight quotes belong in code.

---

## VISUAL FOUNDATIONS

### Mode

**Default = light.** Warm off-white paper base (`--c-bg #f6efe1`), dark charcoal ink (`--c-ink #1a1714`). One bright accent — warm amber (`--c-amber #f59e2c`, deeper `--c-amber-deep #d97a1a`). Dark mode exists as a **band**, not a whole-page toggle: drop a `.band-dark` section inside a light page for Install, CLI traces, "why this matters most" callouts. The band uses navy-black (`#0d1220`) + cyan (`--c-cyan #7dffd5`).

### Color

| Token | Hex | Use |
|---|---|---|
| `--c-bg` | `#f6efe1` | Page paper |
| `--c-bg-2` | `#eee4d0` | Recessed paper |
| `--c-surface` | `#fbf6ea` | Card surface (default) |
| `--c-ink` | `#1a1714` | Body & headings |
| `--c-ink-3` | `#6b5f51` | Muted body |
| `--c-amber` | `#f59e2c` | Accent — buttons, links, em |
| `--c-amber-deep` | `#d97a1a` | Hover / pressed / emphasis text |
| `--c-amber-soft` | `#fde0b6` | Tint bg for amber pills |
| `--c-dark-bg` | `#0d1220` | Dark band background |
| `--c-cyan` | `#7dffd5` | Dark-band accent, active worker, world: Space |
| `--c-status-ok` | `#4fd6a9` | Vetted / pass |
| `--c-status-warn` | `#f5c84c` | Community / caution |
| `--c-status-error` | `#ef6079` | Unvetted / blocked |
| `--c-world-west` | `#f59e2c` | Frontier world accent |
| `--c-world-neon` | `#d472f0` | Neon Tokyo world accent |

Full table → `colors_and_type.css`.

### Typography

- **Display family**: pixel-art system stack — Silkscreen / Press Start 2P / VT323 with monospace fallback. Used for H1–H3, nav, button labels, eyebrows. **No webfonts.** If a user has Silkscreen installed it renders crisp; otherwise the OS monospace renders the same pixel cadence.
- **Body**: system sans (`-apple-system`, `Segoe UI`, etc.) at 16-18px. Line-height 1.6. Body never goes below 16px.
- **Mono**: OS mono for CLI blocks, badges, eyebrows.
- **Hero H1**: 4–6rem, clamped (`clamp(3.25rem, 6.5vw, 5.5rem)`).
- **`<em>` is amber**, not italic. Used for the emphasis word in a headline ("Your AI, *your data*, your call.").
- **Font substitution note**: no Silkscreen / Press Start 2P TTFs are bundled — we rely on OS fallback. If the owner wants pixel-perfect rendering across browsers, ship the Silkscreen .woff2 from Google Fonts mirror into `fonts/`. **FLAGGED for review.**

### Backgrounds

- **Paper-grain**: subtle 4px and 7px radial-dot noise at low opacity, baked into `.card-paper` as a `background-image` gradient. No images required — it's CSS.
- **Full-bleed environmental backgrounds**: the three world cards on `worlds.html` use `bg-ship.png`, `bg-western.png`, `bg-neon.png` at full bleed. These are the *only* place hand-painted environments appear at hero scale; everywhere else the paper-grain surface owns the canvas.
- **No gradients as decoration.** Especially: no bluish-purple gradients. The brand is warm light + one dark band + one accent.

### Cards

- Radius: 12–22px depending on hierarchy (`--r-3` to `--r-5`).
- Soft drop shadow — warm, not crisp (`--shadow-card`). The shadow color is brown-leaning, not gray.
- **Stitched dashed inner border** (1.5px dashed `#2a221b`, inset 6px) on key cards — the sewn-edge LittleBigPlanet signature. Use `.card-paper.stitched`.
- Inner highlight on top edge via `inset 0 1px 0 rgba(255,255,255,0.45)` — the "paper has a top fold" feel.

### Spacing

4-pt grid. Tokens `--s-1`..`--s-32`. Generous whitespace is the default — hero sections breathe, cards have plenty of internal padding (24-32px typically), the 9-pillar ribbon has gap 12-16px between chips.

### Animation

- **Easing**: `cubic-bezier(.22,.61,.36,1)` — soft, settled (`--ease-soft`). For pop moments, `--ease-out-back`.
- **Durations**: 140 / 240 / 420ms.
- **Marquees** (logo rows): 52s and 64s opposite directions, pause-on-hover. Linear easing.
- **Sprite bob**: perched characters bob `translateY(-3px)` over 2.4s ease-in-out, infinite. Wrap any sprite in `.bob`.
- **Card hover**: subtle lift (`translateY(-1px)` on buttons, `-2px` on feature cards), shadow grows slightly. No tilt, no parallax.
- **Reduced motion**: `@media (prefers-reduced-motion: no-preference)` gates all loops. Default = no animation.
- **No infinite decorative loops** on slide content; only marquees and sprite bobs.

### Hover / press states

- **Buttons**: hover deepens color one step and lifts 1px; active drops back to 0.
- **Links**: amber → amber-deep on hover, dashed underline always visible (not just on hover).
- **Cards**: feature cards lift `-2px` and shadow deepens; reading cards don't react.
- **Tab nav**: active tab gets `--c-amber-soft` background + `--c-amber-deep` text. Inactive tabs are ink-2.
- **No opacity-fade hovers** — color shifts are warmer than fades.

### Borders

- Hair `1px` on inputs and dividers (`--c-line`).
- Card `1.5px` solid on the rare visible border (`--c-line-strong`).
- **Stitch `1.5px dashed`** — the signature. Used on inner borders of `card-paper.stitched`, on chip-mono, on chip-amber.

### Transparency & blur

- Used sparingly. The header bar has `backdrop-filter: blur(10px)` on a 70%-alpha paper background when sticky.
- Card surfaces are **never** translucent — paper doesn't see through.
- Modal scrims: `rgba(26,23,20,0.55)`.

### Imagery

- **Warm**, not cool. Even the Neon world (which is purple/cyan/magenta) is warm because of the orange-lantern key light.
- All character renders are **pixel-art** with hard edges — apply `image-rendering: pixelated` so browser scaling doesn't smooth them.
- Sprites get a soft drop-shadow on `worlds.html` ("character is physically inhabiting the space") via `filter: drop-shadow(0 6px 4px rgba(0,0,0,0.45))`.

### Layout rules

- **Sticky top nav**, ~60-72px tall, paper background w/ blur.
- **Sticky prev/next** bar at the bottom of every marketing page.
- Max content width: 1200px on most pages, 1320px on the homepage hero, 880px on the founder quote.
- Three-pane layouts (the workbench) use CSS Grid: `grid-template-columns: 280px 1fr 360px` with `gap: 12px`.
- Card grids use `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`.

### Character placement (the signature move)

Sprites perch on UI like dolls. Never tiny floating accents. Every page picks **1-3 characters as page-level features at 200-400px**. Poses that work:
- Sitting on the top-right corner of a card with one foot kicking down off the canvas edge
- Leaning against the left edge of a code block
- Walking along the bottom rail of a hero section
- Hanging off the top-right corner of a stat card
- Peeking from behind a screenshot

Implementation pattern: position the sprite `absolute` relative to the parent card with `bottom: -40px; right: -20px` (or similar) so the silhouette breaks out of the card's bounding box. Apply `.bob` for the idle loop. Apply `.pixelated` for sharp edges.

---

## ICONOGRAPHY

### The system: SVG logos + pixel-art screenshots

There is **no icon font and no Lucide/Heroicons substitution** in this brand. The "iconography" is:

1. **Hand-painted pixel-art characters** — the RHOBEAR crew (Pops, Architect, Foreman, Guardian, Spark, Wizard), the expansion crew (Builder, Designer, Reviewer), and the off-brand heroes (Archer, Armored, Tinker, Brute). Each has 3 world variants (`_ship.png`, `_western.png`, `_neon.png`) plus action poses (`-walk`, `-east`). Reference these for personality; sprite-sheet versions exist (`*-spritesheet.png`) for animation.
2. **Real third-party SVG logos** for integrations — Claude, OpenAI, Anthropic, Ollama, GitHub, Tauri, Obsidian, Python, Rust, TypeScript, Telegram, Discord, Stripe, Pi, MCP, Aguara, CodeGraph, OpenClaw, Slack, Amazon, Notion, Figma, Linear, Jira, Dropbox, Google Drive, SQLite, React, Docker, Vercel, Cloudflare, GitLab, WhatsApp, Google Gemini, Meta. All live in `assets/<name>.svg`.
3. **Brand mark** — `assets/rhobear-mark.png`. A 32×32 pixel-art panda/bear head in candy-colored squares. Renders pixelated. Used in the top-left of every page and as a watermark on dark surfaces.
4. **Product screenshots** as iconography of features — `01-hub.png` (hub), `02-agents.png` (workbench), `03-board.png`, `04-learn.png`, `05-skills.png`, `06-catalog.png`, `07-vault.png` (+ `07b-vault-graph.png`, `07c-vault-note.png`), `08-cli.png`, `09-worlds.png`, `10-settings.png`, `13-voice.png`, `agents-compare.png`, `agents-mobile.png`, `agents-workbench.png`. These show up as full-width hero illustrations on their respective subject pages — they *are* the icon of that feature.

### Emoji / unicode

- **Emoji**: don't use them as iconography. One narrow exception: `📬` inside a simulated Telegram CLI line is OK because it's the literal thing the user sees on their phone.
- **Unicode dots & dividers**: `·` everywhere. `→` and `←` for prev/next CTAs. `▾` for dropdown affordance. `★` for the GitHub stars badge.

### Asset organization (mandatory)

All assets sit in **one flat `assets/` folder at the root**. No sub-folders. Examples:
- `assets/rhobear-mark.png` — brand mark
- `assets/bg-ship.png` — world background
- `assets/architect_ship.png` — themed crew variant
- `assets/pops-spritesheet.png` — 4-frame sprite sheet (slice frame for stills)
- `assets/hero-archer-ship.png` — off-brand hero character
- `assets/crew-builder-ship.png` — expansion crew
- `assets/claude.svg` — integration logo
- `assets/01-hub.png` — product screenshot

UI kit files reference assets relatively: `../../assets/<file>` from inside `ui_kits/<product>/`.

### Substitution notes

- **Lucide / Heroicons / Material Icons**: not used. If a marketing page calls for a generic UI glyph (mic, arrow, lock), draw it inline as a small SVG with the amber stroke or use a Unicode character. Do not pull from a CDN.
- **Webfont icon families** (FontAwesome, etc.): not used.

---

## File index — what's in this folder

```
RHOBEAR Design System/
├── README.md                 ← this file
├── SKILL.md                  ← agent-skill manifest (cross-compatible w/ Claude Code)
├── colors_and_type.css       ← all design tokens (color, type, spacing, motion)
├── assets/                   ← FLAT asset library, ~103 files
│   ├── rhobear-mark.png
│   ├── bg-{ship,western,neon}.png
│   ├── {pops,architect,foreman,guardian,spark,wizard}-spritesheet.png
│   ├── {pops,architect,...}_{ship,western,neon}.png  ← per-world variants
│   ├── crew-{builder,designer,reviewer}-{ship,western}.png
│   ├── hero-{archer,armored,tinker,brute}-{ship,western,neon,walk,east}.png
│   ├── {claude,openai,ollama,github,...}.svg          ← 35+ integration logos
│   └── {01-hub,02-agents,...,13-voice}.png            ← product screenshots
├── preview/                  ← Design-System tab cards (registered)
│   ├── type-display.html
│   ├── type-scale.html
│   ├── colors-paper.html
│   ├── colors-amber.html
│   ├── colors-dark.html
│   ├── colors-semantic.html
│   ├── spacing-scale.html
│   ├── radius-shadow.html
│   ├── components-buttons.html
│   ├── components-chips.html
│   ├── components-card.html
│   ├── components-terminal.html
│   ├── components-nav.html
│   ├── brand-logos.html
│   ├── brand-crew.html
│   └── brand-worlds.html
├── ui_kits/
│   ├── marketing-site/       ← 20-page story-flow website
│   │   ├── index.html
│   │   ├── crew.html
│   │   ├── hub.html
│   │   ├── workbench.html
│   │   ├── drop-in.html
│   │   ├── ease-of-use.html
│   │   ├── goal-autoloop.html
│   │   ├── judgment-loop.html
│   │   ├── substrate.html
│   │   ├── compass.html
│   │   ├── worker-sessions.html
│   │   ├── handoff-bus.html
│   │   ├── safety-registry.html
│   │   ├── hub-contract.html
│   │   ├── openclaw.html
│   │   ├── built-with.html
│   │   ├── worlds.html
│   │   ├── story.html
│   │   ├── faq.html
│   │   ├── closer.html
│   │   ├── shell.css         ← shared site styles (top nav, prev/next, footer)
│   │   └── README.md
│   └── app/                  ← Tauri desktop hub UI kit
│       ├── index.html        ← Hub (entry view)
│       ├── agents.html       ← 3-pane workbench
│       ├── board.html        ← Kanban
│       ├── catalog.html      ← MCP servers + Skills
│       ├── worlds.html       ← Theme picker
│       ├── app.css
│       └── README.md
└── uploads/                  ← original uploaded files (untouched, for reference)
```

---

## Quick start — for an agent invoking this DS

1. Read `colors_and_type.css` and link it from any new HTML.
2. Read each section above to internalize voice + visual rules.
3. Copy the assets you need from `assets/`. **Do not** invent SVGs or generate images.
4. Reference an existing UI kit (`ui_kits/marketing-site/` or `ui_kits/app/`) for layout patterns before writing new ones.
5. If asked for production code, lift component implementations from the UI kit. If asked for a throwaway mock/prototype/slide, use the UI kit's chrome + your own content.

Footer line on every customer-facing page, mono small caps, under the copyright row:

> Lean. Local. Private. Yours.

---

## Caveats & open items

- **No webfonts bundled.** Silkscreen / Press Start 2P / VT323 rely on OS fallback. If pixel-perfect rendering matters, drop `Silkscreen-Regular.woff2` into `fonts/` and add an `@font-face` block to `colors_and_type.css`. **FLAGGED.**
- **No codebase or Figma access.** This DS is built from screenshots + brand notes only. If/when source code or Figma URLs become available, re-derive components from there — the screenshots are lossy.
- **The app UI kit recreates the look of the hub from screenshots.** The marketing site is the more interactive of the two.
