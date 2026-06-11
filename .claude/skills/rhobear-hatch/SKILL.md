---
name: rhobear-hatch
description: >-
  THE complete RHOBEAR crew sprite process — from source frames to a 3D-reading
  16-phase turn, the three personality states (BORED/WORKING/CURIOUS), floor-band
  hub behavior, QA gates, and hub wiring. Fire this when the user asks to
  hatch/animate a crew member or world, make the turn read 3D, bake a turn ring,
  add personality/idle behavior, wire crew into the hub room, fix a "head not
  attached / jittery / popping / ghost-double" sprite, or QA a sprite tree.
  Codifies the proven Lane-H pipeline (worked example: architect/ship; rehearsed
  second set: builder/western) with numeric pass/fail gates so a careful smaller
  model can reproduce the result by rote. Pairs with `rhobear-design` (brand +
  placement canon).
user-invocable: true
---

# RHOBEAR Hatch — the crew sprite process, end to end

This skill makes RHOBEAR's pixel-art crew walk, idle, react, speak — and TURN
LIKE 3D BODIES — on the hub. Every step below is a command plus a pass/fail
check; taste has been converted into numbers and reference images wherever we
knew how. **If you are a smaller model: read §1 (contract), then execute §8
(fast path) by rote. Open the references only when a gate fails.**

## WHEN TO USE
- "animate / hatch <crew> (<world>)", "make the turn read 3D", "bake the turn ring"
- "give the crew personality / idle behavior", "wire the crew into the hub room"
- "the head isn't attached", "the sprite ghosts/doubles mid-turn", "QA the sprites"

---

## §0 PIPELINE MAP

```
 [A source frames]──►[B contract normalize]──►[C source QA]──►[D 16-ring bake]──►[E ring gates]
  extraction or        names+236+layout        measure_         bake_turn16.py     qa_turn16.py
  imagegen (G1/G2)     classify-by-prefix      registration     (+selftest,        (5 numeric
                                               (warn-only)       mix gate)          gates+sheet)
                                                                                       │
 [J fleet scale]◄──[I owner gate]◄──[H hub wiring]◄──[G feel-check]◄──[F states/choreo]
  loop §8 over       STOP+report     CrewLayer in     hub-poc.html     engine-side, zero
  MASTER.md sets     (house rule)    HubView (§4)     ?crew=&world=    new art (§3)
```

- **A — source frames.** 27 crew/world sets already exist and are all SHIP
  (see `reports/MASTER.md` in the `_preview` tree). Only missing/broken sets
  go through imagegen (`references/imagegen-prompts.md`).
- **B — contract normalize.** Whatever produced the frames, they must land in
  the exact on-disk layout of §1 at exactly 236×236 (NEAREST resize).
- **C — source QA.** `measure_registration.py` quantifies head-detach risk.
  Flags are tolerated (the engine's head-anchor pins them at runtime);
  spreads > 15px mean a genuinely broken frame.
- **D — the 16-ring bake.** `bake_turn16.py` registers the 8 canon rotation
  stills to a common feet axis, synthesizes the 8 missing 22.5° headings with
  a silhouette-adaptive cylindrical warp, merges palette-pure, bakes a
  world-fixed mint rim light, writes `turns/` + `meta.json`, and prints the
  mix gate. This is the crown jewel — §2.
- **E — ring gates.** `qa_turn16.py` enforces 5 numeric gates + a contact
  sheet. PASS is binary.
- **F — states/choreography.** BORED/WORKING/CURIOUS are engine behavior over
  existing frames + the ring. Zero new art per set — §3.
- **G — feel-check.** The parameterized harness `hub-poc.html?crew=&world=`
  plays the whole hub concept for one set. 6 scripted interactions — §8.9.
- **H — hub wiring.** A canvas CrewLayer under the hub chrome, fed by the
  roster manifest and the `chat:reply` event — §4.
- **I — owner gate.** STOP after one set / before HubView. House rule: root →
  confirm direction → THEN scale.
- **J — fleet scale.** The §8 loop per set, ~1 minute each, gated.

## §1 THE ON-DISK CONTRACT (derive by CONVENTION)

> ⚠️ `metadata.json` `frames` paths are **STALE** — never read them. Build
> paths from convention:

```
hub/assets/crew/<crew>/<world>/
  rotations/<dir>.png                 # 1 still per direction (idle / turn)
  walking/<dir>/frame_000..005.png    # 6-frame walk cycle
  animating/<dir>/frame_000..003.png  # 4-frame idle/reactive loop
```
- `<dir>` ∈ `south, south-west, west, north-west, north, north-east, east,
  south-east` (engine DIRS order: index = 45°·i clockwise-from-south on screen).
- Cell **236×236**, transparent, alpha-presence threshold 16. Anchor = feet.
- Crews: 9 × worlds {ship, western, neon}. All 27 SHIP per `reports/MASTER.md`.

**The baked turn ring (new, additive — canon dirs above are NEVER touched):**
```
hub/assets/crew/_preview/poc/turn16/<crew>/<world>/
  turns/<dir16>.png      # 16 lit headings, 22.5° apart
  turns_raw/<mid>.png    # the 8 synths pre-light (debug)
  meta.json              # anchors, per-heading silhouette widths, mix_check, provenance
```
`<dir16>` order: `south, south-south-west, south-west, west-south-west, west,
west-north-west, north-west, north-north-west, north, north-north-east,
north-east, east-north-east, east, east-south-east, south-east,
south-south-east` (phase index 0..15; even = canon, odd = synth).

**Roster manifest extension** (additive, per character in
`hub/ui_kits/app/crew-roster.json`; absence = engine falls back to 8-dir snap).
A character spans all three worlds, so `base` is a per-world TEMPLATE: the
loader substitutes the literal token `<world>` with the active world at load
time (see the CrewLayer snippet in §4):
```json
"animation": { "turn16": { "enabled": true, "mix": "luma",
               "base": "assets/crew/_turn16/architect/<world>" } },
"station":   { "band": { "bx": 0.30, "by": 0.42, "phase": 14 } }
```

## §2 THE 3D TURN (the crown jewel)

**What makes it read as 3D — five stacked cues:** (1) 16 real headings instead
of 8; (2) rotation-true parallax inside the synthesized in-betweens
(silhouette-adaptive cylindrical warp — features near the body axis slide
faster than features at the rim, exactly like a rotating volume); (3) a
world-fixed mint rim light (`#7dffd5`, key up-left, SAME vector for all 16 —
the light stays put while the figure rotates beneath it); (4) a contact shadow
whose width tracks the heading's silhouette width; (5) eased choreography —
anticipate 95ms → 52ms/phase → settle 110ms, +1-phase overshoot on arcs ≥90°.
Full math, failure modes, and knob reference: `references/turn-technique.md`.

**The literal commands that produced the worked example** (this is the whole
mechanism — there is no hidden art step):
```bash
cd <worktree>/hub/assets/crew/_preview/poc
python bake_turn16.py --crew architect --world ship --selftest
python qa_turn16.py   --crew architect --world ship          # must print PASS
python make_choreo_gifs.py --crew architect --world ship
```
The only decision the baker leaves you is `--mix`, and it makes it for you:
obey the printed `mix check … -> verdict` line (`OK` = keep; `TOO BRIGHT` =
rerun with `--mix bayer`). Measured anchors: architect/ship luma ratio 1.17
(OK), builder/western luma 1.19 (flips to bayer, lands 0.94). Gate ≤ 1.18.

**Before/after:** `references/example-before-after.png` (8 gappy snaps vs the
filled lit ring) and `references/architect_ship_turn90_ab.gif` (same 90° turn,
snap vs 16-phase, looping). **What failure looks like:**
`references/example-bad-turn-sheet.png`.

**Where imagegen fits:** nowhere in the turn. Generated in-betweens re-create
the registration drift that stable-slots exists to fix. Image generation is
for missing/broken SOURCE sets only — fill-in-the-blank templates with
parameters, frame counts, and an acceptance pipeline live in
`references/imagegen-prompts.md`.

## §3 THE THREE PERSONALITY STATES (exact recipes — zero new art)

All three are choreography over existing frames + the ring, implemented in
`scripts/poc-kit/sprite-engine-v2.js` (TUNE2). Proof GIFs:
`references/architect_ship_{bored,curious,working}.gif`.

| state | frames used | playback | the beats (exact) |
|---|---|---|---|
| **BORED** (default rest) | `animating/<facing>` + ring phases | animating at **0.55×** idleFps (≈3.3fps) | continuous ±0.9px x-sway at 0.22Hz; every **5.5–12s** ONE random beat: **look-around** = eased ring sweep of 2–4 phases (95/52/110ms steps), hold 700–1300ms, sweep back · **fidget** = 2 walking frames in place ×2 · **back-turn** = turn to north (phase 8), hold 850ms, return · **sigh** = 2.5% vertical squash over 0.8s, feet planted |
| **WORKING** (has the task) | `animating/<station-facing>` | **1.5×** idleFps (≈9fps) | mint underglow ellipse at feet breathing alpha 0.10→0.26 at 0.8Hz; every 5–10s pace ±0.045 band-x and return; while streaming → speak choreography (§4) |
| **CURIOUS** (world poked it) | ring phases + `animating` | idleFps | trigger = stage click or cursor within 220px: **perk** scaleY→1.035 (100ms attack/260ms decay) + mint pixel "!" 0.9s (first wake only) → **fast turn** to stimulus at 45ms/phase (no anticipation — reaction, not decision) → lean 2.5px toward it → track at 16-phase granularity; decay to BORED after **4s** quiet |

State graph: `rest(bored|working|curious) ⇄ walk ⇄ turn`, plus `speak` and
`aside`. Walking routes facing through ring phases (60ms/phase) — no snaps
anywhere. Optional bespoke hand-authored loops (owner-ask only): T5 deltas in
`references/imagegen-prompts.md`.

## §4 HUB PLACEMENT + BEHAVIOR (the floor band)

**Band math** (engine `Band`, canvas CSS px):
```
y(bx,by)    = (0.70 + 0.25·by) · H          # by∈[0,1]: 0=back of floor, 1=front
scale(by)   = (0.66 + 0.40·by) · 1.25       # farther = smaller; 1.25 = "doll size"
draw order  = sort by `by` (painter's)      # front overdraws back
speaking slot = (bx 0.46, by 0.86); exclusion ±0.14 while anyone speaks
```
**Stations from the roster:** `bx = station.pos.x` (use `posOverrides[world]`
if present); `by = clamp((station.pos.y − 0.70)/0.25, 0, 1)`; facing phase =
`14 (south-east)` if `station.face === 1`, else `2 (south-west)`. Roster
`idleKind` flavors the BORED beat mix; `work` names the WORKING loop.

**Stream choreography** (wired to the real bus): `chatbus.jsx` broadcasts every
reply as window CustomEvent **`chat:reply`** (detail = reply object). On a
reply for the active crew: `actor.summon()` → walk to the speaking slot →
eased turn to phase 0 (face out) → `bubble.say('')` + `bubble.append(reply.text)`
(the ChatBubble typewriter paces it token-by-token; a true SSE wire calls
`actor.feedToken(tok)` per token) → stream panel opens BESIDE the speaker →
on end: hold 650ms → `actor.dismiss()` walks home, turns to station phase,
rests. Verified round-trip: exact station coords/phase restored.

**Step-aside:** UI panels publish their footprint as band-x ranges via
`band.setAvoid([[x0,x1],…])`. Covered idle crew walk to the nearest clear x
and dim to 72%; they return only when their HOME is clear (prevents boundary
ping-pong). The speaker never evades. Crew z-index sits UNDER the chrome.

**Engine API (v1 + v2, both `window.*` globals — the hub is browser-JSX, no
ES imports):**
```
V1 RhobearSprites:   SpriteSheet(base).load() · .computeTransforms('head')
                     SpriteActor (legacy) · ChatBubble(el): say/append/update/positionAt/hide
                     TUNE {walkFps 10, idleFps 6, walkSpeed 90, mouseReactRadius 220, bubbleCharMs 18}
V2 RhobearSpritesV2: TurnRing(base).load() · Band(canvas,{spriteScale}) · ActorV2({name,sheet,ring,band,station})
                     actor.setMood('bored'|'working'|'curious') · walkTo(bx,by,after) · turnTo(phase,{fast})
                     summon() · dismiss() · stimulus(bx,by) · pokeMouse(bx,by) · feedToken(tok)
                     band.add(actor) · setAvoid(ranges) · update(dt) · draw(ctx)
```

**HubView wiring (Lane H, ONLY after owner go).** Script order in the app
page: `sprite-engine.js` → `sprite-engine-v2.js` → `crew-layer.jsx` → views.
World prop mapping is NOT 1:1 — `{space:'ship', west:'western', neon:'neon'}`.
Drop-in (browser-JSX conventions: `// FILE:` header, window global, no imports):
```jsx
// FILE: crew-layer.jsx
function CrewLayer({ world }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const V1 = window.RhobearSprites, V2 = window.RhobearSpritesV2;
    const aw = { space: "ship", west: "western", neon: "neon" }[world] || "ship";
    const canvas = ref.current; if (!V1 || !V2 || !canvas) return;
    const fit = () => { const r = canvas.getBoundingClientRect(), d = devicePixelRatio || 1;
      canvas.width = r.width * d; canvas.height = r.height * d;
      canvas._cssW = r.width; canvas._cssH = r.height; canvas._dpr = d; };
    fit(); window.addEventListener("resize", fit);
    const band = new V2.Band(canvas, { spriteScale: 1.25 });
    let live = true, raf = 0, speaker = null;
    (async () => {
      // confirm the characters accessor in crew-roster-loader.jsx at wiring time;
      // station.band per §1 manifest extension, fallback = pos mapping above.
      const chars = (window.CrewRosterLoader.loadRoster().characters || []);
      for (const c of chars.filter((c) => c.isStartingCrew)) {
        const sheet = await new V1.SpriteSheet(`assets/crew/${c.id}/${aw}`).load();
        const t16 = c.animation && c.animation.turn16;
        const ring = t16 && t16.enabled ? await new V2.TurnRing(t16.base.replace("<world>", aw)).load() : null;
        const st = c.station.band || { bx: c.station.pos.x,
          by: Math.max(0, Math.min(1, (c.station.pos.y - 0.70) / 0.25)),
          phase: c.station.face === 1 ? 14 : 2 };
        const a = band.add(new V2.ActorV2({ name: c.id, sheet, ring, band, station: st }));
        if (!speaker) speaker = a;                       // active crew = first starter
      }
    })();
    const onReply = (e) => { const r = e.detail || {};
      if (r.kind !== "reply" || !r.text || !speaker) return;
      speaker.setMood("working"); speaker.summon(); /* bubble: hub ChatBubble owns text */ };
    window.addEventListener("chat:reply", onReply);
    const ctx = canvas.getContext("2d"); let prev = performance.now();
    const loop = (now) => { if (!live) return;
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      const d = canvas._dpr || 1; ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, canvas._cssW, canvas._cssH);
      band.update(dt); band.draw(ctx); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { live = false; cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit); window.removeEventListener("chat:reply", onReply); };
  }, [world]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}
Object.assign(window, { CrewLayer });
```
In `HubView.jsx`, add `<CrewLayer world={world} />` between the scrim div and
`<ChatBubble />`. **Asset promotion at wiring time:** the rings bake into the
POC tree (`_preview/poc/turn16/…`); for the shipped hub, copy each approved
ring to `hub/assets/crew/_turn16/<crew>/<world>/` (a NEW top-level dir — canon
crew dirs stay untouched) and point the roster `base` template there.
Standalone-build note: the inliner only bundles assets it SEES as literals —
list the `_turn16` paths in `crew-sprites.jsx`'s `_REFERENCED` block like the
existing sprite paths.

## §5 THE QA LOOP

| tool | when | gate |
|---|---|---|
| `scripts/measure_registration.py <crew> <world> [--base …]` | before bake; after any (re)generation | flags (>4px) tolerated — runtime head-anchor pins them; **>15px = broken frame, regen it**; missing dirs = stop |
| `scripts/make_contact_sheet.py <crew> <world> --kind walking\|animating [--base …]` | judging source art | eyeball vs `references/example-good-walking-sheet.png` |
| `poc-kit/bake_turn16.py --selftest` | every bake | mix ratio ≤ 1.18 (printed verdict); selftest IoU ≥ 0.40/pair (alarm line, not hard fail) |
| `poc-kit/qa_turn16.py` | every bake | **PASS required**: baseline ≤2 · feetCx ≤4 · headTop ≤4 · height ≤6 · **synthMidDev ≤4** |

**How to judge a sheet (the crosshair rule).** Every cell draws the figure's
bbox (green), head-anchor crosshair (red), feet tick (mint). GOOD
(`references/example-good-turn16-sheet.png`): ONE red cross per head, crosses
level across the row, feet ticks on one line, headCx drifting smoothly =
the head orbiting the axis (a sinusoid around the ring is CORRECT — it is
rotation, not error). BAD (`references/example-bad-turn-sheet.png`, top row):
crosses sitting BETWEEN two heads, double limbs, translucent mush edges,
baseline stair-steps. The second-set rehearsal sheet
(`references/example-second-set-builder-western.png`) shows acceptable bayer
checker texture on a non-emissive set.

**Why synthMidDev is the synth-health gate:** canon headings may legitimately
step headCx by 8px+ (builder/western's hat swings 14.4px between W and NW);
a HEALTHY synth sits at the midpoint of its canon neighbours (measured ≤
0.54px on both worked sets); a ghost shifts it several px. Gate ≤ 4px.

**Anchor mode:** keep `head` (default — the fix that made motion look right).
Switch a sequence to `feet` only if the contact sheet shows feet sliding >3px
while the head stays pinned.

## §6 GOTCHAS — failure-mode table (symptom → cause → exact fix)

| symptom | cause | fix |
|---|---|---|
| Head reads "not attached"; figure pops scale/baseline frame-to-frame | frames extracted per-frame fit-to-cell | stable-slots head-anchor: `SpriteSheet.computeTransforms('head')` — automatic at load in the engine; never "fix" by editing frames |
| TWO heads / doubled limbs in a synthesized turn frame | warp about a single global axis; neighbouring views shift posture | per-row center/width normalization (in `synth_mid`) — never reimplement with a global cylinder |
| Synth frames speckled "tweed" texture | per-pixel 50/50 interleave of disagreeing sources | colour-aware merge: agree→snap-average, disagree→luma-union or 2×2 bayer (in `bayer_mix`) |
| Synth frames washed/glowing brighter than canon | luma-union on a non-emissive costume | obey the printed mix gate: ratio >1.18 → `--mix bayer` |
| 2×2 checker visible in synth frames | bayer mode disagreement regions | expected at transit speed; only reject if visible in the 70ms GIF |
| `(none)`/missing rows; rows named `striding`, `moving`, hash-suffixed splits | AI generation naming chaos; batch-split rows | classify by prefix: `animating*`→animating, else walking; merge splits in frame order |
| Mixed frame sizes (224–252px) | generator drift | resize EVERY frame to exactly 236×236 NEAREST before install |
| `widow` paths anywhere | old crew name | scrub paths + metadata to `lattice` |
| Frame paths in metadata.json point at missing dirs | stale extraction paths | never read `metadata.json` frames; derive by §1 convention |
| `measure_registration` can't find files | old default-base doubled `hub/` (fixed) or odd layout | pass `--base <crew-root>` explicitly |
| Crew bounce between panel edge and station | evade returned home while home still covered | home-clear gate in `evade()` (engine v2 ≥ poc-kit) |
| Idle crew photobomb the speaker | no slot reservation | Band speaking-slot exclusion ±0.14 (v2) |
| Pixel art renders soft/blurry in the hub | canvas not backed at devicePixelRatio (1.25 on dev box) | dpr-scaled backing + `setTransform(dpr,…)` + `imageSmoothingEnabled=false` (see CrewLayer) |
| Warm/orange pixels inside turn frames | the character's skin-tone hands from canon art | NOT a brand violation — brand law bans orange UI accents, not skin. Only flag chrome/UI orange |
| `git worktree add` → "already used by worktree" | branch checked out in another live worktree | `git worktree add <dir> -b <new-branch> <base-branch>` |
| Proof artifacts missing from commits | `_preview/.gitignore` ignores `qa/` everywhere | owner-facing evidence goes to `poc/proof/` (committed); `qa/` stays scratch |
| Stabilization silently off in preview | `file://` canvas taint blocks getImageData | always serve over http (`python -m http.server`) |
| Hub world prop doesn't match asset dirs | HubView uses `space/west/neon` | map `{space:ship, west:western, neon:neon}` |
| Harness shows dark room, no bg | `bg-<world>.png` not copied beside hub-poc.html | `cp <rhobear-design>/assets/bg-<world>.png poc/` (harness degrades gracefully) |

## §7 RESOURCES (everything this process leans on)

- **This skill's tools:** `scripts/` (v1 engine + measure + contact sheet +
  `build_master_report.py` fleet pass + `make_reference_examples.py`),
  `scripts/poc-kit/` (bake/qa/gifs/engine-v2/harness — canonical copies),
  `references/` (technique writeup, imagegen templates, example sheets/GIFs,
  worked-example design doc `H-SPRITE-DESIGN.md`, legacy `preview.html`).
- **In-repo:** the 27 sets at `hub/assets/crew/<crew>/<world>/` (branch
  `feat/hub-wave5-wiring` and descendants; POC branch `feat/h-fable-sprites`
  carries the kit in-tree) · `reports/MASTER.md` (fleet verdicts + drift
  watch) · `hub/ui_kits/app/crew-roster.json` (stations, palettes, idleKind,
  work, voice) · `chatbus.jsx` (the `chat:reply` contract) · `HubView.jsx` /
  `crew-sprites.jsx` (wiring surfaces + inliner constraint).
- **Sibling skill:** `rhobear-design` — brand law (never redraw the bear or
  wordmark; mint `#7dffd5` accent; crew perch 200–400px "like dolls"; never
  orange UI), world backgrounds `assets/bg-{ship,western,neon}.png`, palettes.
- **Process basis:** `openai/skills` → `skills/.curated/hatch-pet` — base-ref
  + row-strip generation, stable-slots, the QA reject list (no text/grids/
  bubbles/detached fx/scenery), mirroring caution.
- **External technique (researched for the POC):** Dead Cells' 3D-to-pixel
  pipeline (gamedeveloper.com Art Design Deep Dive) — lighting sells volume,
  hence the world-fixed rim light · classic animation principles (anticipation,
  follow-through, secondary action) — hence the eased turn + idle fidget
  layers · Unity/Godot fake-3D billboard threads — the negative result that
  scale/skew tricks don't change silhouettes (rejected approach).

## §8 LOWER-MODEL FAST PATH — new crew/world to QA-green, by rote

Set once: `CREW=<crew>`, `WORLD=<world>`. Fixed paths used below:
`SKILL=D:/rhobear/.claude/skills/rhobear-hatch` ·
`DESIGN=D:/rhobear/.claude/skills/rhobear-design` ·
`WT=D:/wt-hatch-$CREW` (the worktree you create in step 2). Every step =
command → PASS check → on-fail action. Do not skip, reorder, or improvise.

1. **Preconditions.** `python -c "import PIL, numpy"` → silent = OK (else
   `pip install pillow numpy`).
2. **Worktree (never work on a shared checkout).**
   ```
   git -C D:/rhobear-app fetch origin
   git -C D:/rhobear-app worktree add ../wt-hatch-$CREW -b feat/h-turn16-$CREW-$WORLD feat/h-fable-sprites
   ```
   "already used by worktree" → you named an existing dir; pick another.
   "invalid reference: feat/h-fable-sprites" → that branch is gone; base off
   `feat/hub-wave5-wiring` instead (the kit copy below fills the gap).
   PASS: `$WT/hub/assets/crew/_preview/poc/bake_turn16.py` exists.
   Missing → `mkdir -p $WT/hub/assets/crew/_preview/poc && cp $SKILL/scripts/poc-kit/* $WT/hub/assets/crew/_preview/poc/`.
   **Sync check:** `grep -l synthMidDev $WT/hub/assets/crew/_preview/poc/qa_turn16.py`
   — no hit = in-tree kit older than the skill → overwrite it from
   `$SKILL/scripts/poc-kit/` (the skill copy is canonical).
3. **Set is SHIP + inventory.** Open
   `$WT/hub/assets/crew/_preview/reports/MASTER.md`: row `$CREW/$WORLD` must
   say **SHIP** (not SHIP/missing → `references/imagegen-prompts.md` G1/G2 +
   acceptance pipeline first, then return here). Then from `$WT`:
   `for k in rotations walking animating; do find hub/assets/crew/$CREW/$WORLD/$k -name "*.png" | wc -l; done`
   PASS: exactly `8 / 48 / 32`. Else → imagegen G1 path.
4. **Source registration.** `python hub/assets/crew/_preview/measure_registration.py $CREW $WORLD`
   PASS: runs to the summary line. Flagged sequences are OK (note them).
   Any spread > 15 or `(missing)` rows → broken source: imagegen G2 for that
   row, acceptance pipeline, re-run.
5. **Bake.** `cd $WT/hub/assets/crew/_preview/poc && python bake_turn16.py --crew $CREW --world $WORLD --selftest`
   (stay in this directory for steps 6–8 — their paths are relative to it)
   PASS: prints `baked 16 headings`, `mix check … -> OK`, all selftest pairs
   ≥ 0.40. On `TOO BRIGHT` the fix is exactly:
   `python bake_turn16.py --crew $CREW --world $WORLD --mix bayer`
   (expected for most western sets — measured: builder/western 1.19→0.94).
   Any IoU < 0.40 → continue but write "ring-risk" in your report; step 7 decides.
6. **Ring gates.** `python qa_turn16.py --crew $CREW --world $WORLD`
   PASS: final line `=> PASS`. Fail map: `baseline|feetCx` → source feet
   broken (stop; G2 the rotations) · `headTop|height` → a rotation still
   isn't 236-normalized (step 4 of imagegen acceptance) · `synthMidDev` →
   rebake with the other `--mix`; if still failing, ship the set WITHOUT the
   ring (roster `turn16.enabled:false`) and say so in the report.
7. **Eyeball** `proof/${CREW}_${WORLD}_turn_strip.png` + `_turn16_sheet.png`
   against `references/example-good-turn16-sheet.png` and
   `example-bad-turn-sheet.png`. Reject a cell on any of: (a) two heads /
   doubled limbs, (b) hole >2px inside the silhouette, (c) stray pixels >3px
   off the body, (d) synth cells washed brighter than BOTH canon neighbours,
   (e) feet ticks not level. Bayer checker texture = acceptable. Any reject →
   flip `--mix`, redo 5–7 once; still rejected → ring off for this set, report.
8. **Proof GIFs.** `python make_choreo_gifs.py --crew $CREW --world $WORLD`
   PASS: 4 GIFs in `proof/`; open `turn90_ab.gif` — the right side must show
   ≥3 distinct intermediate poses while the left side snaps.
9. **Live feel-check.**
   `cp $DESIGN/assets/bg-$WORLD.png $WT/hub/assets/crew/_preview/poc/` (skip if
   present) → `python -m http.server 8139 --directory $WT` → open
   `http://127.0.0.1:8139/hub/assets/crew/_preview/poc/hub-poc.html?crew=$CREW&world=$WORLD`.
   PASS: 0 console errors (F12 → Console, or your preview tool's error log)
   AND all six:
   | do | must observe |
   |---|---|
   | ▶ Stream reply | hero walks front-center, turns to face out, bubble typewrites, panel slides in, companion walks clear of it and dims |
   | ✕ End | hero walks back to station, turns to station facing, rests; companion returns, undims |
   | click the stage floor | mint "!", fast eased turn toward the click, then 16-phase cursor tracking |
   | ⟳ 360° | one full smooth sweep through 16 phases |
   | A/B toggle | snap mode visibly coarser than ring mode on the same 90° turn |
   | wait 15s in Bored | at least one beat plays (look-around / fidget / back-turn / sigh) |
10. **Commit** (worktree branch; evidence included):
    ```
    git add hub/assets/crew/_preview/poc/turn16/$CREW/$WORLD \
            hub/assets/crew/_preview/poc/proof/${CREW}_${WORLD}_* \
            hub/assets/crew/_preview/poc/bg-$WORLD.png
    git commit -m "feat(h-sprites): 16-phase lit turn ring for $CREW/$WORLD — gates PASS"
    ```
11. **STOP. Report to the owner** with: the qa gates output, the strip, the
    turn90_ab GIF, the harness URL, and any ring-risk/ring-off notes. Do NOT
    scale to more sets and do NOT touch HubView until the owner says go.
    (House rule: root → confirm → iterate → then run.)

**After owner go — fleet scale:** repeat steps 3–8 per SHIP row of MASTER.md
(~1 min/set; one worker per CREW in its own worktree if parallel), then §4
wiring, then add a `turn16` column to MASTER.md.

## THE WALL
Sprite/QA output is local + reversible — generate freely, but: never mutate
the canon PNGs in place (everything new lands in `_preview/poc/`); never
redraw the bear or the `RHOBEAR` wordmark (see `rhobear-design`); never wire
HubView or scale past one set before the owner's feel-check; commit evidence
to `poc/proof/` and leave `qa/` as scratch.

## SOURCE
Process basis: `openai/skills` → `skills/.curated/hatch-pet`. v1 engine +
fleet QA built 2026-06-10 (branch `feat/hub-wave5-wiring`). 3D turn, states,
hub behavior + this teach-down: Lane H POC (Fable), branch
`feat/h-fable-sprites`, worked example architect/ship, rehearsed cold on
builder/western (which is how the mix gate and synthMidDev gate earned their
thresholds). Worked-example design doc: `references/H-SPRITE-DESIGN.md`.
