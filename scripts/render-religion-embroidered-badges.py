#!/usr/bin/env python3
"""Render existing category symbols as sewn, high-resolution vintage textile badges.

The SVG source supplies the symbol/lettering; the image processing gives the
patch a stitched merrow edge, woven cream fabric, and embroidered thread grain.
No place, score, tier or badge identity is changed.
"""
from __future__ import annotations
import io, json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
SIZE = 768
CENTER = SIZE / 2
RIM = 361
INNER_RIM = 337
RNG_SEED = 42110

def artwork(input_path: Path) -> Image.Image:
    data = cairosvg.svg2png(url=str(input_path), output_width=SIZE, output_height=SIZE)
    source = Image.open(io.BytesIO(data)).convert('RGBA')
    px = np.asarray(source).astype(np.float32).copy()
    y, x = np.mgrid[:SIZE, :SIZE]
    rng = np.random.default_rng(RNG_SEED)
    # Two diagonally woven threads, their overlap and fine cotton nap.
    weave = (np.sin((x + y) * (2 * np.pi / 7.5)) * 4.4
             + np.cos((x - y) * (2 * np.pi / 11.0)) * 3.1
             + rng.normal(0, 2.4, (SIZE, SIZE)))
    rgb = px[:, :, :3]
    saturation = np.max(rgb, axis=2) - np.min(rgb, axis=2)
    light = (np.mean(rgb, axis=2) > 170) & (saturation < 105)
    gold = (rgb[:, :, 0] > rgb[:, :, 2] * 1.25) & (rgb[:, :, 0] > 95) & (saturation > 35)
    rgb[:] = np.clip(rgb + (weave * (light * .77 + gold * 1.65))[:, :, None], 0, 255)
    # Slight relief where satin stitch meets pale woven background.
    relief = np.sin((x - y) * (2 * np.pi / 6.0))
    rgb[:] = np.clip(rgb + (relief * gold * 3.5)[:, :, None], 0, 255)
    image = Image.fromarray(px.astype('uint8'), 'RGBA')
    # The yarn-wrapped (merrow) edge is a physical stitch, not a flat ring.
    seam = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(seam)
    for step in range(560):
        angle = 2 * math.pi * step / 560
        c, s = math.cos(angle), math.sin(angle)
        phase = step % 4
        r0 = INNER_RIM + (2 if phase == 1 else 0)
        r1 = RIM - (1 if phase == 2 else 0)
        shade = [(141, 84, 8, 245), (233, 167, 19, 255),
                 (255, 220, 73, 250), (195, 124, 13, 255)][phase]
        draw.line((CENTER + r0*c, CENTER + r0*s,
                   CENTER + r1*c, CENTER + r1*s), fill=shade, width=3)
    draw.ellipse((CENTER - INNER_RIM, CENTER - INNER_RIM,
                  CENTER + INNER_RIM, CENTER + INNER_RIM),
                 outline=(255, 230, 127, 230), width=3)
    # Restrict badge to the cloth patch; transparent beyond sewn rim.
    result = Image.alpha_composite(image, seam)
    mask = Image.new('L', (SIZE, SIZE), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((CENTER-RIM-2, CENTER-RIM-2,CENTER+RIM+2,CENTER+RIM+2),fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(.65))
    old_alpha = np.asarray(result.getchannel('A')).astype(np.uint16)
    mask_a = np.asarray(mask).astype(np.uint16)
    result.putalpha(Image.fromarray(np.uint8(old_alpha * mask_a // 255)))
    return result

def main():
    badge = json.loads((ROOT/'data/badges/religion.json').read_text())
    names = [('Religion', ROOT/'bilder/merker/religion.svg',
              ROOT/'bilder/merker/religion-brodert.webp')]
    names += [(name.capitalize().replace('_', ' '),
               ROOT/path,
               ROOT/'bilder/merker/religion/familie/brodert'/f'{name}.webp')
              for name, path in badge['subBadgeImages'].items()]
    assert len(names) == 9
    preview = Image.new('RGB', (1080, 1180), '#151923')
    draw = ImageDraw.Draw(preview)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 26)
    for i,(name,src,dest) in enumerate(names):
        assert src.exists() and src.suffix == '.svg', str(src)
        output = artwork(src)
        dest.parent.mkdir(parents=True, exist_ok=True)
        output.save(dest, 'WEBP', quality=90, method=6)
        assert dest.stat().st_size > 20000, dest
        thumb = output.resize((315, 315), Image.Resampling.LANCZOS)
        col, row = i % 3, i // 3
        x, y = 26 + col * 358, 18 + row * 379
        preview.paste(thumb, (x+4, y), thumb)
        draw.text((x+8, y+326), name, font=font, fill='#efe9d9')
        print(dest.relative_to(ROOT), dest.stat().st_size)
    destination = ROOT/'out/religion-stitch-preview.png'
    destination.parent.mkdir(exist_ok=True)
    preview.save(destination)
    print('9 sewn badges generated; preview:', destination)
if __name__ == '__main__':
    main()
