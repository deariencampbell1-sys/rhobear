#!/usr/bin/env python
"""RHOBEAR sprite MASTER catalog — Iron Man's authoritative final-touch pass.

Inventories + measures every crew/world set in one shot, applies the same
contract + head-anchor drift checks used on the architect/ship reference, and
writes reports/MASTER.md (verdict table + regen list + head-drift watch).

Run from repo root:  python hub/assets/crew/_preview/build_master_report.py
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CREW_ROOT = os.path.dirname(HERE)               # .../hub/assets/crew
REPORTS = os.path.join(HERE, 'reports')

CREW = ['architect', 'builder', 'designer', 'foreman', 'guardian',
        'lattice', 'reviewer', 'spark', 'wizard']
WORLDS = ['neon', 'ship', 'western']
DIRS = ['south', 'south-west', 'west', 'north-west',
        'north', 'north-east', 'east', 'south-east']
WALK_F, ANIM_F = 6, 4
THRESH = 4  # px head spread that the runtime head-anchor still pins, but worth noting

# Subjective art-quality observations from the 9-worker visual pass (kept here so
# MASTER stays the single reproducible source). These are owner's-eye items, not
# blockers — the engine renders them fine.
VISUAL = {
    'architect/western': 'walking/west reads lighter in tone than the rest of the crew; '
                         'animating/west figure renders at a slightly smaller scale.',
    'spark/western': 'walking/east & south-east headCx drift is held-pickaxe + hat-brim '
                     'pose shift, not a registration break — head stays attached.',
    'wizard/western': 'foot-shadow disc under the south boots is an intended shadow effect, '
                      'not scenery (clears hatch-pet QA).',
}


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
                sx += x; cnt += 1
    return dict(headTop=t, headCx=(sx / cnt if cnt else (l + r) / 2))


def seq(base, kind, d, nframes):
    """Return (present_count, drift or None)."""
    paths = [os.path.join(base, kind, d, f'frame_{i:03d}.png') for i in range(nframes)]
    present = [p for p in paths if os.path.exists(p)]
    # also count any extra frames beyond the contract (e.g. lattice anim 8f)
    extra = 0
    i = nframes
    while os.path.exists(os.path.join(base, kind, d, f'frame_{i:03d}.png')):
        extra += 1; i += 1
    if not present:
        return 0, None, extra
    ms = [head_metrics(p) for p in present]
    ms = [m for m in ms if m]
    drift = None
    if len(ms) > 1:
        ht = max(m['headTop'] for m in ms) - min(m['headTop'] for m in ms)
        hc = max(m['headCx'] for m in ms) - min(m['headCx'] for m in ms)
        drift = (round(ht, 1), round(hc, 1))
    return len(present), drift, extra


def audit(crew, world):
    base = os.path.join(CREW_ROOT, crew, world)
    if not os.path.isdir(base):
        return None
    rot = sum(os.path.exists(os.path.join(base, 'rotations', f'{d}.png')) for d in DIRS)
    walk_ok, anim_ok = 0, 0
    regen, watch, extras = [], [], []
    for d in DIRS:
        n, drift, extra = seq(base, 'walking', d, WALK_F)
        if n == WALK_F:
            walk_ok += 1
        elif n == 0:
            regen.append(f'walking/{d} (6f)')
        else:
            regen.append(f'walking/{d} ({WALK_F-n} of 6 missing)')
        if drift and (drift[0] > THRESH or drift[1] > THRESH):
            watch.append(f'walking/{d} headTop {drift[0]} headCx {drift[1]}')
        if extra:
            extras.append(f'walking/{d} +{extra}f')
    for d in DIRS:
        n, drift, extra = seq(base, 'animating', d, ANIM_F)
        if n >= ANIM_F:
            anim_ok += 1
        elif n == 0:
            regen.append(f'animating/{d} (4f)')
        else:
            regen.append(f'animating/{d} ({ANIM_F-n} of 4 missing)')
        if extra:
            extras.append(f'animating/{d} +{extra}f')
    verdict = 'SHIP' if (walk_ok == 8 and anim_ok == 8 and rot == 8) else 'NEEDS-REGEN'
    return dict(walk=walk_ok, anim=anim_ok, rot=rot, verdict=verdict,
               regen=regen, watch=watch, extras=extras)


def main():
    os.makedirs(REPORTS, exist_ok=True)
    rows, regens, watches, notes, missing_worlds = [], [], [], [], []
    ship = 0
    for c in CREW:
        for w in WORLDS:
            a = audit(c, w)
            if a is None:
                missing_worlds.append(f'{c}/{w}')
                continue
            rows.append((f'{c}/{w}', a))
            if a['verdict'] == 'SHIP':
                ship += 1
            else:
                regens.append((f'{c}/{w}', a['regen']))
            if a['watch']:
                watches.append((f'{c}/{w}', a['watch']))
            if a['extras']:
                notes.append((f'{c}/{w}', a['extras']))

    out = ['# RHOBEAR crew sprites — MASTER QA catalog',
           '',
           f'Authoritative final-touch pass (Iron Man). {ship}/{len(rows)} sets SHIP.',
           'Method: contract check (walk 8×6, anim 8×4, rot 8) + head-anchor drift.',
           'Visual QA (no hatch-pet rejects: text/grids/bubbles/UI/checkerboard/scenery)',
           'confirmed across the 9-worker pass + spot-check.',
           '',
           '| set | walk (n/8) | anim (n/8) | rot (n/8) | verdict |',
           '|---|---|---|---|---|']
    for name, a in rows:
        out.append(f'| {name} | {a["walk"]}/8 | {a["anim"]}/8 | {a["rot"]}/8 | '
                   f'{"**"+a["verdict"]+"**" if a["verdict"]!="SHIP" else "SHIP"} |')

    out += ['', '## Regenerate list (owner)']
    if regens:
        for name, items in regens:
            out.append(f'- **{name}** — ' + '; '.join(items))
    else:
        out.append('- none')
    if missing_worlds:
        out += ['', '## Worlds absent on disk',
                '- ' + ', '.join(missing_worlds) + ' (build full set if a 3-world cadence is wanted)']

    out += ['', '## Head-drift watch (informational — runtime head-anchor already pins these)']
    if watches:
        for name, items in watches:
            out.append(f'- **{name}**: ' + '; '.join(items))
    else:
        out.append('- none above threshold')

    if notes:
        out += ['', '## Contract notes (extra frames beyond spec)']
        for name, items in notes:
            out.append(f'- **{name}**: ' + '; '.join(items))

    out += ['', "## Visual watch (owner's eye — art quality, not blockers)"]
    for name, note in VISUAL.items():
        out.append(f'- **{name}**: {note}')

    path = os.path.join(REPORTS, 'MASTER.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    print('\n'.join(out))
    print('\nwrote', path)


if __name__ == '__main__':
    main()
