#!/usr/bin/env python
"""Generate the rhobear-hatch teaching sheets (references/example-*.png).

Provenance tool: these are the images SKILL.md's QA section points at. Re-run
only if the worked example (architect/ship) changes.

  example-before-after.png   row 1 = the 8 raw canon headings as they ship
                             today (45-deg snaps; dark cells = headings that
                             simply don't exist), row 2 = the baked 16-phase
                             lit ring (22.5-deg steps, every cell filled).
  example-bad-turn-sheet.png what a WRONG intermediate looks like: naive
                             unregistered 50/50 alpha blend of neighbours.
                             Signatures to learn: double head/limbs (ghost),
                             translucent mush edges, scattered head crosshairs.
                             (A global-axis warp without per-row normalization
                             produces the same double-head signature.)

Usage:
  python make_reference_examples.py --base <worktree>/hub/assets/crew \
         --poc <worktree>/hub/assets/crew/_preview/poc [--crew architect]
         [--world ship] [--out <skill>/references]
"""
import argparse, os
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
CELL_SRC = 236
DIRS8 = ['south', 'south-west', 'west', 'north-west',
         'north', 'north-east', 'east', 'south-east']
DIRS16 = ['south', 'south-south-west', 'south-west', 'west-south-west',
          'west', 'west-north-west', 'north-west', 'north-north-west',
          'north', 'north-north-east', 'north-east', 'east-north-east',
          'east', 'east-south-east', 'south-east', 'south-south-east']
BG = (12, 18, 28, 255)
DIM = (24, 32, 46, 255)


def load(p):
    return Image.open(p).convert('RGBA') if os.path.exists(p) else None


def bbox_and_head(im):
    a = np.array(im, dtype=np.uint8)[..., 3] > 16
    ys, xs = np.nonzero(a)
    if not len(ys):
        return None
    t, b, l, r = ys.min(), ys.max(), xs.min(), xs.max()
    band = max(8, round((b - t) * 0.22))
    sub = a[t:t + band]
    sy, sx = np.nonzero(sub)
    hx = sx.mean() if len(sx) else (l + r) / 2
    return (l, t, r, b, hx, t)


def put_cell(sheet, draw, im, x0, y0, cell, annotate=True):
    draw.rectangle([x0, y0, x0 + cell, y0 + cell], outline=(40, 55, 78, 255))
    if im is None:
        draw.rectangle([x0 + 1, y0 + 1, x0 + cell - 1, y0 + cell - 1], fill=DIM)
        draw.text((x0 + cell // 2 - 8, y0 + cell // 2 - 6), '(none)', fill=(90, 104, 126, 255))
        return
    s = cell / CELL_SRC
    sheet.alpha_composite(im.resize((int(im.width * s), int(im.height * s)), Image.NEAREST), (x0, y0))
    if annotate:
        info = bbox_and_head(im)
        if info:
            l, t, r, b, hx, ht = info
            draw.rectangle([x0 + l * s, y0 + t * s, x0 + r * s, y0 + b * s],
                           outline=(90, 200, 120, 200))
            cx, cy = x0 + hx * s, y0 + ht * s
            draw.line([cx - 6, cy, cx + 6, cy], fill=(255, 90, 90, 255))
            draw.line([cx, cy - 6, cx, cy + 6], fill=(255, 90, 90, 255))


def before_after(base, poc, crew, world, out):
    cell, pad, lab = 96, 4, 18
    cols = 16
    W = cols * (cell + pad) + pad
    H = 2 * (cell + pad + lab) + pad
    sheet = Image.new('RGBA', (W, H), BG)
    draw = ImageDraw.Draw(sheet)
    y0 = pad
    draw.text((pad, y0), f'BEFORE - {crew}/{world}: the 8 canon headings, 45° apart. '
                         'Turning = snapping across the gaps.', fill=(150, 165, 185, 255))
    for i, d in enumerate(DIRS16):
        im = load(os.path.join(base, crew, world, 'rotations', f'{d}.png')) if d in DIRS8 else None
        put_cell(sheet, draw, im, pad + i * (cell + pad), y0 + lab, cell, annotate=False)
    y0 = pad + cell + pad + lab
    draw.text((pad, y0 + pad), f'AFTER - the baked 16-phase lit turn ring, 22.5° apart. '
                               'Every gap filled; world-fixed mint rim light.', fill=(125, 255, 213, 255))
    for i, d in enumerate(DIRS16):
        im = load(os.path.join(poc, 'turn16', crew, world, 'turns', f'{d}.png'))
        put_cell(sheet, draw, im, pad + i * (cell + pad), y0 + pad + lab, cell, annotate=False)
    p = os.path.join(out, 'example-before-after.png')
    sheet.convert('RGB').save(p)
    print('wrote', p)


def bad_sheet(base, poc, crew, world, out):
    """The failure exhibit: naive midpoints (no registration, alpha blend)."""
    cell, pad, lab = 110, 4, 18
    cols = 8
    W = cols * (cell + pad) + pad
    H = 2 * (cell + pad + lab) + pad + 20
    sheet = Image.new('RGBA', (W, H), BG)
    draw = ImageDraw.Draw(sheet)
    y0 = pad
    draw.text((pad, y0), 'BAD (reject) - naive unregistered 50/50 alpha blend of neighbours. '
                         'Signatures: double head/limbs, mush edges, scattered crosshairs.',
              fill=(255, 120, 120, 255))
    mids = []
    for i, d in enumerate(DIRS8):
        a = load(os.path.join(base, crew, world, 'rotations', f'{d}.png'))
        b = load(os.path.join(base, crew, world, 'rotations', f'{DIRS8[(i + 1) % 8]}.png'))
        na = np.array(a, dtype=np.float32); nb = np.array(b, dtype=np.float32)
        mids.append(Image.fromarray(((na + nb) / 2).astype(np.uint8)))
    for i, im in enumerate(mids):
        put_cell(sheet, draw, im, pad + i * (cell + pad), y0 + lab, cell, annotate=True)
    y0 = pad + cell + pad + lab
    draw.text((pad, y0 + pad), 'GOOD (ship) - the same 8 midpoint headings from bake_turn16.py '
                               '(per-row normalized warp, palette-pure merge, rim light).',
              fill=(125, 255, 213, 255))
    for i, d8 in enumerate(DIRS8):
        mid_name = DIRS16[(2 * i + 1) % 16]
        im = load(os.path.join(poc, 'turn16', crew, world, 'turns', f'{mid_name}.png'))
        put_cell(sheet, draw, im, pad + i * (cell + pad), y0 + pad + lab, cell, annotate=True)
    draw.text((pad, H - 16), 'Judge with the crosshair: GOOD = one red cross per head, level across the row. '
                             'BAD = crosses wander / sit between two heads.', fill=(150, 165, 185, 255))
    p = os.path.join(out, 'example-bad-turn-sheet.png')
    sheet.convert('RGB').save(p)
    print('wrote', p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', required=True, help='crew root: <worktree>/hub/assets/crew')
    ap.add_argument('--poc', required=True, help='poc dir: <worktree>/hub/assets/crew/_preview/poc')
    ap.add_argument('--crew', default='architect')
    ap.add_argument('--world', default='ship')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(HERE), 'references'))
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    before_after(args.base, args.poc, args.crew, args.world, args.out)
    bad_sheet(args.base, args.poc, args.crew, args.world, args.out)


if __name__ == '__main__':
    main()
