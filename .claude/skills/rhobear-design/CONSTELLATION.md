---
name: rhobear-constellation
description: The North Star identity + re-skin system for the RHOBEAR marketing website — "sister to the hub" deep-space/constellation theme. Read this before touching ui_kits/marketing-site so you keep the site on-brand. Supersedes the pixel-display headline rule in SKILL.md FOR THE MARKETING SITE ONLY (the desktop-app worlds + sprite canon still stand).
user-invocable: true
---

# RHOBEAR — The Constellation (marketing-site North Star)

This is the soul of the marketing website after the deep-space re-skin. The site
is a **sister to the hub**: when someone goes from the website into the actual
RHOBEAR desktop hub, it should feel like the same world — not a marketing page in
front of a different product. If a change makes the site feel less like the hub,
it's wrong.

## The one feeling

**Quiet luxury, deep space, premium calm.** A constellation sky behind everything,
warm amber as the single point of light, dark glass surfaces, generous breathing
room, crisp modern type. Not loud, not childish, not busy. Think "premium product
that respects you," never "fun pixel game site." (The pixel sprites still perch on
the UI as characters — but the *surface* they sit on is deep space, not paper.)

## The look, in five moves

1. **Deep-space canvas.** Every page sits on a space gradient with a **live WebGL
   starfield** drifting behind it (the hub's exact sky). Stars always drift; an
   occasional quiet pulse breathes through. It pauses when the tab is hidden and
   calms for `prefers-reduced-motion`.
2. **Dark glass, not paper.** Cards/panels/bands are translucent dark glass
   (`rgba(17,25,43,0.78)`) with a cool hairline + soft shadow. No warm paper. No
   per-card `backdrop-filter` blur (dozens of blur layers over the WebGL canvas
   tank performance and headless capture — the surface alpha already reads as glass).
3. **One warm note.** Amber (`#f7a836`) is the only warm color and the only accent —
   links, the active nav pill, key numbers. On dark it brightens for legibility
   (`#ffdca6` text on a faint `rgba(247,168,54,0.13)` fill). Hover **deepens**, never
   fades. `em` is amber, never italic.
4. **Premium type, not pixel.** Headlines + body are **self-hosted Inter** (bundled
   `assets/fonts/inter.woff2`, no CDN), tight tracking, real weight. This is the one
   place the marketing site overrides the old "pixel-display headline" rule. (Pixel
   font is still owner-law-banned for *body/UI* text everywhere — Inter is not pixel.)
5. **Luminous dark marks.** Dark/black logos (MCP, Ollama, Whisper, Pi) get a
   rim-glow so they pop off the starfield without changing color or losing stars —
   a tight white halo carves the edge out of the star noise + a soft cosmic aura.

## The token contract (what actually changed)

The whole re-skin is **token-driven**. The deep-space palette re-values `:root`
custom properties and is appended *last* to `shell.css` so it wins the cascade. Key
values (all `!important` so `index.html`'s inline TWEAKS `<style>` block can't flip
them back to the light theme):

```
--c-bg:#070b14   --c-bg-2:#0a1020   --c-bg-3:#0e1526
--c-surface:rgba(17,25,43,0.55)     (cards land at 0.78)
--c-ink:#eaf0fb  --c-ink-2:#c3cde0  --c-ink-3:#94a0b8
--c-amber:#f7a836  --c-amber-deep:#ffc164  --c-amber-soft:rgba(247,168,54,0.16)
--c-line:rgba(170,200,255,0.12)     (cool hairlines, replaces paper stitch)
--font-display / --font-body: "InterRHO" (self-hosted Inter)
```

The starfield is a self-contained WebGL canvas (`#rho-stars`, `position:fixed`,
`z-index:0`) injected by `shell.js`; `main`/`footer` sit at `z-index:1`; the nav
stays `position:sticky` above it.

## Hard rules carried from this build (do not break)

- **COPY IS FINAL.** Never rewrite the words. Only the skin, layout, and assets.
- **Self-contained.** Every page opens cold on a double-click, offline, any browser.
  No runtime CDN, no integrity hashes. Fonts are bundled `.woff2`, referenced
  relatively. (This is *why* Inter is self-hosted, not Google-Fonts-linked.)
- **NO Marvel / internal codenames** anywhere customer-facing (Neo/Thor/Hulk/Captain/
  black-widow/etc.) — legal + brand. Use the RHOBEAR crew names only.
- **Never mock a feature we don't have.** The "approve from your phone" panel is a
  **Telegram** mock because Telegram is real for us. Don't fake a mobile app.
- **Honesty, pre-launch.** No installer is public yet; never invent shipped features
  or fake numbers. Published third-party benchmarks (e.g. CodeGraph's founder numbers)
  are fine when cited to the source.
- **Sprites are characters, not confetti.** Pops-size (~200px+) minimum, perched with
  a drop-shadow, never tiny floating accents.
- **Real logos.** Ingredient marks are the real official logos where they exist
  (MCP, Pi) or clean custom marks where none exists (CodeGraph, Aguara, Whisper).

## The re-skin pipeline (how the skin is applied)

The override is NOT hand-edited into 22 pages. It lives in three loose files in the
**workspace root** `C:\Users\DeLL\SunSponge-Workspace\repos\` (outside the repo, so
they don't ship) and is applied by a script:

- `_reskin_append.css` — the entire Constellation override (token block, @font-face,
  starfield canvas styling, dark-glass cards, nav fixes, sprite sizing, logo rim-glow).
- `_reskin_append.js` — the WebGL starfield, appended to `shell.js`.
- `_apply_reskin.py` — reads each page's pristine `.orig` backup, re-appends the
  overrides, swaps the bear mark, remaps a few hardcoded dark text colors to
  on-dark-bright, and **cache-busts** `shell.css/js` + every asset ref with
  `?v=<epoch>` so the browser always fetches fresh on a normal reload.

**To change the skin:** edit `_reskin_append.css/js`, then run
`python C:\Users\DeLL\SunSponge-Workspace\repos\_apply_reskin.py`. It re-themes all
22 pages from their pristine `.orig` backups. Never edit the compiled `shell.css`
directly — the next apply will overwrite it.

## The constellation stills (for video / promo)

`C:\Users\DeLL\Downloads\RHOBEAR-site-stills\` and committed at
`marketing-site-stills\` — 22 full-page captures (`01-index.png` → `22-faq.png`),
2400px wide, one per page, top-to-bottom with the live starfield filling the whole
height. Captured with `_capture_stills.js` (Playwright): the trick is to size the
browser viewport to each page's *full* height before shooting, which fires the
starfield's `resize()` handler so the canvas repaints full-height — otherwise a
`fullPage` shot leaves the stars only in the top screen. Re-run when the site changes.

## Walk-in checklist for the next agent

1. Read this file + `colors_and_type.css` for the base tokens.
2. Edits to the live site go through `_reskin_append.css` → `_apply_reskin.py`, never
   straight into compiled `shell.css`.
3. Verify with a Playwright capture (the preview MCP caches CSS + glitches the
   viewport) — not by trusting a reload.
4. Keep the five looks, keep the hard rules, keep the copy. If it stops feeling like
   the hub, stop.
