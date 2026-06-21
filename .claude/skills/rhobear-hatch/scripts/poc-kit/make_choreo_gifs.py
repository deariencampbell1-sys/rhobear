#!/usr/bin/env python
"""Choreography proof GIFs — real frames, true engine cadence (Lane H POC).

Renders the POC's signature moves as looping GIFs so the owner can feel them
without serving the harness:
  <crew>_<world>_turn90_ab.gif   snap-vs-16-phase, same 90 deg turn, side by side
  <crew>_<world>_bored.gif       slow idle + look-around beat + sigh
  <crew>_<world>_curious.gif     perk + "!" + fast turn-to-stimulus + watch
  <crew>_<world>_working.gif     focused loop + mint station underglow pulse

Frame timings mirror sprite-engine-v2 TUNE2 (anticipate 95ms / mid 52 / settle
110, fast turns 45ms). Sources: poc/turn16 ring + canon animating frames.
Usage: python make_choreo_gifs.py [--crew architect] [--world ship]
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
CREW_ROOT = os.path.dirname(os.path.dirname(HERE))
CELL = 236
BG = (10, 14, 24)
MINT = (125, 255, 213)

DIRS16 = ['south', 'south-south-west', 'south-west', 'west-south-west',
          'west', 'west-north-west', 'north-west', 'north-north-west',
          'north', 'north-north-east', 'north-east', 'east-north-east',
          'east', 'east-south-east', 'south-east', 'south-south-east']


def load(p):
    return Image.open(p).convert('RGBA') if os.path.exists(p) else None


class Kit:
    def __init__(self, crew, world):
        self.ring = {d: load(os.path.join(HERE, 'turn16', crew, world, 'turns', f'{d}.png'))
                     for d in DIRS16}
        self.meta = json.load(open(os.path.join(HERE, 'turn16', crew, world, 'meta.json')))
        self.anim = {d: [load(os.path.join(CREW_ROOT, crew, world, 'animating', d, f'frame_{i:03d}.png'))
                         for i in range(4)] for d in ['south', 'east', 'south-east']}
        self.rot = {d: load(os.path.join(CREW_ROOT, crew, world, 'rotations', f'{d}.png'))
                    for d in ['south', 'east', 'south-east']}

    def width_of(self, phase):
        return self.meta['headings'][DIRS16[phase % 16]]['width']


def cell_frame(kit, img, phase=None, scale_y=1.0, glyph=0.0, glow=0.0):
    """Compose one 236x236 cell: shadow + figure (+ underglow, + '!' glyph)."""
    fr = Image.new('RGBA', (CELL, CELL), BG + (255,))
    d = ImageDraw.Draw(fr)
    feet_y = 212
    w_sil = kit.width_of(phase) if phase is not None else 90
    shw = int(w_sil * 0.46)
    if glow > 0:
        for rr, aa in ((70, 0.10), (52, 0.16), (36, 0.22)):
            d.ellipse([118 - rr, feet_y - 18 - rr // 2, 118 + rr, feet_y - 18 + rr // 2],
                      fill=MINT + (int(255 * aa * glow),))
    d.ellipse([118 - shw, feet_y - max(3, int(shw * 0.22)),
               118 + shw, feet_y + max(3, int(shw * 0.22))], fill=(4, 8, 16, 76))
    if img is not None:
        if scale_y != 1.0:
            nh = max(1, int(round(CELL * scale_y)))
            fig = img.resize((CELL, nh), Image.NEAREST)
            # feet stay planted: the source baseline (212) lands on 212
            fr.alpha_composite(fig, (0, int(round(212 * (1 - scale_y)))))
        else:
            fr.alpha_composite(img, (0, 0))
    if glyph > 0:
        gx, gy = 118, 64
        a = int(255 * min(1, glyph))
        d = ImageDraw.Draw(fr)
        d.rectangle([gx - 2, gy - 16, gx + 2, gy - 5], fill=MINT + (a,))
        d.rectangle([gx - 2, gy - 1, gx + 2, gy + 3], fill=MINT + (a,))
    return fr


def save_gif(frames_ms, path, size=None):
    ims, durs = [], []
    for im, ms in frames_ms:
        if size:
            im = im.resize(size, Image.NEAREST)
        ims.append(im.convert('RGB').quantize(colors=160, dither=Image.Dither.NONE))
        durs.append(ms)
    ims[0].save(path, save_all=True, append_images=ims[1:], duration=durs, loop=0, disposal=2)
    print('wrote', path)


def label(im, txt):
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, im.width, 16], fill=(7, 11, 20, 255))
    d.text((6, 3), txt, fill=MINT)
    return im


def turn90_ab(kit, out):
    """Same 90-degree turn (S -> E): left = old 8-dir snap, right = 16-phase."""
    # 16-phase side: 0 ->15(95) ->14(52) ->13(52) ->12(110); snap side: 0 ... 12
    seq = [(0, 600, 0), (15, 95, 0), (14, 52, 0), (13, 52, 0), (12, 710, 12)]
    # and back
    seq += [(13, 95, 12), (14, 52, 12), (15, 52, 0), (0, 710, 0)]
    frames = []
    for phase16, ms, snap_phase in seq:
        right = cell_frame(kit, kit.ring[DIRS16[phase16]], phase16)
        left = cell_frame(kit, kit.ring[DIRS16[snap_phase]], snap_phase)
        combo = Image.new('RGBA', (CELL * 2 + 8, CELL + 18), (7, 11, 20, 255))
        combo.alpha_composite(label(left, 'BEFORE - 8-dir snap'), (0, 18))
        combo.alpha_composite(label(right, 'AFTER - 16-phase lit turn'), (CELL + 8, 18))
        frames.append((combo, ms))
    save_gif(frames, out)


def bored(kit, out):
    frames = []
    for loop in range(2):
        for i in range(4):
            frames.append((cell_frame(kit, kit.anim['south'][i] or kit.rot['south'], 0), 300))
    # look-around beat: sweep to south-west-ish and back (phases 0->1->2->3)
    for p, ms in [(1, 95), (2, 52), (3, 110)]:
        frames.append((cell_frame(kit, kit.ring[DIRS16[p]], p), ms))
    frames.append((cell_frame(kit, kit.ring[DIRS16[3]], 3), 750))
    for p, ms in [(2, 95), (1, 52), (0, 110)]:
        frames.append((cell_frame(kit, kit.ring[DIRS16[p]], p), ms))
    # sigh (squash, feet planted)
    for sy, ms in [(0.985, 140), (0.972, 200), (0.985, 140), (1.0, 320)]:
        frames.append((cell_frame(kit, kit.ring['south'], 0, scale_y=sy), ms))
    save_gif(frames, out)


def curious(kit, out):
    frames = [(cell_frame(kit, kit.ring['south'], 0), 480)]
    # perk + "!"
    for sy, g, ms in [(1.02, 1, 70), (1.035, 1, 110), (1.02, 1, 90)]:
        frames.append((cell_frame(kit, kit.ring['south'], 0, scale_y=sy, glyph=g), ms))
    # fast turn to the stimulus (east): 0 ->15->14->13->12 at 45ms
    for p in [15, 14, 13]:
        frames.append((cell_frame(kit, kit.ring[DIRS16[p]], p, glyph=0.8), 45))
    frames.append((cell_frame(kit, kit.ring['east'], 12, glyph=0.5), 90))
    # watch it, alert loop
    for loop in range(2):
        for i in range(4):
            frames.append((cell_frame(kit, kit.anim['east'][i] or kit.rot['east'], 12), 160))
    frames.append((cell_frame(kit, kit.ring['east'], 12), 400))
    save_gif(frames, out)


def working(kit, out):
    frames = []
    for loop in range(3):
        for i in range(4):
            pulse = 0.5 + 0.5 * np.sin((loop * 4 + i) / 8 * 2 * np.pi)
            frames.append((cell_frame(kit, kit.anim['south-east'][i] or kit.rot['south-east'],
                                      14, glow=pulse), 111))
    save_gif(frames, out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--crew', default='architect')
    ap.add_argument('--world', default='ship')
    args = ap.parse_args()
    kit = Kit(args.crew, args.world)
    qa = os.path.join(HERE, 'proof')
    os.makedirs(qa, exist_ok=True)
    tag = f'{args.crew}_{args.world}'
    turn90_ab(kit, os.path.join(qa, f'{tag}_turn90_ab.gif'))
    bored(kit, os.path.join(qa, f'{tag}_bored.gif'))
    curious(kit, os.path.join(qa, f'{tag}_curious.gif'))
    working(kit, os.path.join(qa, f'{tag}_working.gif'))


if __name__ == '__main__':
    main()
