# Premium licensed icon sets — vector SVG (owner's Adobe Stock licenses)

Converted from the owner's `.ai` files 2026-07-16 for inline-SVG use per PREMIUM-UI-LAW
(no Lucide/emoji defaults — use these).

- **`pmyls-icons.svg`** — the **"32 NLP & Chatbots Premium Line Icons"** set as clean vector
  (145 paths, viewBox `0 0 612 792`). The chat/NLP/mic/lock/robot/megaphone line glyphs. THE set
  for chat + companion + NLP controls. (Source `.ai`: `Downloads\AdobeStock_2075737874*.ai`.)
- **`deluxe-216-icons.svg`** — the **216 Deluxe Visual Icons** sheet as vector (broad coverage:
  IT, IoT, cloud, business). (Source `.ai`: `Downloads\AdobeStock_1841601653*.ai`.)

Each is the whole SHEET as one SVG. To use a single icon: open in a vector editor or slice by the
grid `<g>`/path bounds, pull the paths, inline as a `<svg viewBox=...>` tinted via `currentColor`.

## No-admin .ai → SVG conversion (Inkscape not required)
The `.ai` are pure EPS/PostScript (PyMuPDF alone can't open them). Chain Ghostscript → PyMuPDF:
```
gswin64c -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -o out.pdf "input.ai"   # EPS/AI → PDF
python -c "import fitz;open('out.svg','w',encoding='utf-8').write(fitz.open('out.pdf')[0].get_svg_image())"
```
Ghostscript at `C:\Program Files\gs\gs10.07.1\bin\gswin64c.exe`; `pip install pymupdf`. Use explicit
Windows paths for BOTH (GS is a Windows exe — git-bash `/tmp` mismatches PyMuPDF).
