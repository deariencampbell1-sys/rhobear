# RHOBEAR Website Re-skin — Working Board

Branch: `claude/charming-mayer-CTOmQ` · Site: `.claude/skills/rhobear-design/ui_kits/marketing-site/`
Every item the owner has raised. Status: ✅ done · 🟡 in progress · ⬜ todo.
Copy is FINAL — never rewrite words; only skin/layout/assets.

---

## ✅ DONE (verified)
- ✅ Re-skin whole site to the Constellation (deep-space, starfield behind every page, premium type, dark glass) — token-driven via `shell.css`.
- ✅ Bear logo replaces pixel-panda mark (sidebar/title/favicon refs).
- ✅ Legibility: remapped 5 hardcoded dark chip colors → bright on-dark (security/warn/etc.).
- ✅ **Marvel/internal codenames removed** (Neo/Thor/Hulk/Captain/black-widow) — were in old images + SCRUB-PENDING comments. Zero remain in HTML.
- ✅ **CLI four colors** — panels amber/cyan/green/purple + clean crew output (was "DISCONNECTED").
- ✅ **Telegram mock** for "approve from your phone" (instead of fake mobile app).
- ✅ **Real constellation renders** swapped into all product-screenshot slots (hub→Workbench, skills, settings, learn, catalog, vault, board, cli, worlds) — caught that `view=hub` is the OLD pixel room, used Workbench instead.
- ✅ **Spacing** — uniform generous gaps; win-cards/step-cards/leash-line/closing card no longer touch. Win-cards → dark glass.
- ✅ **Sticky nav** restored site-wide (the learn/substrate "trapped" bug).
- ✅ **Substrate dropdown FIXED** — `.nav-tabs overflow-x:auto` was clipping the panel + a show-rule override; now reachable (owner confirmed). 7 nested pages all render.
- ✅ **Amber too-bright** (HOME tab + "It's easy" pillar chips) — index TWEAKS `<style>` block was flipping tokens to light theme; locked tokens `!important` + explicit faint-fill/bright-text on chips.
- ✅ chip-mono info bubbles centered.
- ✅ Onboarding steps use distinct images (boot → codec → lesson).
- ✅ Removed `backdrop-filter` blur from cards (perf + capture).

## ✅ DONE (this round)
- ✅ **Logos** — built-with ingredient marks + marquee:
  - ✅ Centered logos vertically with their text/numbers (`align-items:center`).
  - ✅ **Whisper** fixed (was Codex's `openai.svg`) → distinct soundwave mark (`whisper.svg`).
  - ✅ **Pi / MCP / Aguara / CodeGraph** were just `<text>` (the letters) → upgraded:
    - **MCP** = the **real official** logo (Wikimedia Commons, recolored to currentColor).
    - **Pi** = the **real official** logo (earendil-works/dashboard-icons, recolored).
    - **CodeGraph** = polished custom **knowledge-graph** mark (no official logo exists for `colbymchenry/codegraph`).
    - **Aguara** = polished custom **security-shield** mark (niche tool, no findable logo).
  - Ollama (llama) kept — now centered.
- ✅ **built-with H1 centered** — "What we built it with." now centers over the whole intro.
- ✅ **Brand typeface ("our type")** — self-hosted **Inter** (`assets/fonts/inter.woff2`, no CDN, offline-safe), wired to `--font-display` + `--font-body`. Verified loading (`document.fonts.check` = true). Consistent on every machine now.

## ✅ ROUND 2 — owner feedback (done this pass)
- ✅ **agents-mobile (Marvel) → Telegram thread.** The file was already the Telegram mock (484×924) but the owner's browser was serving a CACHED old copy. Fixed for real by giving it a **new filename** `agents-telegram.png` (cache can't serve the stale one) + repointed `workbench.html` + dropped `pixelated`. Marvel image gone.
- ✅ **Cards breathe** — bumped `.band-dark` padding to 36×46 so text isn't kissing the border. (If a *specific* card still looks tight on review, point me at it.)
- ✅ **Voice-first chip balanced** — pill now `width:fit-content`: mic stays on the LEFT, no empty space on the right, reads even.
- ✅ **Sprites enlarged to Pops-size minimum** — `.lc-sprite` → 210px, `.sub-sprite` → 200px, final-strip sprites → 190px (was 130) + the strip wraps/centers. Feature-card perches kept at 120 (3-col cards too narrow for 210). Max-height only, no distortion.
- ✅ **"Soon, hubs talk to hubs" image** — owner generated it from the prompt (`Downloads/HUBS WORLDS.png`, already transparent). Resized → `assets/hubs-link.png`, wired into the band's right side (centered, glow, responsive-stacks on mobile), band given min-height so it sits inside the dashed border.

## ✅ SHIP — captured, committed, pushed, CodeAnt triggered
- ✅ **22 full-page stills** of every page top-to-bottom (live starfield filling each page; 2400px wide, 1.5×) for the owner's later AI video animation. Saved to `C:\Users\DeLL\Downloads\RHOBEAR-site-stills\` AND committed into the repo at `marketing-site-stills\`.
- ✅ **Pushed** the finished Constellation re-skin to `claude/charming-mayer-CTOmQ` (commit `7bebd79`, 81 files; `.orig` pipeline backups excluded).
- ✅ **PR #1 open** (https://github.com/deariencampbell1-sys/rhobear/pull/1), head = `7bebd79`. **CodeAnt triggered** — `codeant-ai` check-suite present on the commit (status: queued → it reviews automatically; no manual trigger needed/allowed). Neo waits for CodeAnt before any merge.

## ✅ ROUND 3 — owner feedback (done this pass)
- ✅ **Dark ingredient logos lost in the starfield** — owner: CodeGraph + Aguara read great, but **MCP, Ollama, Whisper, Pi** are solid black and got camouflaged by the star dots. Wanted them to "pop a lot more" WITHOUT changing the black color and WITHOUT losing the stars. Fix: luminous rim-glow on `.bw-summary-inner img.logo` — two tight white halos hug the silhouette (carves a clean glowing edge out of the star noise) + two wider cool auras for premium constellation glow; brightens further when a card is open/hovered. Color never touched (no invert/recolor), stars untouched, the already-bright logos just gain a faint consistent aura. Landed `shell.css:2059`, cache-busted v=1780636292 on 22 pages.

## ⬜ TODO
- ⬜ **Step-card flow illustrations** — owner wants steps 1-2-3 to SHOW the actual flow: hover the learn chip → drag it → drop into chat → it becomes a lesson. (Currently distinct stills boot→codec→lesson, not the live drag states — needs scripted drag capture.)
- ⬜ **Homepage hero** — "CREW ON DECK · 9 / Starship 17-B" is the pixel room. Decide: keep as crew showcase or swap to Workbench/constellation. (Owner judgment call — flagged, not yet decided.)
- ⬜ **Worlds page room backgrounds** (SPACE/WEST/NEON pixel) — keep (it's the Worlds feature) or swap. (Owner judgment call.)

## NOTES / GOTCHAS
- All edits flow through `_reskin_append.css` + `_apply_reskin.py` (re-themes all 22 pages) and `_swap_renders.py` (asset swaps). Source renders: `Downloads/hub-captures/`.
- Preview tool caches CSS aggressively + glitches viewport — verify via Playwright CLI capture, not the preview MCP.
- Owner views via `file://` + hard-refresh (Ctrl+Shift+R) to clear cache.
- Owner directives: do NOT screenshot work back at him; do NOT ask permission per step; do the whole list; don't waste tokens.
