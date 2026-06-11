# imagegen prompt templates — source-set generation & regeneration

**Provenance, read first.** The 3D-turn in-between frames were NOT generated
by an image model — they are derived deterministically by
`scripts/poc-kit/bake_turn16.py` (see `turn-technique.md`). Image generation
enters this pipeline in exactly three cases:

- **G1** a crew/world set is MISSING or fails inventory (not 8/48/32 files);
- **G2** a sequence is visually broken beyond registration repair (hatch-pet
  reject: wrong identity, garbage frames);
- **G3** (optional, owner-approved) bespoke held-pose upgrades — e.g. a true
  hand-authored BORED/WORKING/CURIOUS loop instead of the default
  choreography, or hand-quality 22.5° held poses.

These templates follow the `openai/skills` hatch-pet process (base reference →
row strips, every job attaches the base; effect restrictions enforced) adapted
to OUR contract (236×236, 8 compass dirs, walk 6f, anim 4f). The wave5 fleet's
5 regenerated sets came through this flow. After ANY generation you MUST run
the acceptance pipeline at the bottom — generated art is never installed raw.

Fill-ins: `<crew>` (architect|builder|designer|foreman|guardian|lattice|
reviewer|spark|wizard), `<world>` (ship|western|neon), `<direction>`
(south|south-west|west|north-west|north|north-east|east|south-east),
`<palette.*>` from `hub/ui_kits/app/crew-roster.json` → that crew's `palette`
(suit/trim/skin/hair hex values) — paste the hex codes literally.

---

## W — per-world style blocks (paste ONE into every prompt's `[WORLD-STYLE]`)

**ship:**
```
Setting flavor: clean retro-future starship crew. Fitted utility uniform with
subtle hard-surface trim; small glowing accents in mint-teal (#7dffd5 family)
on seams or devices, restrained, never neon-loud. Cool navy/steel base tones.
```
**western:**
```
Setting flavor: frontier western. Practical worn fabrics and leather, warm
earth tones, era-true gear (no electronics, no glowing elements). Warm lamp
light is allowed IN the palette of the clothing; no emissive/glow effects.
```
**neon:**
```
Setting flavor: rain-slick cyberpunk street. Dark techwear silhouette with
one or two restrained neon accent lines (cool cyan/teal family preferred).
Moody, not clownish; accents must be attached to the costume, never floating.
```

## N — the universal negative block (paste into EVERY prompt verbatim)

```
STRICT: transparent background only (no white, no black, no checkerboard).
No text, no letters, no numbers, no labels, no watermarks. No grid lines or
frame borders. No speech bubbles. No scenery, props on the ground, or floor
tiles. No drop shadows on the ground. No detached effects of any kind: no
sparkles, speed lines, dust clouds, motion trails, glow auras, impact stars.
The character is fully inside the frame, nothing cropped. Same character
identity in every frame: same face, same hair, same build, same outfit, same
colors. Pixel-art style, crisp 1px outlines, flat shading with 2-3 tones per
material, no anti-aliasing haze, no painterly blur.
```

## T1 — base reference (one still; generate FIRST, reuse everywhere)

> Generate at 1024×1024, then extract/downscale per acceptance pipeline.

```
Full-body pixel-art character sprite, single figure, facing the viewer
(south), standing relaxed, arms at sides. Character: the RHOBEAR crew member
"<crew>" — <one-line role, e.g. "systems architect who carries a glowing
holo-blueprint" — take the role line from crew-roster.json>.
Palette anchors: suit <palette.suit>, trim <palette.trim>, skin
<palette.skin>, hair <palette.hair>.
[WORLD-STYLE]
Proportions: heroic-chibi, total height ~150px when rendered in a 236×236
cell, head ≈ 22% of figure height, feet planted on a common baseline.
[N]
```

**Accept T1 only if:** single figure, transparent bg, identity matches the
crew's existing portrait (`assets/crew/<crew>_<world>.png`) in palette and
build. T1 becomes `BASE_REF` and is ATTACHED to every prompt below.

## T2 — rotations row (8 headings, 1 frame each)

```
Using the attached BASE_REF character exactly (same identity, same outfit,
same palette), generate a horizontal sprite strip of 8 frames, equal-width
cells, in this exact order:
1 facing camera (south), 2 three-quarter front-left (south-west),
3 left profile (west), 4 three-quarter back-left (north-west),
5 back to camera (north), 6 three-quarter back-right (north-east),
7 right profile (east), 8 three-quarter front-right (south-east).
The figure rotates in place about a vertical axis through the feet: feet stay
on one shared baseline, total height identical in all 8 frames. If the
character holds a signature prop, it travels around the body consistently
(visible in front views, partly occluded in back views).
Do NOT mirror frames: left-facing and right-facing views are distinct poses.
[WORLD-STYLE]
[N]
```

## T3 — walking row (6 frames, ONE direction per job; 8 jobs)

```
Using the attached BASE_REF character exactly, generate a horizontal sprite
strip of 6 frames of a smooth walk cycle, all frames facing <direction>
(<paste the matching pose words from T2, e.g. "left profile">).
Frame phases in order: contact (lead foot down) / down (weight low) / passing
(legs cross, body highest) / contact (other foot) / down / passing.
Same scale and baseline in all 6 frames; arms swing opposite to legs; the
body bobs at most 2-3 pixels between passing and down phases.
[WORLD-STYLE]
[N]
```

## T4 — animating row (4 frames, ONE direction per job; 8 jobs)

```
Using the attached BASE_REF character exactly, generate a horizontal sprite
strip of 4 frames of a calm in-place idle-reaction loop, all frames facing
<direction>. Subtle motion only: gentle breathing (1-2px chest rise), a small
head check or hand adjustment on frames 2-3, return to rest on frame 4. Feet
NEVER move. Loops seamlessly (frame 4 flows into frame 1).
[WORLD-STYLE]
[N]
```

## T5 — OPTIONAL bespoke state loops (G3 only; default needs NO art)

The shipped BORED/WORKING/CURIOUS states are pure choreography over T3/T4
frames + the baked ring (SKILL.md §3) — generate these ONLY if the owner asks
for hand-authored loops. Delta on top of T4, same [WORLD-STYLE] + [N]:

- **BORED delta:** "…6 frames: a bored idle — slow weight shift to one hip,
  a glance to the side on frame 3, a small sigh (shoulders drop 1-2px) on
  frame 5, return to rest."
- **WORKING delta:** "…6 frames: focused work at an invisible console at
  waist height — hands gesture/type in a small area, head down toward the
  work, one beat where the head lifts to check, return. The work surface
  itself is NOT drawn."
- **CURIOUS delta:** "…4 frames: a perk-up reaction — frame 1 rest, frame 2
  head lifts and body stretches 2-3px taller, frame 3 slight lean toward the
  viewer's right with raised brow, frame 4 eases back."

## Acceptance pipeline (MANDATORY after any generation)

1. **Extract** frames from each strip into per-frame PNGs (split by equal
   cell width; if the generator returned uneven cells, crop per visible
   figure and re-center).
2. **Normalize names** into the contract layout
   `<crew>/<world>/{rotations/<dir>.png, walking/<dir>/frame_000..005.png,
   animating/<dir>/frame_000..003.png}`. If the generator invented row names
   (striding/moving/hash-suffixed splits): classify by prefix — anything
   `animating*` → animating, everything else → walking; merge split rows in
   frame order (this exact chaos happened in wave5).
3. **Resize** every frame to exactly 236×236 with NEAREST (wave5 regens
   arrived 224–252px; mixed sizes = guaranteed head-pop).
4. **Gate**: `python measure_registration.py <crew> <world>` — flags are
   tolerated (runtime head-anchor pins them) but any headTop/headCx spread
   > 15px means a broken frame: find it on the contact sheet, regenerate that
   row only.
5. **Eyeball**: `python make_contact_sheet.py <crew> <world> --kind walking`
   (and `--kind animating`) vs `references/example-good-walking-sheet.png`,
   reject on any [N] violation, then proceed to the turn bake (SKILL.md §8
   step 4).
