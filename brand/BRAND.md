# RHOBEAR Brand — Constellation Bear

**ONE-VERSION LAW.** The RHOBEAR brand mark is the **Constellation Bear**: a low-poly
starlight bear with a contrasting heart-star. The masters live in exactly one place —

```
brand/bears/rhobear-bear-<hue>.png     (512×512 RGBA, sRGB)
brand/bears/_contact-sheet.png         (the owner-approved strip)
```

This directory (`brand/` in the `rhobear` repo) is the **single canonical home**.

## HARD RULES

1. **Never redraw the bear.** No hand-drawn cartoon, no SVG rebuild, no AI re-generation.
   Every bear you see anywhere in the family is a composite of one of these masters.
2. **Never fake a hue.** A product's hue is its master. Never CSS `filter: hue-rotate()`
   or tint overlays to turn one bear into another. If a hue is missing, it does not exist.
3. **Each product repo vendors ONLY its own hue master** (a single PNG copy). The reviews
   repo keeps only its own vendored gold bear. No product carries the full set.

## Hue map

| Product | Hue key | Master | Product hue (sampled body) |
|---|---|---|---|
| RHOBEAR Hub (app, local) | `hub-teal` | `rhobear-bear-hub-teal.png` | `#236C72` |
| RHOBEAR Hub (cloud workbench) | `hub-teal` | `rhobear-bear-hub-teal.png` | `#236C72` |
| RHOBEAR Plans (cloud) | `plans-purple` | `rhobear-bear-plans-purple.png` | `#933E8C` |
| RHOBEAR Designs | `designs-red` | `rhobear-bear-designs-red.png` | `#853730` |
| RHOBEAR Reviews | `reviews-gold` | `rhobear-bear-reviews-gold.png` | `#96701A` |
| Captur'd (sunsponge-capture) | `capturd-blue` | `rhobear-bear-capturd-blue.png` | `#2D4D96` |
| RHOBEAR Verifier | `verifier-green` | `rhobear-bear-verifier-green.png` | `#17741C` |

Product hues are the modal body color sampled from each master (not the accent heart-star).
Background floor color is `#0a0e13` everywhere.

## Icon template (the Icon Factory)

`brand/icons/factory.mjs` — Node + sharp + png-to-ico. Run from the repo root:

```bash
node brand/icons/factory.mjs \
  --master brand/bears/rhobear-bear-hub-teal.png \
  --hue 236c72 --name hub-teal \
  [--cloud] [--out brand/icons/out/hub-teal-local]
```

**Composition (spec):**
- Background: rounded square `#0a0e13`, corner radius **22%** of the edge.
- Bear: master composited **centered at ~70%** of the edge.
- Inner ring: ~1px stroke at **16% opacity of the product hue**, inset along the square.
- **Cloud SKU (`--cloud`)**: a small **3-star constellation cluster, top-right corner, in
  the product hue.** This is the **local-vs-cloud differentiator** — local icons get NO badge.
- **Maskable** variant: full-bleed square background (no rounded corners — the launcher masks
  it), content pulled into the central **80% safe zone** (bear @ ~56%).

**Outputs (one run):**
- `512 / 192 / 180 / 64` PNG
- `maskable-512.png` (safe-zone padded, full-bleed)
- `apple-touch-180.png`
- `favicon.ico` — 16/32/48
- `<name>.ico` — Windows multi-res 16/24/32/48/64/128/256
- `<name>-tray.ico` — 16/24/32 (system-tray / taskbar)
- `_contact-sheet.png` — visual proof

Generated reference sets live under `brand/icons/out/<hue>-<local|cloud>/`.

## Cloud-badge rule (when to add the 3-star cluster)

The cloud badge marks **the cloud variant of a product that ALSO ships a local SKU**. It
exists so a user can tell the cloud icon apart from the local one at a glance.

| Product | Local SKU? | Cloud/web SKU? | Badge on cloud icon? |
|---|---|---|---|
| Hub | yes (rhobear-app) | yes (cloud-workbench) | **YES** |
| Plans | — | yes (cloud) | **YES** (per rollout) |
| Designs | no | web/PWA only | no (no local to differentiate from) |
| Reviews | yes (local app) | — | no |
| Captur'd | yes (MSIX) | landing only | no |
| Verifier | yes | — | no |

If a product later gains a second SKU, regenerate the cloud set with `--cloud` and replace,
**don't add a second icon alongside**.

## Install-art template

`brand/install-art/banner.mjs` — generates Inno/installer art from a master.

**Composition (spec):**
- Dark floor `#0a0e13`, **product-hue radial glow** behind the bear.
- **Product bear on the left**, **wordmark on the right**.
- Emits an Inno Setup wizard sidebar (`164×314`, the classic `WizardImageFile`) and a wide
  banner (`497×120`).

Only products that already have an installer pipeline get install art wired in this lane
(the Hub — Inno `.exe`; MSIX is dead). Other products get the template only.
