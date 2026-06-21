// FILE: sprite-engine.js
// RHOBEAR crew sprite animation engine — STANDALONE.
// Decoupled from the hub: this file knows nothing about React or the app shell.
// It loads convention-based sprite frames, runs a per-actor state machine, and
// renders to a <canvas>. The hub (Lane H) will later instantiate SpriteActor(s)
// and feed them positions + stream text; nothing here imports hub code.
//
// On-disk contract (derived by CONVENTION, not metadata.json — its paths are stale):
//   <base>/rotations/<dir>.png              single still per direction
//   <base>/walking/<dir>/frame_000..005.png 6-frame walk cycle
//   <base>/animating/<dir>/frame_000..003.png 4-frame idle/reactive loop
//   where <dir> in DIRS below, and <base> = ".../crew/<crew>/<world>".

(function (global) {
  'use strict';

  // 8 compass facings. Order matters: index = 45°*i clockwise from south.
  const DIRS = [
    'south', 'south-west', 'west', 'north-west',
    'north', 'north-east', 'east', 'south-east',
  ];

  // ---- tunables (the FEEL — we dial these in together in the preview) -------
  const TUNE = {
    walkFps: 10,        // walk-cycle playback speed
    idleFps: 6,         // animating/idle-loop playback speed
    walkSpeed: 90,      // px/sec the actor travels while walking
    backTurnHoldMs: 420,// beat held on the north (back-turn) facing
    mouseReactRadius: 220, // px; cursor inside this wakes the idle-react loop
    bubbleCharMs: 18,   // typewriter speed for streamed chat text
  };

  const FRAME_COUNTS = { walking: 6, animating: 4 };

  // Pick the facing whose vector best matches a movement/aim direction.
  // angle: radians, screen space (atan2(dy, dx)). south = +y (down).
  function dirFromVector(dx, dy) {
    // screen y is down; "south" is downward. Compute compass index.
    const ang = Math.atan2(dy, dx); // -PI..PI, 0 = +x (east)
    // Map so south(+y)=index0. south is angle +PI/2.
    // Convert to "clockwise from south" in 45° steps.
    let deg = (ang * 180) / Math.PI;      // -180..180, 0=east
    let fromSouth = deg - 90;             // 0 = south(down)
    fromSouth = ((fromSouth % 360) + 360) % 360;
    const idx = Math.round(fromSouth / 45) % 8;
    return DIRS[idx];
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // missing frame → null, engine tolerates gaps
      img.src = src;
    });
  }

  function median(xs) {
    const s = xs.slice().sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // ---- stable-slots registration (hatch-pet equivalent) --------------------
  // These extracted frames were fit-to-cell per frame, so the figure pops in
  // scale/baseline between frames and the head reads as "detached." We can't
  // re-extract from the original row strips, so we re-register the loaded
  // frames: find a stable anchor per frame and translate each so the anchor
  // sits at the sequence's reference point. 'head' pins the head (legs walk
  // under it); 'feet' pins the ground contact; 'off' = raw frames.
  const _scan = document.createElement('canvas');
  const _sctx = _scan.getContext('2d', { willReadFrequently: true });

  // Returns the anchor point {ax, ay} in the image's own pixel space.
  function frameAnchor(img, mode) {
    if (!img) return null;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return null;
    _scan.width = w; _scan.height = h;
    _sctx.clearRect(0, 0, w, h);
    _sctx.drawImage(img, 0, 0);
    let data;
    try { data = _sctx.getImageData(0, 0, w, h).data; }
    catch (e) { return null; } // tainted canvas (file://) → skip stabilization
    let top = h, bottom = -1, left = w, right = -1;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        if (data[(row + x) * 4 + 3] > 16) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }
    if (bottom < 0) return null;
    const cx = (left + right) / 2;
    const figH = bottom - top;
    if (mode === 'feet') return { ax: cx, ay: bottom };
    // head mode: horizontal centroid of the head band, pinned at head-top
    const band = Math.max(8, Math.round(figH * 0.22));
    let sx = 0, cnt = 0;
    for (let y = top; y < Math.min(h, top + band); y++) {
      const row = y * w;
      for (let x = left; x <= right; x++) {
        if (data[(row + x) * 4 + 3] > 16) { sx += x; cnt++; }
      }
    }
    return { ax: cnt ? sx / cnt : cx, ay: top };
  }

  // Loads + caches every frame for one crew/world. Tolerates missing sets
  // (some crew/world combos have gaps — see _HANDOFF.md sprite-gap list).
  class SpriteSheet {
    constructor(base) {
      this.base = base.replace(/\/+$/, '');
      this.rotations = {};       // dir -> Image|null
      this.walking = {};         // dir -> [Image|null x6]
      this.animating = {};       // dir -> [Image|null x4]
      this.xform = {};           // "kind:dir" -> [{dx,dy}] aligned to live frames
      this.mode = 'head';        // stabilization anchor: 'head' | 'feet' | 'off'
      this.ready = false;
    }

    async load() {
      const jobs = [];
      for (const dir of DIRS) {
        jobs.push(
          loadImage(`${this.base}/rotations/${dir}.png`).then((i) => (this.rotations[dir] = i))
        );
        this.walking[dir] = new Array(FRAME_COUNTS.walking).fill(null);
        for (let f = 0; f < FRAME_COUNTS.walking; f++) {
          const n = String(f).padStart(3, '0');
          jobs.push(
            loadImage(`${this.base}/walking/${dir}/frame_${n}.png`).then(
              (im) => (this.walking[dir][f] = im)
            )
          );
        }
        this.animating[dir] = new Array(FRAME_COUNTS.animating).fill(null);
        for (let f = 0; f < FRAME_COUNTS.animating; f++) {
          const n = String(f).padStart(3, '0');
          jobs.push(
            loadImage(`${this.base}/animating/${dir}/frame_${n}.png`).then(
              (im) => (this.animating[dir][f] = im)
            )
          );
        }
      }
      await Promise.all(jobs);
      this.computeTransforms(this.mode);
      this.ready = true;
      return this;
    }

    // Re-register each animation sequence to a stable anchor. Stored offsets
    // are aligned to the SAME filtered (Boolean) frame list that frame() draws,
    // so indices match. 'off' clears all offsets (raw frames).
    computeTransforms(mode) {
      this.mode = mode;
      this.xform = {};
      if (mode === 'off') return;
      for (const kind of ['walking', 'animating']) {
        for (const dir of DIRS) {
          const live = (this[kind][dir] || []).filter(Boolean);
          if (!live.length) continue;
          const anchors = live.map((im) => frameAnchor(im, mode));
          if (anchors.some((a) => !a)) continue; // tainted/empty → leave raw
          const refAx = median(anchors.map((a) => a.ax));
          const refAy = median(anchors.map((a) => a.ay));
          this.xform[`${kind}:${dir}`] = anchors.map((a) => ({
            dx: refAx - a.ax,
            dy: refAy - a.ay,
          }));
        }
      }
    }

    // Per-frame stabilization offset (image px) for the live frame at idx.
    xformFor(kind, dir, idx) {
      const arr = this.xform[`${kind}:${dir}`];
      if (!arr || !arr.length) return { dx: 0, dy: 0 };
      return arr[idx % arr.length];
    }

    has(kind, dir) {
      if (kind === 'rotations') return !!this.rotations[dir];
      const arr = this[kind] && this[kind][dir];
      return !!(arr && arr.some(Boolean));
    }

    // Returns a drawable Image for (kind, dir, frameIndex), falling back
    // gracefully: missing walk → rotation still; missing rotation → south still.
    frame(kind, dir, idx) {
      if (kind === 'rotations') {
        return this.rotations[dir] || this.rotations['south'] || null;
      }
      const arr = this[kind][dir];
      if (arr) {
        const live = arr.filter(Boolean);
        if (live.length) return live[idx % live.length];
      }
      return this.rotations[dir] || this.rotations['south'] || null;
    }
  }

  // One animated crew member. Owns position, facing, and a small state machine.
  // States: 'idle' (still on rotation), 'react' (animating loop, mouse-woken),
  //         'walk' (walking loop + travel), 'turn' (brief back-turn beat).
  class SpriteActor {
    constructor(sheet, opts = {}) {
      this.sheet = sheet;
      this.x = opts.x || 0;
      this.y = opts.y || 0;
      this.scale = opts.scale || 1;
      this.dir = opts.dir || 'south';
      this.state = 'idle';
      this._t = 0;          // frame-clock accumulator (sec)
      this._frame = 0;
      this._turnUntil = 0;  // wall-clock-ish accumulator for back-turn beat
      this._clock = 0;      // total elapsed sec (monotonic, fed by update)
      this.target = null;   // {x} to walk toward, or null
      this.reactPoint = null; // {x,y} cursor, screen space, or null
      this.size = 236;      // sprite native px (square)
    }

    walkTo(x) { this.target = { x }; }
    stop() { this.target = null; if (this.state === 'walk') this._enter('idle'); }
    face(dir) { this.dir = dir; if (this.state !== 'walk') this._enter('idle'); }

    // Trigger the deliberate back-turn beat (face north, hold, then resume).
    backTurnBeat() {
      this.dir = 'north';
      this._enter('turn');
      this._turnUntil = this._clock + TUNE.backTurnHoldMs / 1000;
    }

    setReactPoint(p) { this.reactPoint = p; }

    _enter(state) {
      if (this.state === state) return;
      this.state = state;
      this._t = 0;
      this._frame = 0;
    }

    _fpsFor(state) {
      if (state === 'walk') return TUNE.walkFps;
      return TUNE.idleFps;
    }

    update(dt) {
      this._clock += dt;

      // --- movement / state selection -------------------------------------
      if (this.target) {
        const dx = this.target.x - this.x;
        if (Math.abs(dx) <= 2) {
          this.x = this.target.x;
          this.target = null;
          this._enter('idle');
        } else {
          const dirSign = Math.sign(dx);
          this.dir = dirSign < 0 ? 'west' : 'east';
          this.x += dirSign * TUNE.walkSpeed * dt;
          this._enter('walk');
        }
      } else if (this.state === 'turn') {
        if (this._clock >= this._turnUntil) this._enter('idle');
      } else {
        // idle vs mouse-react
        const woke =
          this.reactPoint &&
          Math.hypot(this.reactPoint.x - this.x, this.reactPoint.y - this.y) <
            TUNE.mouseReactRadius;
        if (woke) {
          // face the cursor + play the reactive loop
          this.dir = dirFromVector(this.reactPoint.x - this.x, this.reactPoint.y - this.y);
          this._enter('react');
        } else {
          this._enter('idle');
        }
      }

      // --- frame clock -----------------------------------------------------
      const fps = this._fpsFor(this.state);
      this._t += dt;
      if (this._t >= 1 / fps) {
        this._t -= 1 / fps;
        this._frame++;
      }
    }

    // Resolve the (kind, dir, frameIndex) the current state should draw.
    _cur() {
      switch (this.state) {
        case 'walk':  return { kind: 'walking', dir: this.dir, idx: this._frame };
        case 'react': return { kind: 'animating', dir: this.dir, idx: this._frame };
        case 'turn':
        case 'idle':
        default:      return { kind: 'rotations', dir: this.dir, idx: 0 };
      }
    }

    currentImage() {
      const c = this._cur();
      return this.sheet.frame(c.kind, c.dir, c.idx);
    }

    draw(ctx) {
      const c = this._cur();
      const img = this.sheet.frame(c.kind, c.dir, c.idx);
      if (!img) return;
      const w = this.size * this.scale;
      const h = this.size * this.scale;
      // stable-slots offset (image px → scaled), so the head stays glued
      const off = this.sheet.xformFor(c.kind, c.dir, c.idx);
      const ox = off.dx * this.scale;
      const oy = off.dy * this.scale;
      ctx.imageSmoothingEnabled = false; // keep pixel art crisp
      ctx.drawImage(img, this.x - w / 2 + ox, this.y - h + oy, w, h); // anchor = feet
    }

    // Top-center anchor for an overhead chat bubble, in canvas coords.
    bubbleAnchor() {
      return { x: this.x, y: this.y - this.size * this.scale };
    }
  }

  // A simple typewriter-streamed overhead bubble bound to a DOM element.
  // The hub will feed it real stream tokens; here the preview feeds canned text.
  class ChatBubble {
    constructor(el) {
      this.el = el;
      this._full = '';
      this._shown = 0;
      this._acc = 0;
      this.visible = false;
    }
    say(text) {
      this._full = text;
      this._shown = 0;
      this._acc = 0;
      this.visible = true;
      this.el.style.display = 'block';
    }
    append(token) {
      this._full += token;
      this.visible = true;
      this.el.style.display = 'block';
    }
    hide() {
      this.visible = false;
      this.el.style.display = 'none';
    }
    update(dt) {
      if (!this.visible) return;
      this._acc += dt * 1000;
      while (this._acc >= TUNE.bubbleCharMs && this._shown < this._full.length) {
        this._acc -= TUNE.bubbleCharMs;
        this._shown++;
      }
      this.el.textContent = this._full.slice(0, this._shown);
    }
    positionAt(anchor, canvasRect) {
      // anchor in canvas coords → page coords
      this.el.style.left = canvasRect.left + anchor.x + 'px';
      this.el.style.top = canvasRect.top + anchor.y + 'px';
    }
  }

  global.RhobearSprites = {
    DIRS,
    TUNE,
    dirFromVector,
    SpriteSheet,
    SpriteActor,
    ChatBubble,
  };
})(window);
