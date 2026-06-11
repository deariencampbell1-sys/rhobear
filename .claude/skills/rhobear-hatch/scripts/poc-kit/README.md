# poc-kit — the runnable 3D-turn + hub-behavior toolkit

These five files are the WHOLE mechanism. They are designed to run from
`<worktree>/hub/assets/crew/_preview/poc/` (paths inside them are relative to
that location — `../sprite-engine.js`, `../../<crew>/<world>`).

| file | what it is | run/load |
|---|---|---|
| `bake_turn16.py` | Bakes the 16-heading lit turn ring from the 8 canon rotations. Prints the **mix gate** (luma ratio ≤ 1.18). | `python bake_turn16.py --crew <c> --world <w> --selftest` |
| `qa_turn16.py` | Ring registration gates (**PASS required**: baseline ≤2, feet ≤4, headTop ≤4, height ≤6, synthMidDev ≤4) + annotated 16-cell contact sheet. | `python qa_turn16.py --crew <c> --world <w>` |
| `make_choreo_gifs.py` | Personality + before/after turn proof GIFs at true engine cadence. | `python make_choreo_gifs.py --crew <c> --world <w>` |
| `sprite-engine-v2.js` | Additive engine layer (`window.RhobearSpritesV2`): TurnRing, ActorV2 (eased 16-phase turns, BORED/WORKING/CURIOUS, speak/aside), Band (floor band). Loads AFTER `../sprite-engine.js`; v1 untouched. | `<script>` tag, see hub-poc.html |
| `hub-poc.html` | The feel-check room. **Parameterized**: `hub-poc.html?crew=<c>&world=<w>` — no edits needed. Expects `bg-<world>.png` beside it (copy from rhobear-design assets; missing bg = dark gradient, still works). | serve worktree root, open in browser |

## Install into a worktree
If your branch descends from `feat/h-fable-sprites`, the kit is already
in-tree at `hub/assets/crew/_preview/poc/` — but THIS skill copy is canonical;
if the skill copy is newer (check the gates it prints), overwrite the in-tree
copies with these. Fresh tree:

```bash
mkdir -p <worktree>/hub/assets/crew/_preview/poc
cp <skill>/scripts/poc-kit/* <worktree>/hub/assets/crew/_preview/poc/
cp <skill-sibling rhobear-design>/assets/bg-{ship,western,neon}.png \
   <worktree>/hub/assets/crew/_preview/poc/
```

Outputs land in `poc/turn16/<crew>/<world>/` (assets + meta.json) and
`poc/proof/` (committable evidence; `qa/` directories stay gitignored scratch).
