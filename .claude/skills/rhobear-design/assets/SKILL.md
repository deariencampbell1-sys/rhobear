---
name: rhobear-design
description: Use this skill to generate well-branded interfaces and assets for RHOBEAR.AI, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Fast index

- `README.md` — the contract: voice, casing, content rules, visual foundations, iconography.
- `colors_and_type.css` — all design tokens (color, type, spacing, motion, shadows, borders). Link it from any HTML you write.
- `assets/` — flat asset library, ~103 files:
  - `rhobear-mark.png` — brand mark, always `image-rendering: pixelated`
  - `{character}_{world}.png` — six canon roles (pops, architect, foreman, guardian, spark, wizard) × three worlds (ship, western, neon)
  - `crew-{builder,designer,reviewer}-{ship,western}.png` — expansion crew
  - `hero-{archer,armored,tinker,brute}-{world|walk|east}.png` — four off-brand original heroes
  - `{character}-spritesheet.png` — 4-frame static spritesheets (slice a frame for a still)
  - `bg-{ship,western,neon}.png` — world backgrounds (full-bleed)
  - `{integration}.svg` — 35+ real third-party logos
  - `{01-13}*.png` — product screenshots
- `preview/` — design-system tab cards (21 small specimens).
- `ui_kits/marketing-site/` — the 20-page story-flow site to crib layout patterns from.
- `ui_kits/app/` — the desktop hub recreation (Hub / Agents / Board / Catalog).

## Non-negotiables

1. **Local-first / no CDN.** Every file must open cold on double-click, offline, any browser. No `<script src="https://…">`. No integrity hashes. No webfont CDN imports. Inline all JS and CSS or reference relatively.
2. **Flat assets/.** Reference assets as `assets/<file>` (or `../../assets/<file>` from inside a ui_kits subfolder). Never create sub-folders inside `assets/`.
3. **Pixel-display headlines, system body, OS mono.** No web-loaded fonts. The pixel cadence comes from the system fallback chain in `colors_and_type.css`.
4. **One amber accent.** Hover deepens, never fades. `em` is amber, never italic.
5. **The 9 pillars** are sacred and verbatim: `LEAN · $5 VPS · COST-EFFICIENT · LOCAL · PRIVATE · CUSTOMIZABLE · EASY · TRUSTWORTHY · YOURS`.
6. **Footer line every page:** `Lean. Local. Private. Yours.` — mono small-caps, amber.
7. **Voice:** plainspoken, friend-first, autonomy-first. Direct over clever. The owner is non-technical and never to be talked down to.
8. **Character placement:** sprites perch on UI like dolls (200-400px, with drop-shadow, with `.bob`), they are never tiny floating accents.
9. **Don't recreate copyrighted UIs / character canon.** Use the RHOBEAR crew names; never Marvel/etc.
10. **Honesty.** No installer is public yet. The repo-only install path is the truth. Never invent shipped features.

## When working on production code

Lift component implementations from `ui_kits/marketing-site/shell.css` and `ui_kits/app/app.css`. They are deliberately self-contained and copy-pasteable. Read `colors_and_type.css` for the token contract.

## When working on a mock / slide / prototype

1. Make a folder next to `ui_kits/`.
2. Inside, write your HTML. Reference assets as `../assets/<file>` (one level up).
3. Link `../colors_and_type.css` for the tokens.
4. Use existing patterns from `ui_kits/marketing-site/shell.css` (card-paper.stitched, marquee, voice-chip, terminal block, world-card) rather than inventing new ones.
5. Show the user via `done` / `show_to_user`.

## Iconography rule

Never draw an SVG icon. Copy a real one from `assets/`, or — for generic UI glyphs — use Unicode (`·`, `→`, `←`, `▾`, `★`). No icon font, no Lucide, no Heroicons. The crew + the world backgrounds + the integration SVGs are the iconography.
