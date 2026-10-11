"""
Convert white-background product photos into transparent WebP cutouts.

  pip install rembg pillow
  python scripts/remove-bg.py img/p public/images/cutouts

Fallback: if you skip this, the site places white-bg photos on tinted tiles
with CSS `mix-blend-mode: multiply` (class .blend) so white disappears.
"""
import sys, pathlib
from PIL import Image
from rembg import remove, new_session

src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "img/p")
dst = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "public/images/cutouts")
dst.mkdir(parents=True, exist_ok=True)
session = new_session("isnet-general-use")

for f in sorted(src.glob("*.jp*g")) + sorted(src.glob("*.png")):
    img = Image.open(f).convert("RGBA")
    out = remove(img, session=session, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    # pad to square, min 1000px for product slots
    side = max(out.size + (1000,))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.width) // 2, (side - out.height) // 2), out)
    target = dst / (f.stem + ".webp")
    canvas.save(target, "WEBP", quality=88, method=6)
    print("✓", target)
