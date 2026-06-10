#!/usr/bin/env python
"""RHOBEAR sprite registration diagnostic — quantifies head-detach risk.

For each direction of a crew/world's walking + animating sequences, reports the
frame-to-frame drift of: head-top, head horizontal-center, baseline (feet), and
figure height. Large spreads = the "per-frame fit-to-cell" artifact that makes
the head read as detached. Use BEFORE building to know which sequences need the
stable-slots/head-anchor fix, and AFTER to confirm the fix pinned them.

Usage:  python measure_registration.py <crew> <world>
        python measure_registration.py <crew> <world> --base D:/rhobear-wave5-wt/hub/assets/crew
"""
import sys, os
from PIL import Image

DIRS = ['south', 'south-west', 'west', 'north-west',
        'north', 'north-east', 'east', 'south-east']


def head_metrics(path):
    a = Image.open(path).convert('RGBA').split()[3]
    bb = a.getbbox()
    if not bb:
        return None
    l, t, r, b = bb
    figh = b - t
    band = max(8, round(figh * 0.22))
    px = a.load()
    sx = cnt = 0
    for y in range(t, t + band):
        for x in range(l, r + 1):
            if px[x, y] > 16:
                sx += x
                cnt += 1
    hcx = sx / cnt if cnt else (l + r) / 2
    return dict(headTop=t, headCx=hcx, baseline=b, height=figh)


def seq_drift(base, crew, world, kind, dir):
    n = 6 if kind == 'walking' else 4
    rows = []
    for i in range(n):
        p = os.path.join(base, crew, world, kind, dir, f'frame_{i:03d}.png')
        if os.path.exists(p):
            m = head_metrics(p)
            if m:
                rows.append(m)
    if not rows:
        return None
    def spread(k):
        vals = [r[k] for r in rows]
        return round(max(vals) - min(vals), 1)
    return dict(headTop=spread('headTop'), headCx=spread('headCx'),
               baseline=spread('baseline'), height=spread('height'))


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return
    crew, world = sys.argv[1], sys.argv[2]
    # Default assumes this script sits in .../crew/_preview (the worktree layout):
    # crew root = the parent of _preview. Override with --base from the packaged skill.
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if '--base' in sys.argv:
        base = sys.argv[sys.argv.index('--base') + 1]
    THRESH = 4  # px spread above which a head-anchor fix is recommended
    print(f'registration drift for {crew}/{world}  (base={base})')
    print('  [spread = max-min across frames; headCx/headTop > %dpx => fix]' % THRESH)
    flagged = []
    for kind in ('walking', 'animating'):
        print(f'  -- {kind} --')
        for d in DIRS:
            s = seq_drift(base, crew, world, kind, d)
            if not s:
                print(f'     {d:11} (missing)')
                continue
            warn = '  <== FIX' if (s['headCx'] > THRESH or s['headTop'] > THRESH
                                   or s['height'] > THRESH) else ''
            if warn:
                flagged.append(f'{kind}/{d}')
            print('     %-11s headTop %-4s headCx %-4s baseline %-4s height %-4s%s'
                  % (d, s['headTop'], s['headCx'], s['baseline'], s['height'], warn))
    print(f'  flagged: {len(flagged)} sequence(s)'
          + (': ' + ', '.join(flagged) if flagged else ' — all stable'))


if __name__ == '__main__':
    main()
