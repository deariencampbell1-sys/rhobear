#!/usr/bin/env python
"""RHOBEAR 16-phase lit turn baker — Lane H POC (Fable).

Makes the 8-direction turn read as GENUINE 3D by baking a 16-heading turn ring:
  1. REGISTER the 8 canon rotation stills to a common feet-axis (the vertical
     rotation axis passes through the planted feet, not the bbox center).
  2. SYNTHESIZE the 8 missing 22.5-degree intermediate headings with a
     silhouette-adaptive cylindrical warp morph: each figure row is treated as
     a slice of a cylinder whose radius is that row's silhouette half-width,
     so features near the body axis slide faster than features at the rim —
     true rotation parallax — and the silhouette breathes like a real turn.
     The two neighbours are each warped half-way and composited per-pixel with
     ordered Bayer choose (no alpha blending => zero pixel mush, palette is
     preserved exactly).
  3. LIGHT all 16 headings with a world-fixed key (Dead Cells lesson: lighting
     sells volume). The mint rim stays on the world-lit side while the figure's
     geometry rotates beneath it — the strongest monocular rotation cue after
     silhouette change. Canon frames in hub/assets/crew are NEVER touched;
     everything lands in poc/turn16/<crew>/<world>/.

Self-test (the honesty check): re-synthesize each canon DIAGONAL from its two
90-degree-apart neighbours and score silhouette IoU vs the true canon art.
That measures how believable the same machinery is at the (easier) 45-degree
task it actually runs in production.

Usage:
  python bake_turn16.py [--crew architect] [--world ship] [--selftest]
         [--base <crew_root>] [--rim 0.28] [--no-light]
Outputs:
  poc/turn16/<crew>/<world>/turns/<dir16>.png   16 lit headings
  poc/turn16/<crew>/<world>/turns_raw/<mid>.png  synth pre-light (debug)
  poc/turn16/<crew>/<world>/meta.json            anchors/widths/provenance
  poc/proof/<crew>_<world>_turn_strip.png           16-cell strip
  poc/proof/<crew>_<world>_turn360.gif              the rotation, 70ms/phase
  poc/proof/<crew>_<world>_selftest.png|.md         synth-vs-canon proof
"""
import argparse, json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CREW_ROOT_DEFAULT = os.path.dirname(os.path.dirname(HERE))  # .../hub/assets/crew

CELL = 236
FEET_X, FEET_Y = 118, 210          # registration target: feet axis
ALPHA_ON = 16                       # alpha presence threshold (canon QA value)

# 8 canon headings, index = 45 deg * i clockwise-from-south on screen.
DIRS8 = ['south', 'south-west', 'west', 'north-west',
         'north', 'north-east', 'east', 'south-east']
# canonical 16-wind names for the midpoints between DIRS8[i] and DIRS8[i+1]
MIDS = ['south-south-west', 'west-south-west', 'west-north-west',
        'north-north-west', 'north-north-east', 'east-north-east',
        'east-south-east', 'south-south-east']
# full 16 ring in turn order (22.5 deg steps clockwise-from-south)
DIRS16 = []
for i, d in enumerate(DIRS8):
    DIRS16.append(d)
    DIRS16.append(MIDS[i])

MINT = np.array([0x7d, 0xff, 0xd5], dtype=np.float32)       # brand accent
SHADE = np.array([0x0a, 0x10, 0x20], dtype=np.float32)      # deep navy
LIGHT_DIR = np.array([0.62, 0.74])                          # travel: down-right (key at up-left)
LIGHT_DIR = LIGHT_DIR / np.linalg.norm(LIGHT_DIR)

BAYER4 = (np.array([[0, 8, 2, 10], [12, 4, 14, 6],
                    [3, 11, 1, 9], [15, 7, 13, 5]], dtype=np.float32) + 0.5) / 16.0


# ---------- tiny numpy image ops (no scipy dependency) ----------------------
def gauss1d(sigma):
    r = max(1, int(3 * sigma))
    x = np.arange(-r, r + 1, dtype=np.float32)
    k = np.exp(-(x * x) / (2 * sigma * sigma))
    return k / k.sum()


def blur2d(a, sigma):
    k = gauss1d(sigma)
    pad = len(k) // 2
    tmp = np.apply_along_axis(lambda m: np.convolve(np.pad(m, pad, mode='edge'), k, 'valid'), 0, a)
    return np.apply_along_axis(lambda m: np.convolve(np.pad(m, pad, mode='edge'), k, 'valid'), 1, tmp)


def shift_bool(m, dy, dx):
    out = np.zeros_like(m)
    h, w = m.shape
    ys = slice(max(0, dy), min(h, h + dy)); xs = slice(max(0, dx), min(w, w + dx))
    yd = slice(max(0, -dy), min(h, h - dy)); xd = slice(max(0, -dx), min(w, w - dx))
    out[ys, xs] = m[yd, xd]
    return out


def erode(m, it=1):
    out = m.copy()
    for _ in range(it):
        acc = out.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            acc &= shift_bool(out, dy, dx)
        out = acc
    return out


def neighbor_count(m):
    c = np.zeros(m.shape, dtype=np.int16)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy == 0 and dx == 0:
                continue
            c += shift_bool(m, dy, dx).astype(np.int16)
    return c


# ---------- load + register --------------------------------------------------
def load_rgba(path):
    return np.array(Image.open(path).convert('RGBA'), dtype=np.uint8)


def feet_anchor(img):
    """(cx, baseline) of the planted feet = the figure's rotation axis."""
    a = img[..., 3] > ALPHA_ON
    ys, xs = np.nonzero(a)
    if not len(ys):
        return None
    baseline = ys.max()
    band = a[max(0, baseline - 5):baseline + 1]
    bys, bxs = np.nonzero(band)
    cx = bxs.mean() if len(bxs) else xs.mean()
    return float(cx), int(baseline)


def register(img):
    """Integer-shift so the feet axis sits at (FEET_X, FEET_Y). Pixel-pure."""
    fa = feet_anchor(img)
    if fa is None:
        return img.copy(), (0, 0)
    dx = int(round(FEET_X - fa[0])); dy = int(FEET_Y - fa[1])
    out = np.zeros_like(img)
    h, w = img.shape[:2]
    ys = slice(max(0, dy), min(h, h + dy)); xs = slice(max(0, dx), min(w, w + dx))
    yd = slice(max(0, -dy), min(h, h - dy)); xd = slice(max(0, -dx), min(w, w - dx))
    out[ys, xs] = img[yd, xd]
    return out, (dx, dy)


def head_anchor(img):
    """Canon head metric: centroid-x of top 22% band, pinned at head-top."""
    a = img[..., 3] > ALPHA_ON
    ys, xs = np.nonzero(a)
    if not len(ys):
        return None
    t, b = ys.min(), ys.max()
    band = max(8, round((b - t) * 0.22))
    sub = a[t:t + band]
    sy, sx = np.nonzero(sub)
    hcx = sx.mean() if len(sx) else xs.mean()
    return float(hcx), int(t)


# ---------- the cylindrical morph --------------------------------------------
def smooth1d(v, sigma=3.0):
    k = gauss1d(sigma); pad = len(k) // 2
    return np.convolve(np.pad(v, pad, mode='edge'), k, 'valid')


def row_geom(mask):
    """Per-row silhouette (center, half-width, occupied) — each source row is
    its own cylinder slice. Per-row normalization is what kills the two-heads
    ghost: posture variance between neighbouring canon views (the head sits on
    different columns) is corrected per row BEFORE the parallax mix."""
    h = mask.shape[0]
    C = np.zeros(h, dtype=np.float32)
    W = np.zeros(h, dtype=np.float32)
    occ = np.zeros(h, dtype=bool)
    for y in range(h):
        xs = np.nonzero(mask[y])[0]
        if len(xs):
            C[y] = (xs[0] + xs[-1]) / 2.0
            W[y] = max((xs[-1] - xs[0]) / 2.0, 1.0)
            occ[y] = True
    if occ.any():
        idx = np.nonzero(occ)[0]
        C[:idx[0]] = C[idx[0]]; C[idx[-1]:] = C[idx[-1]]
        W[:idx[0]] = W[idx[0]]; W[idx[-1]:] = W[idx[-1]]
        # interior gaps: nearest-neighbour fill via linear interp over occupied rows
        allrows = np.arange(h)
        C = np.interp(allrows, idx, C[idx]).astype(np.float32)
        W = np.interp(allrows, idx, W[idx]).astype(np.float32)
    return smooth1d(C, 3.0), np.maximum(smooth1d(W, 3.0), 2.0), occ


def sample_rotated(img, C, W, Ct, Rt, delta):
    """Project the source (its own per-row cylinder C/W) onto the target beam
    (Ct/Rt), rotated by `delta` radians. Inverse mapping, nearest-neighbour —
    every output pixel is an exact palette pixel from the source. Returns the
    warped image plus a visibility mask (samples that fell behind the
    cylinder's horizon are occluded on that source)."""
    h, w = img.shape[:2]
    out = np.zeros_like(img)
    vis = np.zeros((h, w), dtype=bool)
    for y in range(h):
        r = Rt[y]
        x0 = max(0, int(math.floor(Ct[y] - r))); x1 = min(w - 1, int(math.ceil(Ct[y] + r)))
        if x1 <= x0:
            continue
        xs = np.arange(x0, x1 + 1, dtype=np.float32)
        u = np.clip((xs - Ct[y]) / r, -0.9995, 0.9995)
        phi = np.arcsin(u) + delta
        ok = np.abs(phi) <= (math.pi / 2)
        src = C[y] + W[y] * np.sin(phi)
        sxi = np.clip(np.round(src), 0, w - 1).astype(np.int32)
        row = img[y, sxi]
        row[~ok] = 0
        out[y, x0:x1 + 1] = row
        vis[y, x0:x1 + 1] = ok
    return out, vis


def bayer_mix(a, b, mode='luma'):
    """Colour-aware CHOOSE between two warped sources — never blends alpha.
    Where the sources agree in colour (most of the body), snap their average
    to the NEARER source colour (coherent shading, zero new palette entries).
    Where they disagree it is almost always the per-view glow linework — glow
    is additive light, so 'luma' mode takes the BRIGHTER pixel: lines from
    both views survive as contiguous strokes (a believable holo-shimmer on a
    transit frame), instead of checkering. 'bayer' mode (per 2x2 block) is
    the fallback for sets without emissive costumes."""
    am = a[..., 3] > 128; bm = b[..., 3] > 128
    h, w = am.shape
    out = np.zeros_like(a)
    both = am & bm
    af = a[..., :3].astype(np.int16); bf = b[..., :3].astype(np.int16)
    close = both & (np.abs(af - bf).sum(axis=2) < 96)
    far = both & ~close
    # close: average, snapped to the nearer source colour
    avg = ((af + bf) // 2)
    da = np.abs(af - avg).sum(axis=2); db = np.abs(bf - avg).sum(axis=2)
    use_a = da <= db
    out[close & use_a] = a[close & use_a]
    out[close & ~use_a] = b[close & ~use_a]
    if mode == 'luma':
        la = af @ np.array([3, 6, 1]); lb = bf @ np.array([3, 6, 1])
        brighter_a = la >= lb
        out[far & brighter_a] = a[far & brighter_a]
        out[far & ~brighter_a] = b[far & ~brighter_a]
    else:
        yy, xx = np.mgrid[0:h, 0:w]
        thr = BAYER4[(yy // 2) % 4, (xx // 2) % 4]
        pick_a = thr < 0.5
        out[far & pick_a] = a[far & pick_a]
        out[far & ~pick_a] = b[far & ~pick_a]
    only_a = am & ~bm; only_b = bm & ~am
    out[only_a] = a[only_a]; out[only_b] = b[only_b]
    return out


def cleanup(img):
    """Drop orphan pixels; fill pinholes with the median neighbour colour."""
    a = img[..., 3] > 128
    n = neighbor_count(a)
    img[a & (n < 2)] = 0
    a = img[..., 3] > 128
    n = neighbor_count(a)
    holes = (~a) & (n >= 6)
    ys, xs = np.nonzero(holes)
    for y, x in zip(ys, xs):
        y0, y1 = max(0, y - 1), min(img.shape[0], y + 2)
        x0, x1 = max(0, x - 1), min(img.shape[1], x + 2)
        patch = img[y0:y1, x0:x1]
        m = patch[..., 3] > 128
        if m.any():
            img[y, x, :3] = np.median(patch[m][:, :3], axis=0)
            img[y, x, 3] = 255
    # final hard alpha (pixel-art purity)
    img[..., 3] = np.where(img[..., 3] > 128, 255, 0).astype(np.uint8)
    return img


def synth_mid(reg_a, reg_b, delta_deg=22.5, mix='luma'):
    """Midpoint heading between two registered neighbours `delta_deg` apart."""
    ma, mb = reg_a[..., 3] > ALPHA_ON, reg_b[..., 3] > ALPHA_ON
    Ca, Wa, occa = row_geom(ma)
    Cb, Wb, occb = row_geom(mb)
    both = occa & occb
    # target beam: average geometry where both contribute, single source else
    Ct = np.where(both, (Ca + Cb) / 2.0, np.where(occa, Ca, Cb)).astype(np.float32)
    Rt = np.where(both, (Wa + Wb) / 2.0, np.where(occa, Wa, Wb)).astype(np.float32)
    Ct = smooth1d(Ct, 2.0); Rt = np.maximum(smooth1d(Rt, 2.0), 2.0)
    half = math.radians(delta_deg / 2.0)
    # advancing clockwise S->SSW->SW...: A rotates forward (+), B back (-).
    wa, _ = sample_rotated(reg_a, Ca, Wa, Ct, Rt, +half)
    wb, _ = sample_rotated(reg_b, Cb, Wb, Ct, Rt, -half)
    # rows only one source occupies: silence the other entirely (no ghost limbs)
    only_a = occa & ~occb; only_b = occb & ~occa
    wb[only_a] = 0; wa[only_b] = 0
    return cleanup(bayer_mix(wa, wb, mix))


# ---------- the world-fixed rim light ----------------------------------------
def rim_light(img, strength=0.28):
    """Mint key-light rim on the world-lit edge + cool core-shadow edge.
    Light is FIXED in world space for all headings — the lit side stays put
    while the figure's geometry rotates beneath it (the Dead Cells cue)."""
    out = img.astype(np.float32).copy()
    a = img[..., 3] > ALPHA_ON
    if not a.any():
        return img
    band = a & ~erode(a, 2)                      # 2px silhouette band
    g = blur2d(a.astype(np.float32), 1.2)
    gy, gx = np.gradient(g)
    mag = np.sqrt(gx * gx + gy * gy) + 1e-6
    nx, ny = -gx / mag, -gy / mag                # outward normal
    facing = nx * (-LIGHT_DIR[0]) + ny * (-LIGHT_DIR[1])   # toward the key
    lit = band & (facing > 0.35)
    hot = band & (facing > 0.88)
    shd = band & (facing < -0.45)
    t = np.zeros(a.shape, dtype=np.float32)
    t[lit] = strength * np.clip((facing[lit] - 0.35) / 0.65, 0, 1)
    t[hot] = strength * 1.55
    for c in range(3):
        ch = out[..., c]
        ch[lit] += (MINT[c] - ch[lit]) * t[lit]
        ch[shd] += (SHADE[c] - ch[shd]) * (strength * 0.6)
    return np.clip(out, 0, 255).astype(np.uint8)


# ---------- proof artifacts ---------------------------------------------------
def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(img).save(path)


def strip_and_gif(frames, qa_dir, tag, ms=70):
    cell = CELL
    strip = Image.new('RGBA', (cell * len(frames), cell), (12, 18, 28, 255))
    for i, f in enumerate(frames):
        strip.alpha_composite(Image.fromarray(f), (i * cell, 0))
    sp = os.path.join(qa_dir, f'{tag}_turn_strip.png')
    strip.convert('RGB').save(sp)
    bg = (10, 14, 24)
    gif_frames = []
    for f in frames:
        im = Image.new('RGB', (cell, cell), bg)
        im.paste(Image.fromarray(f), (0, 0), Image.fromarray(f))
        gif_frames.append(im.quantize(colors=128, dither=Image.Dither.NONE))
    gp = os.path.join(qa_dir, f'{tag}_turn360.gif')
    gif_frames[0].save(gp, save_all=True, append_images=gif_frames[1:],
                       duration=ms, loop=0, disposal=2)
    return sp, gp


def iou(a, b):
    ma, mb = a[..., 3] > 128, b[..., 3] > 128
    inter = (ma & mb).sum(); union = (ma | mb).sum()
    return inter / union if union else 0.0


def selftest(reg, qa_dir, tag):
    """Synthesize each canon diagonal from its 90-degree-apart neighbours and
    score vs the true art. 45-degree production synthesis is strictly easier."""
    rows, report = [], []
    for i in range(0, 8, 2):           # diagonals sit at odd indices
        a, mid, b = DIRS8[i], DIRS8[(i + 1) % 8], DIRS8[(i + 2) % 8]
        synth = synth_mid(reg[a], reg[b], delta_deg=45.0)
        score = iou(synth, reg[mid])
        report.append((f'{a}+{b} -> {mid}', score))
        canon = reg[mid].copy()
        diff = np.zeros_like(canon)
        dm = (synth[..., 3] > 128) ^ (canon[..., 3] > 128)
        diff[dm] = [255, 80, 80, 255]
        rows.append(np.concatenate([synth, canon, diff], axis=1))
    sheet = np.concatenate(rows, axis=0)
    save(sheet, os.path.join(qa_dir, f'{tag}_selftest.png'))
    md = ['# turn16 self-test — synth(90-apart neighbours) vs canon diagonal',
          f'set: {tag}', '',
          '| pair -> target | silhouette IoU |', '|---|---|']
    for name, s in report:
        md.append(f'| {name} | {s:.3f} |')
    md += ['', 'columns per row: synth | canon | silhouette diff (red)',
           'production synthesis spans 45 deg (half this gap) => easier than scored here.']
    with open(os.path.join(qa_dir, f'{tag}_selftest.md'), 'w') as f:
        f.write('\n'.join(md))
    return report


# ---------- main ---------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--crew', default='architect')
    ap.add_argument('--world', default='ship')
    ap.add_argument('--base', default=CREW_ROOT_DEFAULT)
    ap.add_argument('--rim', type=float, default=0.28)
    ap.add_argument('--mix', choices=['luma', 'bayer'], default='luma',
                    help='disagreement strategy: luma=brighter-pixel union '
                         '(emissive costumes), bayer=2x2 block choice')
    ap.add_argument('--no-light', action='store_true')
    ap.add_argument('--selftest', action='store_true')
    args = ap.parse_args()

    src = os.path.join(args.base, args.crew, args.world, 'rotations')
    out_root = os.path.join(HERE, 'turn16', args.crew, args.world)
    qa_dir = os.path.join(HERE, 'proof')
    os.makedirs(qa_dir, exist_ok=True)
    tag = f'{args.crew}_{args.world}'

    reg, shifts = {}, {}
    for d in DIRS8:
        p = os.path.join(src, f'{d}.png')
        if not os.path.exists(p):
            sys.exit(f'missing canon rotation: {p}')
        reg[d], shifts[d] = register(load_rgba(p))

    if args.selftest:
        rep = selftest(reg, qa_dir, tag)
        print('selftest IoU:', ', '.join(f'{n}={s:.3f}' for n, s in rep))

    meta = {'crew': args.crew, 'world': args.world, 'cell': CELL,
            'feet_axis': [FEET_X, FEET_Y], 'order': DIRS16,
            'light_dir': LIGHT_DIR.tolist(), 'rim_strength': args.rim,
            'register_shifts': shifts, 'headings': {}}

    ring = {}
    for i, d in enumerate(DIRS8):
        nxt = DIRS8[(i + 1) % 8]
        ring[d] = reg[d]
        mid = synth_mid(reg[d], reg[nxt], delta_deg=22.5, mix=args.mix)
        save(mid, os.path.join(out_root, 'turns_raw', f'{MIDS[i]}.png'))
        ring[MIDS[i]] = mid

    frames = []
    for d in DIRS16:
        img = ring[d] if args.no_light else rim_light(ring[d], args.rim)
        save(img, os.path.join(out_root, 'turns', f'{d}.png'))
        frames.append(img)
        ha = head_anchor(img); fa = feet_anchor(img)
        a = img[..., 3] > ALPHA_ON
        ys, xs = np.nonzero(a)
        meta['headings'][d] = {
            'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
            'width': int(xs.max() - xs.min() + 1), 'height': int(ys.max() - ys.min() + 1),
            'head': [round(ha[0], 1), ha[1]] if ha else None,
            'feet': [round(fa[0], 1), fa[1]] if fa else None,
            'synth': d not in DIRS8,
        }

    # mix-mode gate (taste -> number): synth transit frames may read slightly
    # brighter than canon (the holo-flare), but a washed/glowing midpoint on a
    # non-emissive costume means luma-union picked wrong. Gate: ratio <= 1.18.
    def mean_luma(img):
        m = img[..., 3] > ALPHA_ON
        if not m.any():
            return 0.0
        rgb = img[..., :3][m].astype(np.float32)
        return float((rgb @ np.array([0.3, 0.6, 0.1], dtype=np.float32)).mean())

    canon_l = float(np.mean([mean_luma(f) for f, d in zip(frames, DIRS16) if d in DIRS8]))
    synth_l = float(np.mean([mean_luma(f) for f, d in zip(frames, DIRS16) if d not in DIRS8]))
    ratio = synth_l / canon_l if canon_l else 1.0
    mix_ok = ratio <= 1.18
    verdict = 'OK' if mix_ok else f'TOO BRIGHT -> rebake with --mix bayer (current: --mix {args.mix})'
    meta['mix_check'] = {'canon_luma': round(canon_l, 1), 'synth_luma': round(synth_l, 1),
                         'ratio': round(ratio, 3), 'gate': 1.18, 'mix': args.mix,
                         'verdict': verdict}

    with open(os.path.join(out_root, 'meta.json'), 'w') as f:
        json.dump(meta, f, indent=1)
    sp, gp = strip_and_gif(frames, qa_dir, tag)
    print('baked', len(frames), 'headings ->', out_root)
    print(f'mix check: canon luma {canon_l:.1f}  synth {synth_l:.1f}  '
          f'ratio {ratio:.2f} (gate <=1.18) -> {verdict}')
    print('strip :', sp)
    print('gif   :', gp)


if __name__ == '__main__':
    main()
