---
name: rhobear-hatch
description: >-
  Animate RHOBEAR crew sprites the way the owner likes. Fire this when the user
  asks to hatch/animate a crew member or world, fix a "head not attached / jittery /
  popping" sprite, build or wire the hub sprite engine, or QA an extracted sprite
  tree. Codifies the proven 8-direction process derived from openai/skills `hatch-pet`:
  the real on-disk contract, the stable-slots/head-anchor registration fix for the
  head-detach artifact, the contact-sheet QA, and the engine contract for hub (Lane H)
  wiring. Pairs with `rhobear-design` (brand + placement canon).
user-invocable: true
---

# RHOBEAR Hatch — crew sprite animation

This skill makes RHOBEAR's pixel-art crew walk, idle, react, and talk on the hub.
It is the RHOBEAR-side packaging of the open-source `openai/skills` **`hatch-pet`**
process, adapted to the **frames we already extracted** (we register existing
frames; we do not re-extract from row strips). For brand law, sprite placement,
and worlds, defer to **`rhobear-design`** — this skill owns *motion*, not look.

## WHEN TO USE
- "animate / hatch the architect (ship)", "make the crew walk", "wire sprites to the hub"
- "the head isn't attached to the body", "the sprite jitters / pops / floats"
- "QA the sprites", "which crew/world sets are broken or incomplete"

## THE ON-DISK CONTRACT (derive by CONVENTION)
> ⚠️ `metadata.json` `frames` paths are **STALE** — they point at the original
> extraction folder (`<long_name>/animations/walking/...`). **Do not trust them.**
> Build paths from this convention instead:

```
hub/assets/crew/<crew>/<world>/
  rotations/<dir>.png                 # 1 still per direction (idle / turn)
  walking/<dir>/frame_000..005.png    # 6-frame walk cycle
  animating/<dir>/frame_000..003.png  # 4-frame idle/reactive loop (mouse-woken)
```
- `<dir>` ∈ `south, south-east, east, north-east, north, north-west, west, south-west`
- Cell: **236×236**, transparent. Anchor a sprite by its **feet** (bbox bottom).
- Crews/worlds present today: 9 crew × {neon, ship, western}; `lattice` = ship only;
  some sets have gaps (run the QA tools below to find them).

## THE HEAD-DETACH FIX (the important part)
**Symptom:** every frame looks fine alone, but in motion the head reads as "not
attached to the body" — the figure pops in scale/baseline frame-to-frame.
**Cause:** frames were extracted **per-frame fit-to-cell**, so each frame was
placed/scaled independently. hatch-pet calls this "size popping / baseline jumps."
**Cure — stable-slots / head-anchor registration:** re-register every frame in a
sequence to one stable anchor so the figure stays locked while the legs animate.
- `scripts/sprite-engine.js` → `SpriteSheet.computeTransforms(mode)` does this at
  load time, non-destructively (stores a per-frame `{dx,dy}` offset).
- `mode`: **`head`** (default — pins the centroid of the top-22% head band; the
  head stays glued, legs walk under it), `feet` (pins ground contact), `off` (raw).
- Head-anchor is what made it look right to the owner. Keep `head` unless a
  specific sequence looks better on `feet`.

## WORKFLOW
0. **Fleet pass (all sets at once).** `python scripts/build_master_report.py` →
   inventories + drift-checks every crew/world set and writes `reports/MASTER.md`
   (verdict table + regen list + drift watch). Run this first to see the whole board;
   dispatch one worker per crew for the visual eyeball (no-clobber by crew folder).
1. **Measure first.** `python scripts/measure_registration.py <crew> <world>` →
   flags sequences whose head/height drift > 4px (the ones that will detach).
2. **Contact-sheet QA.** `python scripts/make_contact_sheet.py <crew> <world>
   [--kind walking|animating]` → writes `qa/<crew>_<world>_<kind>.png` with the
   bbox (green) + head-anchor crosshair (red) on every frame. Eyeball for stray
   heads, baseline jumps, missing frames, or hatch-pet QA rejects (text, grids,
   speech bubbles, white/black bg, scenery).
3. **Preview the feel.** Serve the worktree root (`python -m http.server 8137
   --directory <worktree>`) and open `/hub/assets/crew/_preview/preview.html`
   (template in `reference/preview.html`). Toggle Head/Feet/Raw, dial walk/idle
   fps + speed live. This is a hands-on owner one-on-one — confirm the feel, iterate.
4. **Wire to the hub (Lane H).** Instantiate `RhobearSprites.SpriteActor` per
   crew member; feed positions to walk along the chatbus; pipe stream tokens to
   the overhead `ChatBubble`. The hub is browser-JSX (React global, **no
   import/export**, `// FILE:` boundaries) — wrap the engine, don't ES-import it.

## ENGINE CONTRACT (`scripts/sprite-engine.js`, global `RhobearSprites`)
- `SpriteSheet(base)` — `.load()` (loads frames + computes transforms), `.frame(kind,dir,idx)`,
  `.xformFor(kind,dir,idx)`, `.has(kind,dir)`, `.computeTransforms('head'|'feet'|'off')`.
- `SpriteActor(sheet, {x,y,scale,dir})` — `walkTo(x)`, `stop()`, `face(dir)`,
  `backTurnBeat()` (face N + hold), `setReactPoint({x,y})` (mouse-react), `update(dt)`,
  `draw(ctx)` (feet-anchored + stabilization offset), `bubbleAnchor()`.
- `ChatBubble(el)` — `say(text)`, `append(token)` (stream), `update(dt)` (typewriter),
  `positionAt(anchor, canvasRect)`, `hide()`.
- `TUNE` — live tunables: `walkFps, idleFps, walkSpeed, backTurnHoldMs,
  mouseReactRadius, bubbleCharMs`. `DIRS` — the 8 directions in compass order.
- States: `idle` (rotation still) ⇄ `react` (animating loop, mouse within radius)
  ⇄ `walk` (walking loop + travel) ⇄ `turn` (back-turn beat).

## THE WALL
Sprite/QA output is local + reversible — generate freely. Do **not** mutate the
extracted PNGs in place (the engine fix is non-destructive by design); if a
bake-into-assets pass is ever wanted, ask first and write to a new folder.
Never redraw the bear or alter the `RHOBEAR` wordmark (see `rhobear-design`).

## SOURCE
- Process basis: `openai/skills` → `skills/.curated/hatch-pet` (8×9 atlas, 192×208
  cells, stable-slots mode, `inspect_frames`/`make_contact_sheet` QA). We use the
  same ideas on already-extracted 236×236 / 8-dir frames.
- Today's engine + tools were built 2026-06-10 in worktree `D:\rhobear-wave5-wt`
  (`hub/assets/crew/_preview/`) on branch `feat/hub-wave5-wiring`.
