# RHOBEAR — master brand mark usage

The **parent mark**: an ink-style roaring grizzly bear-head glyph + `RHOBEAR` wordmark.
This is the top of the brand hierarchy. It is **not** the photoreal cinematic bear (homepage
WebGL) and **not** the per-product constellation bears (product hero accents). Those are
children; this is the parent.

## Files (this directory: `assets/brand/`)

| File | Use |
|---|---|
| `bear-glyph.svg` | Glyph, `currentColor` — set the color in CSS. Preferred for HTML. |
| `bear-glyph-frost.svg` / `-summit.svg` / `-teal.svg` | Fixed-color glyph variants. |
| `lockup-horizontal-frost.svg` / `-summit.svg` | Glyph + `RHOBEAR` + `rhobear.ai`. **Nav/header only.** |
| `favicon.ico` | 16/32/48 tab icon (frost bear on summit disc). |
| `favicon-256.png`, `favicon-32.png`, `favicon-16.png` | PNG icon steps. |
| `apple-touch-icon.png` | 180×180, summit field, iOS home screen. |
| `android-chrome-192.png` / `-512.png`, `maskable-512.png` | Android / PWA. |
| `og-image.png` | 1200×630 social card, lockup on summit `#1A2435`. |
| `../rhobear-logo.png` | The shared nav/footer logo (frost bear, transparent) — replaced site-wide. |

## Color — parent mark ships in THREE treatments ONLY

- **Frost** `#E8F0F7` — on summit/dark surfaces (default; nav, footer, dark cards).
- **Summit** `#1A2435` — on frost/light surfaces.
- **Teal** `#2A8FA8` — accent-context only (sparingly).
- Premium/special: **Gold** `#D4A843` (rare, e.g. licensing seals). Deep-shadow field `#0D1520`.

**Never** tint the parent mark with a product accent (Captur'd amber, Designs teal-green,
Sales, etc.). The product **constellation** bears carry the product hue; the parent stays
frost/summit/teal. And the product constellation bears **never** ship in frost white — frost
white is the parent's alone.

## Wordmark type (licensed Adobe kit `sbv5bcv`)

- `RHOBEAR` = **rokkitt 900**, letter-spacing ≈ −0.01em at display sizes.
- `rhobear.ai` line = **droid-sans-mono 400**, teal `#2A8FA8`.
- UI/body around the mark = **lato** 400/600/700.

## Clear space & minimum size

- **Clear space** on all sides = one bear-head width (the glyph's own width). Nothing intrudes.
- **Minimum glyph** = 16px (favicon floor; reads as a bear head, not noise). Below that, don't use.
- **Minimum lockup** = 120px wide, or the `rhobear.ai` line becomes illegible — drop to glyph-only.

## Placement

- **Horizontal lockup**: navigation / headers only.
- **Glyph only**: favicons, app icons, avatars, tight footers, watermarks.
- Do not stretch, rotate, recolor outside the three treatments, add drop-shadows/gradients to
  the glyph, or place the frost mark on a light field (it disappears).
