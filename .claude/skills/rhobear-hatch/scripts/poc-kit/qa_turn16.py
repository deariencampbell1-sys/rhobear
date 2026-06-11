#!/usr/bin/env python
"""QA for a baked 16-heading turn ring — registration + contact sheet.

Registration: the canon measure_registration logic (head-top / head-cx /
baseline / height spread) applied AROUND THE RING. A real rotation changes
silhouette width but must keep the figure on its axis: feet pinned, head-top
steady, height steady. Head-cx wanders with pose by design (the head orbits
the axis slightly as shoulders swing) — we report it, gate on the others.

Contact sheet: 16 cells with bbox (green) + head-anchor crosshair (red) +
feet-axis tick (mint), hatch-pet style, written to poc/proof/.

Usage: python qa_turn16.py [--crew architect] [--world ship]
"""
import argparse, json, os
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
    print('ring spreads:', report,
          f' headCx max neighbour step: {round(max(steps), 1)} (informational)')
    print(f'synth midpointness (|headCx - canon-neighbour midpoint|, gate <=4px): '
          f'max {max_dev}  worst: '
          + ', '.join(f'{d}={v}' for d, v in sorted(devs.items(), key=lambda kv: -kv[1])[:3]))
    verdict = 'PASS' if all(gates.values()) else 'CHECK'
    print(f"gates (headTop<={GATE}, baseline<=2, height<={GATE + 2}, feetCx<={GATE}, "
          f"synthMidDev<=4): "
          + ', '.join(f"{k}={'ok' if v else 'FAIL'}" for k, v in gates.items())
          + f'  => {verdict}')
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
    out = os.path.join(HERE, 'proof', f'{args.crew}_{args.world}_turn16_sheet.png')
    sheet.convert('RGB').save(out)
    print('sheet:', out)


if __name__ == '__main__':
    main()
