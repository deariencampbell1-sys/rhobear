#!/usr/bin/env python
"""RHOBEAR sprite QA contact sheet — hatch-pet make_contact_sheet equivalent.

Lays out every frame of a crew/world's walking + animating sequences in a grid
(one row per direction) so head-detach / baseline-pop / registration drift is
visible at a glance. Draws the opaque-bbox + head-anchor crosshair on each cell.

Usage:
  python make_contact_sheet.py <crew> <world> [--kind walking|animating]
Outputs: _preview/qa/<crew>_<world>_<kind>.png
"""
import sys, os
from PIL import Image, ImageDraw

DIRS = ['south', 'south-west', 'west', 'north-west',
        'north', 'north-east', 'east', 'south-east']
HERE = os.path.dirname(os.path.abspath(__file__))
# Default assumes _preview layout; override with --base from the packaged skill.
CREW_ROOT = os.path.dirname(HERE)


def bbox_and_head(im):
    a = im.convert('RGBA').split()[3]
    bb = a.getbbox()
    if not bb:
        return None
    l, t, r, b = bb
    figh = b - t
    band = max(8, round(figh * 0.22))
    px = a.load()
    sx = cnt = 0
    for y in range(t, min(im.height, t + band)):
        for x in range(l, r + 1):
            if px[x, y] > 16:
                sx += x
                cnt += 1
    hx = sx / cnt if cnt else (l + r) / 2
    return (l, t, r, b, hx, t)  # bbox + head anchor (hx, top)


def build(crew, world, kind):
    base = os.path.join(CREW_ROOT, crew, world, kind)
    n = 6 if kind == 'walking' else 4
    cell = 120
    cols = n
    rows = len(DIRS)
    pad = 4
    W = cols * (cell + pad) + pad
    H = rows * (cell + pad) + pad + 18 * rows
    sheet = Image.new('RGBA', (W, H), (12, 18, 28, 255))
    draw = ImageDraw.Draw(sheet)
    for ri, d in enumerate(DIRS):
        y0 = pad + ri * (cell + pad + 18)
        draw.text((pad, y0), f'{kind}/{d}', fill=(150, 165, 185, 255))
        for fi in range(n):
            p = os.path.join(base, d, f'frame_{fi:03d}.png')
            x0 = pad + fi * (cell + pad)
            yc = y0 + 18
            draw.rectangle([x0, yc, x0 + cell, yc + cell], outline=(40, 55, 78, 255))
            if not os.path.exists(p):
                continue
            im = Image.open(p).convert('RGBA')
            # scale 236 -> cell, paste
            s = cell / max(im.width, im.height)
            im2 = im.resize((int(im.width * s), int(im.height * s)), Image.NEAREST)
            sheet.alpha_composite(im2, (x0, yc))
            info = bbox_and_head(im)
            if info:
                l, t, r, b, hx, ht = info
                # scaled coords
                sl, st, sr, sb = l * s, t * s, r * s, b * s
                draw.rectangle([x0 + sl, yc + st, x0 + sr, yc + sb],
                               outline=(90, 200, 120, 200))
                # head anchor crosshair (red)
                cx, cy = x0 + hx * s, yc + ht * s
                draw.line([cx - 6, cy, cx + 6, cy], fill=(255, 90, 90, 255))
                draw.line([cx, cy - 6, cx, cy + 6], fill=(255, 90, 90, 255))
    return sheet


def main():
    global CREW_ROOT
    if len(sys.argv) < 3:
        print('usage: make_contact_sheet.py <crew> <world> [--kind walking|animating] [--base <crew_root>]')
        return
    crew, world = sys.argv[1], sys.argv[2]
    kind = 'walking'
    if '--kind' in sys.argv:
        kind = sys.argv[sys.argv.index('--kind') + 1]
    if '--base' in sys.argv:
        CREW_ROOT = sys.argv[sys.argv.index('--base') + 1]
    out_dir = os.path.join(HERE, 'qa')
    os.makedirs(out_dir, exist_ok=True)
    sheet = build(crew, world, kind)
    out = os.path.join(out_dir, f'{crew}_{world}_{kind}.png')
    sheet.convert('RGB').save(out)
    print('wrote', out)


if __name__ == '__main__':
    main()
