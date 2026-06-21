#!/usr/bin/env python
"""QA for a baked 16-heading turn ring — registration + contact sheet.

Registration: the canon measure_registration logic (head-top / head-cx /
baseline / height spread) applied AROUND THE RING. A real rotation changes
silhouette width but must keep the figure on its axis: feet pinned, head-top
steady, height steady. Head-cx wanders with pose by design (the head orbits
the axis slightly as shoulders swing) — we report it, gate on the others.

Contact sheet: 16 cells with bbox (green) + head-anchor crosshair (red) +
feet-axis tick (mint), hatch-pet style, written to poc/proof/.

The script ADJUDICATES: it prints one verdict token after `=>` and an action
line. Obey the token — never reinterpret a failure yourself:
  PASS                all gates green (closes the set)
  PASS-WITH-VARIANCE  canon pose-height variance, machine-verified benign —
                      closes the set only after the step-7 eyeball
  FAIL-SOURCE         broken source art (action line names the still + fix)
  FAIL-SYNTH          synth geometry broken (flip --mix once, else ring-off)
  CHECK               off-map -> STOP and report the owner
Exit codes: 0 = PASS*, 2 = FAIL-*, 3 = CHECK (for batch drivers).

Usage: python qa_turn16.py [--crew architect] [--world ship]
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ALPHA_ON = 16
GATE = 4  # px — canon drift threshold


def metrics(img):
    a = np.array(img.convert('RGBA'), dtype=np.uint8)[..., 3] > ALPHA_ON
    ys, xs = np.nonzero(a)
    if not len(ys):
        return None
    t, b = int(ys.min()), int(ys.max())
    l, r = int(xs.min()), int(xs.max())
    band = max(8, round((b - t) * 0.22))
    sub = a[t:t + band]
    sy, sx = np.nonzero(sub)
    hcx = float(sx.mean()) if len(sx) else (l + r) / 2.0
    feet_band = a[max(0, b - 5):b + 1]
    fy, fx = np.nonzero(feet_band)
    fcx = float(fx.mean()) if len(fx) else (l + r) / 2.0
    return dict(headTop=t, headCx=hcx, baseline=b, height=b - t,
                bbox=(l, t, r, b), feetCx=fcx)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--crew', default='architect')
    ap.add_argument('--world', default='ship')
    args = ap.parse_args()
    root = os.path.join(HERE, 'turn16', args.crew, args.world)
    meta = json.load(open(os.path.join(root, 'meta.json')))
    order = meta['order']
    rows = []
    for d in order:
        p = os.path.join(root, 'turns', f'{d}.png')
        m = metrics(Image.open(p)) if os.path.exists(p) else None
        rows.append((d, m))

    # ring spreads
    def spread(key):
        vals = [m[key] for _, m in rows if m]
        return round(max(vals) - min(vals), 1)

    report = {k: spread(k) for k in ('headTop', 'baseline', 'height', 'feetCx', 'headCx')}
    print(f'turn16 ring registration — {args.crew}/{args.world}')
    for d, m in rows:
        tagc = ' (synth)' if meta['headings'][d]['synth'] else '        '
        print(f"  {d:22}{tagc} headTop {m['headTop']:3d}  headCx {m['headCx']:6.1f}  "
              f"baseline {m['baseline']:3d}  height {m['height']:3d}  feetCx {m['feetCx']:6.1f}")
    # headCx SPREAD and STEP are pose (the head orbits the axis — a sinusoid
    # with possibly large legitimate swings between canon views). What proves
    # a synth heading is HEALTHY is midpointness: its headCx must sit at the
    # midpoint of its two canon neighbours. A ghost/broken synth shifts the
    # head-band centroid several px off-midpoint. Gate: deviation <= 4px.
    hc = [m['headCx'] for _, m in rows]          # ring order: canon,synth,canon,...
    n = len(hc)
    devs = {}
    for i, (d, m) in enumerate(rows):
        if meta['headings'][d]['synth']:
            mid = (hc[(i - 1) % n] + hc[(i + 1) % n]) / 2.0
            devs[d] = round(abs(hc[i] - mid), 2)
    max_dev = max(devs.values()) if devs else 0.0
    steps = [abs(hc[(i + 1) % n] - hc[i]) for i in range(n)]
    gates = {'headTop': report['headTop'] <= GATE,
             'baseline': report['baseline'] <= 2,
             'height': report['height'] <= GATE + 2,
             'feetCx': report['feetCx'] <= GATE,
             'synthMidDev': max_dev <= 4}

    # --- source-rotation analysis: 236 check, contamination, sparse diagnosis ---
    src_dir = os.path.normpath(os.path.join(HERE, '..', '..', args.crew, args.world, 'rotations'))
    src = {}
    if os.path.isdir(src_dir):
        for f in sorted(os.listdir(src_dir)):
            if not f.endswith('.png'):
                continue
            im = Image.open(os.path.join(src_dir, f))
            a = np.array(im.convert('RGBA'), dtype=np.uint8)[..., 3] > ALPHA_ON
            ys, xs = np.nonzero(a)
            bbox = ((int(ys.max()) - int(ys.min()) + 1) * (int(xs.max()) - int(xs.min()) + 1)) if len(ys) else 1
            src[f[:-4]] = dict(size=im.size, cover=float(a.mean()), dens=float(a.sum()) / bbox)
    # Uniform-per-set cell size is what the ring needs (feet-registration pads
    # the rest); MIXED sizes within a set = the head-pop hazard. Uniform but
    # not 236 = contract drift — note it, don't fail it (fleet-measured: 17/27
    # sets sit uniformly at 224-256 and bake healthy rings).
    sizes = {v['size'] for v in src.values()}
    src_uniform = len(sizes) == 1
    src_236 = sizes == {(236, 236)}
    drift = ('' if (src_236 or not src_uniform or not src) else
             f" (sources uniformly {next(iter(sizes))[0]}px, not 236 — §1 contract drift; ring unaffected; flag for owner)")
    cov_min = min((v['cover'] for v in src.values()), default=0.0)
    contaminated = sorted(d for d, v in src.items() if cov_min and v['cover'] > 2.5 * cov_min)

    # vertical synth health: every synth headTop must sit inside the canon
    # envelope +-1px (the vertical mirror of horizontal midpointness)
    canon_ht = [m['headTop'] for d, m in rows if not meta['headings'][d]['synth']]
    cmin, cmax = min(canon_ht), max(canon_ht)
    env_out = {d: m['headTop'] for d, m in rows
               if meta['headings'][d]['synth'] and not (cmin - 1 <= m['headTop'] <= cmax + 1)}

    # --- verdict ladder: gates measure, the ladder decides. Obey the token. ---
    # Thresholds earned 2026-06-10 (guardian/neon repro + 27-set fleet adjudication):
    # benign canon variance measured 5-9px, contaminated stills 14-31px -> lane cap 10;
    # contaminated stills run 3-5x sibling coverage -> 2.5x outlier line.
    failed = {k for k, v in gates.items() if not v}
    if not failed:
        token = 'PASS'
        action = ((f"note: coverage-outlier source still(s) {', '.join(contaminated)} — "
                   'gates green but eyeball recommended') if contaminated else '') + drift
    elif contaminated:
        token = 'FAIL-SOURCE'
        action = (f"contaminated source still(s): {', '.join(contaminated)} (opaque coverage >2.5x the "
                  'set minimum = scene/backdrop baked into the PNG; this is what a huge synthMidDev '
                  'usually means). Fix the SOURCE: imagegen G2 that still + acceptance pipeline '
                  '(no imagegen capability -> STOP, report), or ship ring-off (roster '
                  'turn16.enabled:false). A --mix flip will NOT fix geometry.')
    elif not gates['baseline'] or not gates['feetCx']:
        token = 'FAIL-SOURCE'
        sparse = ', '.join(f"{d}(density {v['dens']:.2f})"
                           for d, v in sorted(src.items(), key=lambda kv: kv[1]['dens'])[:3])
        action = ('feet/axis broken in source art (sparse/disintegrated or floating still). Eyeball '
                  f'the sheet; sparsest source stills: {sparse or "n/a (sources not found)"}. '
                  'imagegen G2 the broken still (no imagegen -> STOP, report) or ship ring-off.')
    elif not gates['synthMidDev'] or env_out:
        token = 'FAIL-SYNTH'
        action = ('synth geometry off its canon neighbours'
                  + (f' (vertical: outside canon envelope [{cmin},{cmax}]: {env_out})' if env_out else '')
                  + '. Rebake ONCE with the other --mix and re-run qa; still FAIL-SYNTH -> ship '
                    'ring-off (turn16.enabled:false) and report.')
    elif failed <= {'headTop', 'height'} and src and not src_uniform:
        token = 'FAIL-SOURCE'
        action = (f'MIXED source cell sizes {sorted(sizes)} — the head-pop hazard: resize ALL '
                  'rotations to 236x236 NEAREST (imagegen acceptance step 3), rebake.')
    elif failed <= {'headTop', 'height'} and report['headTop'] <= 10 and src_uniform and not env_out:
        token = 'PASS-WITH-VARIANCE'
        action = (f"canon pose-height variance (headTop spread {report['headTop']}px is canon-driven; "
                  f'synths inside canon envelope [{cmin},{cmax}]; fleet-measured benign at 5-9px). '
                  'REQUIRED: the step-7 eyeball, with specific attention to head height '
                  'around the ring.' + drift)
    else:
        token = 'CHECK'
        action = ('off-map for this script. STOP and report the owner with these numbers. Never proceed '
                  'past a failed gate without a matching branch — log a SKILL-GAP instead.')

    print('ring spreads:', report,
          f' headCx max neighbour step: {round(max(steps), 1)} (informational)')
    print(f'synth midpointness (|headCx - canon-neighbour midpoint|, gate <=4px): '
          f'max {max_dev}  worst: '
          + ', '.join(f'{d}={v}' for d, v in sorted(devs.items(), key=lambda kv: -kv[1])[:3]))
    if src:
        size_word = ('uniform 236x236' if src_236 else
                     f'uniform {next(iter(sizes))[0]}x{next(iter(sizes))[1]} (not 236 — contract drift)'
                     if src_uniform else f'MIXED {sorted(sizes)} (head-pop hazard)')
        print(f"source rotations: {size_word}; "
              f"coverage outliers (>2.5x min): {', '.join(contaminated) if contaminated else 'none'}; "
              f"synth headTop vs canon envelope [{cmin},{cmax}]: "
              + (f'OUT {env_out}' if env_out else 'all inside'))
    else:
        print(f'source rotations: NOT FOUND ({src_dir}) — contamination check + variance lane unavailable')
    print(f"gates (headTop<={GATE}, baseline<=2, height<={GATE + 2}, feetCx<={GATE}, "
          f"synthMidDev<=4): "
          + ', '.join(f"{k}={'ok' if v else 'FAIL'}" for k, v in gates.items())
          + f'  => {token}')
    if action:
        print('action:', action)
    print('verdict tokens: PASS | PASS-WITH-VARIANCE | FAIL-SOURCE | FAIL-SYNTH | CHECK — automation '
          'keys on the full token after "=>"; only PASS closes a set unconditionally, '
          'PASS-WITH-VARIANCE closes it after the step-7 eyeball, everything else is an open item.')
    print('note: headCx SPREAD/STEP are informational (head orbits the axis by '
          'design); synth midpointness is what gates.')

    # contact sheet, 8 cols x 2 rows
    cell, pad, label_h = 120, 4, 16
    cols, nrows = 8, 2
    W = cols * (cell + pad) + pad
    H = nrows * (cell + pad + label_h) + pad
    sheet = Image.new('RGBA', (W, H), (12, 18, 28, 255))
    draw = ImageDraw.Draw(sheet)
    for i, (d, m) in enumerate(rows):
        cI, rI = i % cols, i // cols
        x0 = pad + cI * (cell + pad)
        y0 = pad + rI * (cell + pad + label_h)
        draw.text((x0, y0), d, fill=(150, 165, 185, 255))
        yc = y0 + label_h
        draw.rectangle([x0, yc, x0 + cell, yc + cell], outline=(40, 55, 78, 255))
        p = os.path.join(root, 'turns', f'{d}.png')
        im = Image.open(p).convert('RGBA')
        s = cell / max(im.width, im.height)
        im2 = im.resize((int(im.width * s), int(im.height * s)), Image.NEAREST)
        sheet.alpha_composite(im2, (x0, yc))
        if m:
            l, t, r, b = m['bbox']
            draw.rectangle([x0 + l * s, yc + t * s, x0 + r * s, yc + b * s],
                           outline=(90, 200, 120, 200))
            cx, cy = x0 + m['headCx'] * s, yc + m['headTop'] * s
            draw.line([cx - 6, cy, cx + 6, cy], fill=(255, 90, 90, 255))
            draw.line([cx, cy - 6, cx, cy + 6], fill=(255, 90, 90, 255))
            fx = x0 + m['feetCx'] * s
            fy = yc + m['baseline'] * s
            draw.line([fx, fy - 4, fx, fy + 4], fill=(125, 255, 213, 255))
    os.makedirs(os.path.join(HERE, 'proof'), exist_ok=True)
    out = os.path.join(HERE, 'proof', f'{args.crew}_{args.world}_turn16_sheet.png')
    sheet.convert('RGB').save(out)
    print('sheet:', out)
    sys.exit(0 if token.startswith('PASS') else (3 if token == 'CHECK' else 2))


if __name__ == '__main__':
    main()
