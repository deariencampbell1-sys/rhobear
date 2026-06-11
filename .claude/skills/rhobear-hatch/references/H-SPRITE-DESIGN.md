# H-SPRITE-DESIGN — the crew's 3D turn + how they live in the Hub

Lane H POC (Fable) · branch `feat/h-fable-sprites` · POC scope: **architect/ship only**, preview
harness only. Canon sets untouched; everything new lives in `hub/assets/crew/_preview/poc/`.

**Feel-check (2 minutes):**
```
python -m http.server 8137 --directory <worktree>
open http://127.0.0.1:8137/hub/assets/crew/_preview/poc/hub-poc.html
```
Press **▶ Stream reply**, click the stage, toggle **3D ↔ snap**, hit **⟳ 360°**.
No server handy? Open `poc/proof/architect_ship_turn90_ab.gif` — the before/after in one loop.

---

## 1. The 3D turn — what made it read

The old turn snaps between 8 stills 45° apart: one frame the coat faces you, the next it
doesn't. Rotation is never *shown*, so the brain reads a sprite swap, not a body turning.
The POC makes rotation visible with five stacked cues — each cheap, together convincing:

| cue | what we did | why it sells 3D |
|---|---|---|
| **More real phases** | A 16-wind turn ring: the 8 canon headings + 8 **synthesized 22.5° intermediates** | Every 45° step becomes two visible phases — "each phase shows" |
| **Rotation-true parallax** | Intermediates built by **silhouette-adaptive cylindrical warp**: every figure row is a cylinder slice whose radius is that row's silhouette half-width; columns remap by `asin/sin`, so features near the body axis slide faster than features at the rim | That speed gradient is exactly how features move on a rotating volume — flat morphs don't have it |
| **Light constancy** (the Dead Cells lesson) | A **world-fixed mint key light** (`#7dffd5`, upper-left) rims every heading via alpha-edge normals; lit edge brightens, far edge cools toward deep navy | The light *stays put* while the figure's geometry rotates beneath it — the strongest monocular volume cue after silhouette change |
| **Silhouette-breathing shadow** | The contact shadow's width tracks the current heading's measured silhouette width (`meta.json`) | The ground plane confirms the rotation; depth reads at the feet |
| **Animation-principles easing** | Turns route the shortest arc with **anticipation (95ms) → accelerate (52ms/phase) → settle (110ms)**, plus a 1-phase overshoot+return on arcs ≥ 90° | Weight. A body turns; a sprite flips. Easing is the difference |

### How an intermediate frame is made (`bake_turn16.py`)
1. **Register** all 8 canon stills to a common feet axis (118, 210) — the rotation axis runs
   through the planted feet, not the bbox center.
2. **Per-row normalization** — for each source row: silhouette center `C(y)` + half-width
   `W(y)` (smoothed σ≈3). This is the step that killed the two-heads ghost: neighbouring
   canon views shift posture, so each row is aligned *before* mixing.
3. **Warp both neighbours half-way** (±11.25°) onto the target beam (centers averaged,
   widths averaged) with nearest-neighbour sampling — every output pixel is an exact
   palette pixel from a source. No alpha blending anywhere.
4. **Colour-aware merge**: where the two warps agree (most of the body) take the average
   snapped to the nearer source colour; where they disagree (per-view glow linework) take
   the **brighter pixel** — glow is additive light, so both views' circuit lines survive as
   contiguous strokes. On screen the coat flares slightly mid-turn: an in-world energy
   beat, not an artifact. (`--mix bayer` block-choice fallback for non-emissive sets.)
5. **Cleanup** (orphan pixels dropped, pinholes filled, hard 0/255 alpha) → **rim light** →
   `turns/<dir16>.png` + `meta.json` (anchors, silhouette widths, provenance).

### Evidence (run it yourself)
- `python poc/qa_turn16.py` → ring registration: **baseline spread 0px, feet-axis 2.0px,
  head-top 4px — PASS** at canon gates. Head-cx traces a clean **sinusoid** around the ring
  (117→108→117→124→119→112→119→128→117): a head orbiting a fixed vertical axis projects
  exactly as a sinusoid. The ring rotates like a 3D object, measurably.
- `python poc/bake_turn16.py --selftest` → honesty check: re-synthesize each canon diagonal
  from its 90°-apart neighbours, score silhouette IoU vs the true art: 0.49–0.66. That is
  the *double-gap* task; production synthesis spans 45°. The gap that remains is genuine
  pose change (the blueprint moves grip between views), which is why we synthesize only
  22.5° transit frames shown 45–110ms — never held poses.
- `poc/proof/architect_ship_turn360.gif` (the ring at 70ms/phase),
  `…turn90_ab.gif` (snap vs 16-phase, same turn), `…turn16_sheet.png` (contact sheet,
  bbox + head crosshair + feet tick), `…turn_strip.png`, `…selftest.png|.md`.

### Rejected alternatives (and why)
- **Scale/skew billboard tricks** — change the rectangle, not the silhouette; reads as a
  card wobbling, never as a body. (Survey: Unity/Godot fake-3D threads.)
- **Pure cross-dissolve morph** — alpha mush, double exposure, palette destruction.
- **imagegen'd intermediates** (hatch-pet `$imagegen` row pipeline) — viable for *quality*
  but regenerates the registration problem per frame (gen art wanders pose/scale — the
  exact artifact stable-slots exists to fix), needs visual QA per frame, and costs per set.
  Right as a **later upgrade for held poses**; wrong as the transit-frame mechanism. The
  baker is deterministic, local, seconds per set, and QA-gated — very RHOBEAR.

---

## 2. The three personality states

All three are **choreography over existing art** (canon loops + the new ring) — zero new
hand art per crew, so they scale to 27 sets for free. Proof GIFs in `poc/proof/`.

**BORED** (resting at station — the default)
- `animating` loop at 0.55× idle fps (slow breathing) + ±1px weight-shift sway (0.22Hz).
- Every 5.5–12s, one random beat: **look-around** (eased 2–4-phase ring sweep, hold,
  return), **fidget** (two walk-frames in place — a foot shuffle), **back-turn beat**
  (canon: face north, hold, return), **sigh** (2.5% vertical squash, feet planted).
- The look-around is deliberately the 3D turn's idle showcase: the room feels alive with
  small believable rotations.

**WORKING** (has a task / the stream is theirs)
- `animating` loop at 1.5× idle fps, facing the station prop; **mint underglow** breathing
  at the feet (0.8Hz, the only added light, brand accent).
- Occasional purposeful pace: two steps along the band and back (busy, not wandering).
- While streaming: walks front-center and the overhead bubble runs (see §3).

**CURIOUS** (the world poked it)
- Triggers: stage click (stimulus) or mouse entering the react radius.
- **Perk** (3.5% vertical stretch, 100ms attack / 260ms decay) + pixel **"!"** glyph (mint,
  engine-drawn, 0.9s, first wake only) → **fast turn-to-stimulus** (45ms/phase, no
  anticipation — reaction, not decision) → lean 2.5px toward it, then **tracks at 16-phase
  granularity** while it moves. Decays back to BORED after 4s of quiet.
- The 16-wind ring is what makes tracking feel alive: the figure micro-rotates toward your
  cursor instead of clunking between 8 facings.

State graph (engine `ActorV2`): `rest(bored|working|curious) ⇄ walk ⇄ turn`, plus
`speak` (stream) and `aside` (panel evasion). Walking always routes facing through ring
phases — there is no snap anywhere in the POC.

---

## 3. How the crew live in the Hub (the floor band)

**The band.** Crew exist only on the lower-third floor of the world bg: band coords
`bx ∈ [0,1]` across the room, `by ∈ [0,1]` depth. `by` maps to screen-y between 70% and
95% of the room height and to scale 0.66→1.06 (farther = smaller + higher), ×1.25 base so
idle crew read ~200px and the front speaker ~300px — "perch like dolls" canon. Painter's
order = `by` sort. In the harness the band carries two crew (architect on the ring,
guardian deliberately left on 8-dir snap as a living A/B).

**Stations.** Each crew member owns a station `{bx, by, phase}` — their rest spot +
facing. Maps 1:1 from `crew-roster.json` `station.pos` (already fractional!) with
`station.face` → phase. Roster `idleKind` (stretch/in-zone/mill/look-sky) becomes the
BORED beat-mix per crew; `work` (type/scan/forge/watch…) selects the WORKING loop.

**Stream choreography** (wired to the real bus contract):
1. `ChatBus` broadcasts every reply as window CustomEvent **`chat:reply`** (chatbus.jsx).
   The room listens; on a reply for the active crew: `summon()` —
2. walk front-center (the **speaking slot**, bx 0.46), eased turn to face **out** (south),
3. the **overhead bubble** streams the text (ChatBubble typewriter gives token-by-token
   feel from a single reply object; a true SSE wire can call `feedToken()` per token —
   both paths are in the harness), the stream panel opens **beside** the speaker,
4. on end: hold 650ms, walk home, turn to station facing, drop to rest. (Verified live:
   round-trips to exact station coords/phase.)

**Sharing the band without crowding.**
- While anyone holds the speaking slot, a ±0.14 exclusion zone around it pushes idle crew
  out (no photobombing the speaker).
- **Step-aside:** UI panels publish their footprint as band x-ranges; covered crew walk to
  the nearest clear x and **dim to 72%** — present, never in the way. They return only
  when their *home* is clear (prevents boundary ping-pong).
- Crew z-index sits **under the chrome**: panels and modals always draw over the band.

**Mouse-react.** Cursor inside a crew's radius (and not working/speaking) → CURIOUS wake
(perk + "!" once, then quiet 16-phase tracking). Click = full stimulus.

---

## 4. Manifest extension (crew-roster.json)

Per character, additive and backward-compatible:
```json
"animation": {
  "...existing...": "...",
  "turn16": { "enabled": true, "mix": "luma", "base": "assets/crew/_turn16/<crew>/<world>" }
},
"station": {
  "...existing pos/face/work/idleKind...": "...",
  "band": { "bx": 0.30, "by": 0.42, "phase": 14 }
}
```
`mix` is the bake disagreement strategy (`luma` for emissive worlds ship/neon, `bayer`
default for western — pick per set at QA). Engine falls back to 8-dir snap wherever
`turn16` is absent — ship-safe rollout.

## 5. Scale plan — 22 minutes to all 27 sets, gated

1. **Bake**: `python bake_turn16.py --crew <c> --world <w> [--mix bayer] --selftest`
   (~5s/set). Batch driver loops MASTER.md's 27 SHIP sets; one worker per crew if
   dispatched (no-clobber by crew folder, own worktree per worker — house rule).
2. **Auto-gates** (`qa_turn16.py`): baseline ≤2px, feet-axis ≤4px, head-top ≤4px, height
   ≤6px. Fail → that set ships with `turn16.enabled: false` (snap fallback) + lands on the
   regen list. Watch-list sets from MASTER.md (head-drift entries) get eyeballed first.
3. **Eyeball pass**: per-set `turn16_sheet.png` + `turn360.gif` — reject on hatch-pet
   criteria (mush, stray limbs, identity drift). Western sets: A/B `--mix` and keep the
   cleaner. Owner spot-checks one crew per world.
4. **Wire**: roster entries flip on per set; HubView gets the band layer (Lane H proper,
   **only after this POC's feel-check passes**).
5. Definition of done: 27 rings, 27 PASS gates, contact sheets archived in `_preview/qa/`,
   MASTER.md gains a `turn16` column.

Storage: 16×236² PNGs ≈ 300–600KB/set → ~8–16MB for 27. Bake is idempotent + versioned in
`meta.json` provenance.

## 6. Honest limitations + next steps

- **Walk cycles stay 8-dir.** Mid-walk turns route through ring phases between *gait*
  frames, so they sweep — but the gait itself doesn't get 16 headings. Same machinery on
  same-index walk frames is plausible (legs may not phase-align between neighbours; needs
  one experiment). Stretch, not blocker.
- **Synth frames are transit-only.** They're built to be seen for 45–110ms. The engine
  never rests on an odd phase except during active mouse-tracking (looks fine in practice;
  the harness's "pin phase" debug proves stills hold up, but held-pose quality is where
  the imagegen upgrade would land if ever wanted).
- **The "!" glyph + underglow** are engine-drawn (not baked) — by design (hatch-pet bans
  detached effects in frames; presentation effects belong to the renderer).
- **dpr**: canvas backs at devicePixelRatio (1.25 on the dev box) — pixel art stays crisp.
- The marketing-site `.bob` CSS hover-bob applies to DOM sprites; the band's canvas bob
  replaces it in-room (same soul, right medium).

## 7. File map (all new, all in-lane)

```
hub/assets/crew/_preview/poc/
  bake_turn16.py            the baker (register → warp → merge → light → meta)
  qa_turn16.py              ring registration gates + contact sheet
  make_choreo_gifs.py       personality/turn proof GIFs at engine cadence
  sprite-engine-v2.js       additive engine layer: TurnRing/ActorV2/Band (v1 untouched)
  hub-poc.html              the POC room: band, stations, stream, panel, moods, A/B
  bg-ship.png               world bg copy (from rhobear-design assets)
  turn16/architect/ship/    turns/<16 headings>.png · turns_raw/ · meta.json
  proof/                    turn360 + turn90_ab + bored/curious/working GIFs,
                            contact sheets, strip, selftest report
docs/H-SPRITE-DESIGN.md     this file
```
Canon `hub/assets/crew/<crew>/<world>/` trees: **untouched**. Shipped `hub/ui_kits/app/*`:
**untouched**. Engine v1 + preview.html: **untouched**.
