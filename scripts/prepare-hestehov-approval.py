#!/usr/bin/env python3
"""Prepare a transparent Hestehov candidate for *visual* review, not automatic approval.

Original art is retained in b03. The output must be examined against real
Tussilago farfara photographs before it is added to the publication registry.
"""
from collections import deque
from pathlib import Path
import json

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "bilder/natur/flora/illustrasjonskandidater/b03/01_hestehov_var.webp"
DEST = ROOT / "bilder/natur/flora/godkjenningskandidater/hestehov_var_clean.webp"
REPORT = ROOT / "data/natur/flora/hestehov-cleanup-report.json"

im = Image.open(SOURCE).convert("RGBA")
width, height = im.size
px = im.load()

def unwanted_edge_pixel(x, y):
    r, g, b, a = px[x, y]
    if a < 4:
        return False
    # Non-botanical grey/white backdrop at the border. Stay away from
    # grey hairs inside the specimen; this is an EDGE-CONNECTED cleanup only.
    grey_backdrop = min(r, g, b) > 145 and max(r, g, b) - min(r, g, b) < 24
    # Stray green sliver in the image's far-right margin, above the root zone.
    stray_green = x >= width - 18 and y < int(height * 0.77) and g > r * 1.22 and g > b * 1.15
    return grey_backdrop or stray_green

visited = bytearray(width * height)
queue = deque()
for x in range(width):
    queue.append((x, 0))
    queue.append((x, height - 1))
for y in range(height):
    queue.append((0, y))
    queue.append((width - 1, y))

removed = 0
while queue:
    x, y = queue.popleft()
    index = y * width + x
    if visited[index]:
        continue
    visited[index] = 1
    if not unwanted_edge_pixel(x, y):
        continue
    r, g, b, a = px[x, y]
    px[x, y] = (r, g, b, 0)
    removed += 1
    for xx, yy in ((x-1,y), (x+1,y), (x,y-1), (x,y+1)):
        if 0 <= xx < width and 0 <= yy < height and not visited[yy * width + xx]:
            queue.append((xx, yy))

# Only remove the documented edge contamination; do not erase internal
# petals, hairs, scales, roots or other botanical features automatically.
DEST.parent.mkdir(parents=True, exist_ok=True)
im.save(DEST, format="WEBP", quality=98, method=6, exact=True)
out = Image.open(DEST).convert("RGBA")
alpha = out.getchannel("A")
bbox = alpha.getbbox()
assert bbox is not None, "The botanical specimen disappeared"
assert alpha.getextrema()[0] == 0, "The image lacks transparency"
assert width >= 650 and height >= 850
report = {
    "species": "Tussilago farfara",
    "source": str(SOURCE.relative_to(ROOT)),
    "preparedCandidate": str(DEST.relative_to(ROOT)),
    "status": "needs_visual_acceptance",
    "size": [width, height],
    "cleanedEdgePixels": removed,
    "subjectBoundingBox": list(bbox),
    "alphaMinMax": list(alpha.getextrema()),
    "note": "Automatisk rens er ikke en artsfaglig eller visuell godkjenning. Kontroller også sort bakgrunn på mobil og desktop.",
}
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
print(json.dumps(report, ensure_ascii=False))
