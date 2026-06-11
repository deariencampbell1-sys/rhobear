# The 16-phase lit turn — full technique writeup

This is the deep reference for `scripts/poc-kit/bake_turn16.py`. You do NOT
need to understand this to USE the baker (SKILL.md §8 fast path is enough).
Read this when a set fails its gates, when you must tune a parameter, or when
someone asks "why does it read as 3D."

Worked example throughout: **architect/ship** (see `example-before-after.png`,
`architect_ship_turn360.gif`, `architect_ship_turn90_ab.gif`). Second-set
rehearsal: **builder/western** (`example-second-set-builder-western.png`).

---

## 0. Why an 8-direction turn doesn't read as 3D

With 8 stills 45° apart, a turn is a sprite SWAP: one frame the coat faces
you, the next it doesn't. Nothing on screen ever *rotates*. The brain needs
motion evidence: silhouette change, feature parallax, stable lighting, weight.
The fix is five stacked cues — each individually cheap, jointly convincing:

1. **More real phases** — 16 headings (22.5° steps) instead of 8.
2. **Rotation-true parallax** inside the synthesized in-betweens.
3. **Light constancy** — a world-fixed rim light baked onto every heading.
4. **Silhouette-breathing contact shadow** (engine-side, from meta.json).
5. **Eased turn choreography** — anticipation → accelerate → settle.

Cues 1–3 are baked (this file). Cues 4–5 are engine-side (sprite-engine-v2.js;
see SKILL.md §4). Alternatives we evaluated and rejected: scale/skew billboard
tricks (the rectangle changes, the silhouette doesn't — reads as a wobbling
card), pure cross-dissolve (ghost mush — see `example-bad-turn-sheet.png` top
row), per-frame imagegen in-betweens (re-creates the registration drift that
stable-slots exists to fix, needs per-frame visual QA, costs per set; valid
later as a held-pose upgrade, wrong as the transit mechanism).

## 1. Registration — the feet are the axis (bake step 1)

A figure turns about the vertical axis through its PLANTED FEET, not through
its bounding-box center (the bbox center swings with held props; the feet
don't). Every canon rotation still is integer-shifted so its feet anchor lands
at **(118, 210)** in the 236×236 cell:

- feet anchor = (centroid-x of opaque pixels in the bottom 6 rows of the
  figure, bbox bottom row). Alpha threshold 16 (canon QA value).
- integer shift only — pixel art is never resampled here.

This is why the baked ring's `baseline` spread is 0px and `feetCx` spread
≤ 2px by construction. If THOSE gates ever fail, the source art has broken
feet (cropped, or a floating pose) — fix the source, don't tune the baker.

## 2. Per-row source normalization (bake step 2) — THE critical step

**The failure it prevents:** neighbouring canon views shift posture (the head
sits on different columns in `west` vs `north-west`). Warping both sources
about one global axis under-corrects that offset, and the merge then shows
TWO heads (see `example-bad-turn-sheet.png` — the naive row has exactly this
signature). Our first implementation had this bug; per-row normalization is
what fixed it. Never reimplement this with a single global cylinder.

For each source view, for each pixel row `y`:
- `C(y)` = midpoint of the row's leftmost/rightmost opaque pixels
- `W(y)` = half-width of that span (min 1.0)
- rows with no pixels: filled by linear interpolation between occupied rows,
  edge rows extended; then both curves smoothed (gaussian σ=3 rows).

Each row of each source is now its OWN cylinder slice: center `C`, radius `W`.

## 3. The cylindrical warp (bake step 3)

Target beam for the in-between: `Ct(y) = (Ca+Cb)/2`, `Rt(y) = (Wa+Wb)/2`
(single-source rows take that source's values), re-smoothed σ=2, `Rt ≥ 2`.

Inverse mapping per output row, for each output column `x` in `[Ct−Rt, Ct+Rt]`:

```
u   = clamp((x − Ct)/Rt, ±0.9995)
phi = asin(u) + delta            # delta = ±11.25° in radians
src = C_source + W_source · sin(phi)
out[x] = source[round(src)]      # nearest-neighbour: exact palette pixels
|phi| > 90° → no pixel from this source (behind the horizon = occluded)
```

Source A (the earlier heading, clockwise) gets `delta = +11.25°`; source B
gets `−11.25°`. The `asin/sin` pair is the entire 3D effect: a feature at the
row center moves ~`W·sin(11.25°) ≈ 0.2·W` px while a feature near the rim
moves ~0 — the speed gradient of a real rotating cylinder. A linear shift
(same speed everywhere) is what makes flat morphs look flat.

Rows where only one source is occupied (a prop sticking out in one view):
the other source is silenced for that row — no ghost props.

## 4. The colour-aware merge (bake step 4)

Both warped sources now overlap well. Per pixel where BOTH are opaque
(alpha > 128):

- **agree** (Σ|RGB diff| < 96): output the average snapped to the NEARER
  source colour — coherent shading, zero new palette entries.
- **disagree** (≥ 96) — this is per-view glow linework / costume detail:
  - `--mix luma` (default): take the BRIGHTER pixel (luma weights 3:6:1).
    Glow is additive light; both views' emissive lines survive as contiguous
    strokes. The mid-frame flares slightly — on an emissive costume this
    reads as an in-world energy beat.
  - `--mix bayer`: choose per 2×2 block by a Bayer matrix. No flare; costs a
    subtle checker texture in disagreement regions (acceptable at transit
    speed; visible if you freeze-frame).

**Which mix? Don't decide by taste — the baker decides.** It prints
`mix check: … ratio R -> verdict`. R = mean opaque-pixel luma of the 8 synth
frames over the 8 canon frames. **Gate: R ≤ 1.18.** Measured anchors:
architect/ship luma R=1.17 (OK — the most emissive costume in the fleet
defines the line), builder/western luma R=1.19 (TOO BRIGHT → verdict says
rebake `--mix bayer`, which lands at R=0.94). Obey the printed verdict,
nothing else.

Then cleanup: opaque pixels with <2 of 8 neighbours are dropped (orphans);
transparent pixels with ≥6 opaque neighbours are filled with the median
neighbour colour (pinholes); alpha hardened to 0/255.

## 5. The world-fixed rim light (bake step 5)

Applied to ALL 16 headings (the 8 registered canon copies too — the ring must
be uniformly lit; canon files on disk stay untouched):

- light travel direction `L = normalize(0.62, 0.74)` — key at screen UP-LEFT.
  Same vector for every heading. **Never rotate the light per heading** — the
  whole cue is that the light stays put while the figure's geometry rotates
  beneath it.
- silhouette band = opaque minus 2-erosions (a 2px edge ring).
- outward normal per edge pixel = −∇(gaussian-blurred alpha, σ1.2), normalized.
- facing = `n · (−L)`:
  - facing > 0.35 → blend toward mint `#7dffd5`, t = 0.28·smoothstep
  - facing > 0.88 → hot specular, t = 0.28·1.55
  - facing < −0.45 → core shadow, blend toward `#0a1020`, t = 0.28·0.6
- `--rim 0.28` is the strength knob. 0.28 is the shipped look; 0.20 = subtle,
  0.40 = costume-y. Change ONLY if the owner asks for stronger/weaker light.

## 6. Self-test — how we know the machinery is honest

`--selftest` re-synthesizes each canon DIAGONAL (e.g. south-west) from its two
90°-apart neighbours (south + west) and scores silhouette IoU vs the true
canon art. That is DOUBLE the production gap (production synthesizes 22.5°
midpoints from 45°-apart neighbours — strictly easier).

Measured: architect/ship 0.49–0.66, builder/western 0.57–0.71. The shortfall
from 1.0 is genuine pose change (the architect's blueprint changes grip
between S and W — no warp can reconcile that), which is exactly why synth
frames are TRANSIT-ONLY (shown 45–110ms, never held).
**Alarm line: any selftest pair < 0.40** → the set's adjacent poses are
unusually divergent; eyeball the strip extra hard, expect to need `--mix
bayer`, and if the strip fails the eyeball criteria, ship the set with the
ring disabled (snap fallback) and note it for the owner.

## 7. The numbers that gate a baked ring (qa_turn16.py)

| gate | threshold | what failure means |
|---|---|---|
| baseline spread | ≤ 2px | broken source feet (fix source, not baker) |
| feetCx spread | ≤ 4px | same |
| headTop spread | ≤ 4px | source views at different scales — re-check 236 resize |
| height spread | ≤ 6px | same |
| **synthMidDev** | ≤ 4px | a synth's head-band centroid is off the midpoint of its two canon neighbours → ghost/broken synth. THE synth-health gate. |

`headCx` SPREAD and neighbour STEP are printed but informational: the head
ORBITS the feet axis as the figure rotates — around the ring headCx traces a
sinusoid (architect: 117→108→117→124→128→117; that sinusoid is itself proof
of rotation geometry). Builder/western legitimately steps 8.2px between
W→NW headings (big hat swing) while every synth sits within 0.54px of its
neighbour midpoint — which is why midpointness gates and step does not. (Gate
v1 used max-step ≤ 8 and false-failed builder/western; this is the lesson.)

## 8. Knob reference (change nothing without a reason)

| knob | value | effect if raised | effect if lowered |
|---|---|---|---|
| `--rim` | 0.28 | stronger mint rim | flatter figure |
| mix `close` threshold | 96 (in code) | more snap-averaging, less union/checker | more disagreement texture |
| luma gate | 1.18 (in code) | washes pass as OK | emissive sets false-flagged |
| warp smoothing σ | 3.0 / 2.0 (in code) | softer silhouette, less row detail | row jitter (wiggly edges) |
| anticipate/mid/settle ms | 95/52/110 (engine TUNE2) | heavier, slower turn | snappier, lighter |
| fast-turn ms | 45 (engine) | calmer reactions | twitchier |
