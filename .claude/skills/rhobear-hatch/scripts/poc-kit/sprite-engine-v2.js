// FILE: sprite-engine-v2.js — RHOBEAR crew engine, Lane H POC layer (Fable).
// LOADS AFTER ../sprite-engine.js and only ADDS: window.RhobearSpritesV2.
// The v1 engine and the 27 canon sets are untouched.
//
// What this layer adds:
//   TurnRing    — 16-heading lit turn ring (poc/turn16/<crew>/<world>/turns/)
//   ActorV2     — continuous-heading actor: eased 16-phase 3D turns
//                 (anticipation -> accelerate -> settle -> overshoot),
//                 three personality states (BORED / WORKING / CURIOUS),
//                 hub behaviors (summon-to-front + speak, return-to-station,
//                 step-aside, mouse/stimulus react), contact shadow whose
//                 width breathes with the per-heading silhouette (meta.json),
//                 station underglow, perk "!" glyph, depth-scaled floor band.
//   Band        — the floor band: y<->depth mapping, actor registry, y-sort,
//                 panel avoid-rects, front-center speaking slot.
//
// Heading model: phase index 0..15, 22.5 deg steps clockwise-from-south,
// matching the baker's DIRS16 (even phases = canon 8, odd = synthesized).

(function (global) {
  'use strict';
  const V1 = global.RhobearSprites;
  if (!V1) { console.error('sprite-engine-v2: load ../sprite-engine.js first'); return; }

  const DIRS8 = V1.DIRS; // ['south','south-west',...]
  const DIRS16 = [
    'south', 'south-south-west', 'south-west', 'west-south-west',
    'west', 'west-north-west', 'north-west', 'north-north-west',
    'north', 'north-north-east', 'north-east', 'east-north-east',
    'east', 'east-south-east', 'south-east', 'south-south-east',
  ];
  const PHASES = 16;

  const TUNE2 = {
    turnMsMid: 52,        // per-phase transit (mid-arc, fastest)
    turnMsAnticipate: 95, // first phase (wind-up beat)
    turnMsSettle: 110,    // last phase (ease-in landing)
    overshootArc: 4,      // phases >= this get a 1-phase overshoot + return
    walkTurnMs: 60,       // per-phase while turning on the move
    boredIdleFpsK: 0.55,  // x TUNE.idleFps
    workIdleFpsK: 1.5,
    boredBeatMinS: 5.5, boredBeatMaxS: 12,
    curiousHoldS: 4.0,
    perkS: 0.10, perkDecayS: 0.26, perkScale: 1.035,
    leanPx: 2.5,
    swayHz: 0.22, swayPx: 0.9,
    bobPx: 1.0,
    shadowAlpha: 0.30, shadowK: 0.46,
    glowHz: 0.8, glowAlphaMin: 0.10, glowAlphaMax: 0.26,
    asideDim: 0.72,
    speakHoldMs: 650,
  };

  function phaseOfDir8(d) { return DIRS8.indexOf(d) * 2; }
  function dir8OfPhase(p) { return DIRS8[Math.round(((p % 16) + 16) % 16 / 2) % 8]; }
  function phaseFromVector(dx, dy) {
    const ang = Math.atan2(dy, dx) * 180 / Math.PI; // 0=east, y down
    let fromSouth = ((ang - 90) % 360 + 360) % 360; // 0=south, clockwise
    return Math.round(fromSouth / 22.5) % PHASES;
  }
  function arcDelta(from, to) { // signed shortest arc in phases (-8..8]
    let d = ((to - from) % PHASES + PHASES) % PHASES;
    if (d > PHASES / 2) d -= PHASES;
    return d;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function loadImage(src) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = src;
    });
  }

  // ---- the 16-heading lit turn ring -----------------------------------------
  class TurnRing {
    constructor(base) { this.base = base.replace(/\/+$/, ''); this.frames = {}; this.meta = null; this.ready = false; }
    async load() {
      const jobs = DIRS16.map((d) =>
        loadImage(`${this.base}/turns/${d}.png`).then((im) => (this.frames[d] = im)));
      jobs.push(fetch(`${this.base}/meta.json`).then((r) => r.json()).then((m) => (this.meta = m)).catch(() => null));
      await Promise.all(jobs);
      this.ready = DIRS16.every((d) => this.frames[d]);
      return this;
    }
    frame(phase) { return this.frames[DIRS16[((phase % 16) + 16) % 16]] || null; }
    widthOf(phase) {
      const h = this.meta && this.meta.headings[DIRS16[((phase % 16) + 16) % 16]];
      return h ? h.width : 90;
    }
  }

  // ---- one crew member on the floor band ------------------------------------
  // states: rest | walk | turn | speak | work | curious | aside
  class ActorV2 {
    constructor(opts) {
      this.name = opts.name || 'crew';
      this.sheet = opts.sheet;            // v1 SpriteSheet (walking/animating/rotations)
      this.ring = opts.ring || null;      // TurnRing or null => 8-dir snap mode (A/B)
      this.band = opts.band;
      this.station = opts.station;        // {bx (0..1 band x), by (0..1 band depth), phase}
      this.bx = opts.bx != null ? opts.bx : this.station.bx;
      this.by = opts.by != null ? opts.by : this.station.by;
      this.phase = opts.phase != null ? opts.phase : this.station.phase;
      this.state = 'rest';
      this.mood = 'bored';                // bored | working | curious (rest-state flavor)
      this.use16 = !!this.ring;

      this._anim = { t: 0, frame: 0 };
      this._turn = null;                  // {steps:[{phase,ms}], i, t, after}
      this._walk = null;                  // {tx, ty, after, speak}
      this._beatIn = this._rollBeat();
      this._beat = null;                  // running bored beat {kind, t, dur, data}
      this._perk = 0;                     // perk envelope 0..1
      this._lean = 0;
      this._glyphT = 0;                   // "!" time remaining
      this._curiousT = 0;
      this._stim = null;                  // {bx, by} stimulus in band coords
      this._dim = 1; this._dimTarget = 1;
      this._clock = 0;
      this._speaking = false;
      this._workPaceIn = 4 + Math.random() * 4;
      this._home = { bx: this.station.bx, by: this.station.by, phase: this.station.phase };
      this.bubble = null;                 // ChatBubble attach point (harness wires it)
    }

    // ---- public API ---------------------------------------------------------
    setMood(m) {
      if (this.mood === m) return;
      this.mood = m;
      this._beat = null;
      this._beatIn = this._rollBeat();
      if (m === 'curious') this._curiousT = TUNE2.curiousHoldS;
    }

    // walk along the band to (bx, by). after() runs on arrival.
    walkTo(bx, by, after) {
      this._walk = { tx: clamp(bx, 0.03, 0.97), ty: clamp(by == null ? this.by : by, 0, 1), after: after || null };
      this._beat = null;
      this._setState('walk');
    }

    stop() { this._walk = null; this._turn = null; this._setState('rest'); }

    // eased 16-phase rotation to target phase. opts: {fast, after, overshoot}
    turnTo(phase, opts = {}) {
      const target = ((phase % 16) + 16) % 16;
      let d = arcDelta(this.phase, target);
      if (d === 0) { if (opts.after) opts.after(); return; }
      if (!this.use16) { // A/B snap mode: jump by 2-phase (45 deg) steps, no easing
        this.phase = target;
        if (opts.after) opts.after();
        return;
      }
      const steps = [];
      const n = Math.abs(d), s = Math.sign(d);
      for (let i = 1; i <= n; i++) {
        let ms = TUNE2.turnMsMid;
        if (i === 1 && !opts.fast) ms = TUNE2.turnMsAnticipate;
        if (i === n) ms = opts.fast ? TUNE2.turnMsSettle * 0.7 : TUNE2.turnMsSettle;
        if (opts.fast && i > 1 && i < n) ms = TUNE2.turnMsMid * 0.8;
        steps.push({ phase: ((this.phase + s * i) % 16 + 16) % 16, ms });
      }
      if (!opts.fast && n >= TUNE2.overshootArc && (opts.overshoot !== false)) {
        steps.push({ phase: ((target + s) % 16 + 16) % 16, ms: TUNE2.turnMsMid });
        steps.push({ phase: target, ms: TUNE2.turnMsSettle });
      }
      this._turn = { steps, i: 0, t: 0, after: opts.after || null };
      this._setState('turn');
    }

    faceDir(dir8, opts) { this.turnTo(phaseOfDir8(dir8), opts); }

    // the hub stream choreography: come to front-center, face out, speak.
    summon() {
      const slot = this.band.frontSlot();
      this._speaking = true;
      this.walkTo(slot.bx, slot.by, () => {
        this.turnTo(0, { after: () => this._setState('speak') }); // 0 = south, face out
      });
    }
    // stream ended: hold a beat, then walk home and rest.
    dismiss() {
      this._speaking = false;
      const self = this;
      setTimeout(() => {
        if (self._speaking) return; // re-summoned during the hold
        self.walkTo(self._home.bx, self._home.by, () => {
          self.turnTo(self._home.phase, { after: () => self._setState('rest') });
        });
      }, TUNE2.speakHoldMs);
    }

    // mouse drifted near: perk + face it. Glyph only on the first wake so
    // tracking doesn't spam "!" — curiosity decays back to bored on its own.
    pokeMouse(bx, by) {
      if (this._speaking || this.mood === 'working' || this.state === 'walk') return;
      const fresh = this.mood !== 'curious';
      this.setMood('curious');
      this._stim = { bx, by };
      this._curiousT = TUNE2.curiousHoldS;
      if (fresh) { this._perk = 1; this._glyphT = 0.9; }
    }

    // a click / event the crew should notice (band coords)
    stimulus(bx, by) {
      this._stim = { bx, by };
      this.setMood('curious');
      this._curiousT = TUNE2.curiousHoldS;
      this._perk = 1;
      this._glyphT = 0.9;
      const p = this._phaseToward(bx, by);
      this.turnTo(p, { fast: true });
    }

    // step-aside: keep clear of avoid ranges (band x fractions)
    evade(ranges) {
      const inside = ranges.some((r) => this.bx > r[0] && this.bx < r[1]);
      const homeClear = !ranges.some((r) => this._home.bx > r[0] && this._home.bx < r[1]);
      if (inside && this.state !== 'aside' && !this._speaking) {
        let best = null;
        for (const r of ranges) {
          for (const cand of [r[0] - 0.05, r[1] + 0.05]) {
            const c = clamp(cand, 0.04, 0.96);
            const ok = !ranges.some((q) => c > q[0] && c < q[1]);
            if (ok && (best == null || Math.abs(c - this.bx) < Math.abs(best - this.bx))) best = c;
          }
        }
        if (best != null) {
          this._dimTarget = TUNE2.asideDim;
          this.walkTo(best, this.by, () => this._setState('aside'));
        }
      } else if (!inside && this.state === 'aside' && homeClear) {
        this._dimTarget = 1;
        this.walkTo(this._home.bx, this._home.by, () => {
          this.turnTo(this._home.phase, { after: () => this._setState('rest') });
        });
      } else if (!ranges.length && this._dimTarget < 1 && this.state !== 'aside') {
        this._dimTarget = 1;
      }
    }

    feedToken(tok) { if (this.bubble) this.bubble.append(tok); }

    // ---- internals ----------------------------------------------------------
    _setState(s) { if (this.state !== s) { this.state = s; this._anim.t = 0; this._anim.frame = 0; } }
    _rollBeat() { return TUNE2.boredBeatMinS + Math.random() * (TUNE2.boredBeatMaxS - TUNE2.boredBeatMinS); }
    _phaseToward(bx, by) {
      const a = this.band.toCanvas(this.bx, this.by);
      const b = this.band.toCanvas(bx, by);
      return phaseFromVector(b.x - a.x, (b.y - a.y) * 3); // depth exaggeration so clicks above/below read as N/S
    }

    _startBoredBeat() {
      const kinds = ['look', 'fidget', 'backturn', 'sigh'];
      const kind = kinds[(Math.random() * kinds.length) | 0];
      const self = this;
      if (kind === 'look') {
        const sweep = (2 + (Math.random() * 3 | 0)) * (Math.random() < 0.5 ? -1 : 1);
        const back = this.phase;
        this.turnTo(this.phase + sweep, {
          after: () => setTimeout(() => self.state !== 'walk' && self.turnTo(back), 700 + Math.random() * 600),
        });
        this._beat = { kind, t: 0, dur: 2.6 };
      } else if (kind === 'backturn') {
        const back = this.phase;
        this.turnTo(8, { after: () => setTimeout(() => self.state !== 'walk' && self.turnTo(back), 850) }); // 8 = north
        this._beat = { kind, t: 0, dur: 3.0 };
      } else if (kind === 'fidget') {
        this._beat = { kind, t: 0, dur: 0.9 };
      } else {
        this._beat = { kind: 'sigh', t: 0, dur: 0.8 };
      }
    }

    update(dt) {
      this._clock += dt;
      this._dim = lerp(this._dim, this._dimTarget, Math.min(1, dt * 6));
      if (this._perk > 0) this._perk = Math.max(0, this._perk - dt / TUNE2.perkDecayS);
      if (this._glyphT > 0) this._glyphT -= dt;

      // -- turning consumes the queue first
      if (this._turn) {
        const st = this._turn.steps[this._turn.i];
        this._turn.t += dt * 1000;
        if (this._turn.t >= st.ms) {
          this._turn.t -= st.ms;
          this.phase = st.phase;
          this._turn.i++;
          if (this._turn.i >= this._turn.steps.length) {
            const after = this._turn.after;
            this._turn = null;
            if (this.state === 'turn') this._setState(this._speaking ? 'speak' : 'rest');
            if (after) after();
          }
        }
      } else if (this._walk) {
        // -- walking along the band (x and depth together)
        const a = this.band.toCanvas(this.bx, this.by);
        const b = this.band.toCanvas(this._walk.tx, this._walk.ty);
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const speed = V1.TUNE.walkSpeed * this.band.scaleAt(this.by); // farther = slower (smaller)
        if (dist <= Math.max(2, speed * dt)) {
          this.bx = this._walk.tx; this.by = this._walk.ty;
          const after = this._walk.after; this._walk = null;
          this._setState('rest');
          if (after) after();
        } else {
          // heading follows velocity, routed through phases (no snaps)
          const want = phaseFromVector(dx, dy);
          const d = arcDelta(this.phase, want);
          if (d !== 0) {
            this._walkTurnT = (this._walkTurnT || 0) + dt * 1000;
            const per = this.use16 ? TUNE2.walkTurnMs : 0;
            if (!this.use16) this.phase = want;
            else if (this._walkTurnT >= per) { this._walkTurnT = 0; this.phase = ((this.phase + Math.sign(d)) % 16 + 16) % 16; }
          }
          const step = speed * dt / dist;
          this.bx = lerp(this.bx, this._walk.tx, step);
          this.by = lerp(this.by, this._walk.ty, step);
          this._setState('walk');
        }
      } else if (this.state === 'rest' || this.state === 'aside') {
        // -- personality layer
        if (this.mood === 'curious') {
          this._curiousT -= dt;
          if (this._stim) {
            const p = this._phaseToward(this._stim.bx, this._stim.by);
            if (arcDelta(this.phase, p) !== 0 && !this._turn) this.turnTo(p, { fast: true });
          }
          if (this._curiousT <= 0) { this.setMood('bored'); this._stim = null; }
        } else if (this.mood === 'bored' && this.state === 'rest') {
          if (this._beat) {
            this._beat.t += dt;
            if (this._beat.t >= this._beat.dur) { this._beat = null; this._beatIn = this._rollBeat(); }
          } else {
            this._beatIn -= dt;
            if (this._beatIn <= 0) this._startBoredBeat();
          }
        } else if (this.mood === 'working') {
          this._workPaceIn -= dt;
          if (this._workPaceIn <= 0) {
            this._workPaceIn = 5 + Math.random() * 5;
            const dxp = (Math.random() < 0.5 ? -1 : 1) * 0.045;
            const back = { bx: this.bx, by: this.by, phase: this.phase };
            this.walkTo(clamp(this.bx + dxp, 0.05, 0.95), this.by, () => {
              setTimeout(() => this.state !== 'walk' && this.walkTo(back.bx, back.by, () => this.turnTo(back.phase)), 600);
            });
          }
        }
      }

      // -- frame clock
      const fps = this.state === 'walk' ? V1.TUNE.walkFps
        : this.mood === 'working' ? V1.TUNE.idleFps * TUNE2.workIdleFpsK
        : this.mood === 'curious' ? V1.TUNE.idleFps
        : V1.TUNE.idleFps * TUNE2.boredIdleFpsK;
      this._anim.t += dt;
      if (this._anim.t >= 1 / fps) { this._anim.t -= 1 / fps; this._anim.frame++; }
    }

    _drawable() {
      const dir8 = dir8OfPhase(this.phase);
      const onCanon = this.phase % 2 === 0;
      // mid-turn (or odd phase): the lit ring frame IS the pose
      if (this.use16 && this.ring && this.ring.ready && (this._turn || !onCanon)) {
        return { img: this.ring.frame(this.phase), xform: { dx: 0, dy: 0 } };
      }
      if (this.state === 'walk') {
        const img = this.sheet.frame('walking', dir8, this._anim.frame);
        return { img, xform: this.sheet.xformFor('walking', dir8, this._anim.frame) };
      }
      if (this.state === 'speak' || this.state === 'curious' ||
          this.mood === 'working' || (this._beat && this._beat.kind === 'fidget')) {
        const kind = (this._beat && this._beat.kind === 'fidget') ? 'walking' : 'animating';
        const img = this.sheet.frame(kind, dir8, this._anim.frame);
        return { img, xform: this.sheet.xformFor(kind, dir8, this._anim.frame) };
      }
      if (this.mood === 'bored' && this.state === 'rest' && !this._beat) {
        // slow breathing on the animating loop
        const img = this.sheet.frame('animating', dir8, this._anim.frame);
        return { img, xform: this.sheet.xformFor('animating', dir8, this._anim.frame) };
      }
      if (this.use16 && this.ring && this.ring.ready) {
        return { img: this.ring.frame(this.phase), xform: { dx: 0, dy: 0 } };
      }
      return { img: this.sheet.frame('rotations', dir8, 0), xform: { dx: 0, dy: 0 } };
    }

    draw(ctx) {
      const pos = this.band.toCanvas(this.bx, this.by);
      const scale = this.band.scaleAt(this.by) * (this.band.spriteScale || 1);
      const { img, xform } = this._drawable();
      if (!img) return;
      const size = 236 * scale;

      // sway + bob + lean (secondary motion)
      const sway = (this.state === 'rest' && this.mood === 'bored')
        ? Math.sin(this._clock * TUNE2.swayHz * 2 * Math.PI) * TUNE2.swayPx * scale : 0;
      const bob = (this.state === 'walk')
        ? Math.abs(Math.sin(this._anim.frame * Math.PI / 3)) * -TUNE2.bobPx * 2 * scale
        : Math.sin(this._clock * 1.4) * TUNE2.bobPx * 0.6 * scale;
      let lean = 0;
      if (this.mood === 'curious' && this._stim) {
        lean = Math.sign(this._stim.bx - this.bx) * TUNE2.leanPx * scale * Math.min(1, this._curiousT);
      }
      const x = Math.round(pos.x + sway + lean);
      const yTotal = Math.round(pos.y + bob);

      ctx.save();
      ctx.globalAlpha = this._dim;
      ctx.imageSmoothingEnabled = false;

      // station underglow while working (mint, breathes)
      if (this.mood === 'working' && this.state !== 'walk') {
        const a = lerp(TUNE2.glowAlphaMin, TUNE2.glowAlphaMax,
          0.5 + 0.5 * Math.sin(this._clock * TUNE2.glowHz * 2 * Math.PI));
        const g = ctx.createRadialGradient(pos.x, pos.y - 6 * scale, 4, pos.x, pos.y - 6 * scale, 64 * scale);
        g.addColorStop(0, `rgba(125,255,213,${a})`);
        g.addColorStop(1, 'rgba(125,255,213,0)');
        ctx.fillStyle = g;
        ctx.fillRect(pos.x - 70 * scale, pos.y - 70 * scale, 140 * scale, 76 * scale);
      }

      // contact shadow — width tracks the heading's silhouette (3D grounding)
      const wSil = this.ring && this.ring.ready ? this.ring.widthOf(this.phase) : 90;
      const shW = wSil * scale * TUNE2.shadowK;
      const shH = Math.max(3, shW * 0.22);
      ctx.fillStyle = `rgba(4,8,16,${TUNE2.shadowAlpha * this._dim})`;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 1, shW, shH, 0, 0, Math.PI * 2);
      ctx.fill();

      // the figure (feet-anchored; squash for perk/sigh)
      let sy = 1;
      if (this._perk > 0) sy = lerp(1, TUNE2.perkScale, this._perk);
      if (this._beat && this._beat.kind === 'sigh') {
        const t = this._beat.t / this._beat.dur;
        sy = 1 - 0.025 * Math.sin(t * Math.PI);
      }
      const w = size, h = size * sy;
      const ox = (xform.dx || 0) * scale, oy = (xform.dy || 0) * scale;
      ctx.drawImage(img, x - w / 2 + ox, yTotal - h + oy, w, h);

      // curious "!" glyph (pixel-styled, mint)
      if (this._glyphT > 0) {
        const gx = x, gy = yTotal - size * 0.78 - 14 * scale;
        const p = Math.max(1, Math.round(2 * scale));
        ctx.fillStyle = '#7dffd5';
        const a = Math.min(1, this._glyphT / 0.25);
        ctx.globalAlpha = this._dim * a;
        ctx.fillRect(gx - p, gy - 8 * p, 2 * p, 5 * p);
        ctx.fillRect(gx - p, gy - 2 * p, 2 * p, 2 * p);
        ctx.globalAlpha = this._dim;
      }
      ctx.restore();
    }

    bubbleAnchor() {
      const pos = this.band.toCanvas(this.bx, this.by);
      const scale = this.band.scaleAt(this.by) * (this.band.spriteScale || 1);
      return { x: pos.x, y: pos.y - 236 * scale * 0.74 };
    }
  }

  // ---- the floor band ---------------------------------------------------------
  // Band coords: bx 0..1 across the room, by 0..1 depth (0 = back, 1 = front).
  class Band {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.backFrac = opts.backFrac != null ? opts.backFrac : 0.70;   // y at by=0
      this.frontFrac = opts.frontFrac != null ? opts.frontFrac : 0.95; // y at by=1
      this.scaleBack = opts.scaleBack != null ? opts.scaleBack : 0.62;
      this.scaleFront = opts.scaleFront != null ? opts.scaleFront : 1.04;
      this.spriteScale = opts.spriteScale || 1;
      this.actors = [];
      this.avoid = []; // [[bx0,bx1], ...]
    }
    add(actor) { this.actors.push(actor); return actor; }
    _w() { return this.canvas._cssW || this.canvas.width; }
    _h() { return this.canvas._cssH || this.canvas.height; }
    toCanvas(bx, by) {
      return { x: bx * this._w(),
               y: lerp(this.backFrac, this.frontFrac, by) * this._h() };
    }
    fromCanvas(x, y) {
      const by = (y / this._h() - this.backFrac) / (this.frontFrac - this.backFrac);
      return { bx: x / this._w(), by: clamp(by, 0, 1) };
    }
    scaleAt(by) { return lerp(this.scaleBack, this.scaleFront, by); }
    frontSlot() { return { bx: 0.46, by: 0.86 }; }
    setAvoid(ranges) { this.avoid = ranges || []; }
    update(dt) {
      // while someone holds the floor, the front-center slot is theirs alone —
      // idle crew keep a respectful gap (no crowding the speaker)
      const speaking = this.actors.some((a) => a._speaking);
      const slot = this.frontSlot();
      for (const a of this.actors) {
        const eff = (speaking && !a._speaking)
          ? this.avoid.concat([[slot.bx - 0.14, slot.bx + 0.14]])
          : this.avoid;
        a.evade(eff);
        a.update(dt);
      }
    }
    draw(ctx) {
      const sorted = this.actors.slice().sort((a, b) => a.by - b.by); // back first
      for (const a of sorted) a.draw(ctx);
    }
  }

  global.RhobearSpritesV2 = { DIRS16, TUNE2, TurnRing, ActorV2, Band, phaseOfDir8, phaseFromVector, arcDelta };
})(window);
