#!/usr/bin/env python3
"""Generate 16 non-active science v6 candidates with full, larger, two-line headings.
Retain each v5 badge's original middle art, bottom parent name, laurels,
woven purple rim and alpha. NEVER write into the active badge paths.
"""
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out/vitenskap-v6-typography"
FONT = Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf")
SPLITS = {
    "informasjonsteknologi": {
        "en": ("INFORMATION", "TECHNOLOGY"),
        "es": ("TECNOLOGÍA DE", "LA INFORMACIÓN"),
        "pt": ("TECNOLOGIA DA", "INFORMAÇÃO"),
        "fr": ("TECHNOLOGIE DE", "L’INFORMATION"),
    },
    "forskning_og_metode": {
        "en": ("RESEARCH AND", "METHODS"),
        "es": ("INVESTIGACIÓN Y", "METODOLOGÍA"),
        "pt": ("PESQUISA E", "METODOLOGIA"),
        "fr": ("RECHERCHE ET", "MÉTHODOLOGIE"),
    },
    "astronomi_og_fysikk": {
        "en": ("ASTRONOMY AND", "PHYSICS"),
        "es": ("ASTRONOMÍA Y", "FÍSICA"),
        "pt": ("ASTRONOMIA E", "FÍSICA"),
        "fr": ("ASTRONOMIE ET", "PHYSIQUE"),
    },
    "kjemi_og_materialvitenskap": {
        "en": ("CHEMISTRY AND", "MATERIALS SCIENCE"),
        "es": ("QUÍMICA Y CIENCIA", "DE MATERIALES"),
        "pt": ("QUÍMICA E CIÊNCIA", "DOS MATERIAIS"),
        "fr": ("CHIMIE ET", "SCIENCE DES MATÉRIAUX"),
    },
}

def read_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf8"))

def digest(data):
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "gitBlobSha": hashlib.sha1(
            b"blob " + str(len(data)).encode() + b"\0" + data
        ).hexdigest(),
    }

def lay_felt(original):
    src = np.asarray(original.convert("RGBA"), dtype=np.uint8)
    yy, xx = np.mgrid[:1024, :1024]
    dx = xx - 512
    y_out = 512 - np.sqrt(np.maximum(0, 470 ** 2 - dx ** 2))
    y_in = 262 + np.abs(dx) * 0.14
    band = (np.abs(dx) < 420) & (yy > y_out) & (yy < y_in)
    feather = Image.fromarray(np.uint8(band) * 255, "L").filter(ImageFilter.GaussianBlur(3))
    alpha = np.asarray(feather).astype(np.float32) / 255.0
    weave = (
        np.sin(xx * 2.9 + yy * 1.1) * 1.6
        + np.sin(xx * 0.83 - yy * 1.2) * 2.4
        + np.cos(xx * 0.13 + yy * 0.47) * 3.2
    )
    light = 9 * (1 - np.minimum(1, np.abs(dx) / 420))
    colors = np.stack((
        30 + weave * .9 + light * .15,
        13 + weave * .5 + light * .15,
        51 + weave * 1.3 + light * .15,
    ), axis=-1)
    result = src.copy()
    aa = alpha[:, :, None]
    result[:, :, :3] = np.clip(
        src[:, :, :3] * (1-aa) + colors * aa, 0, 255
    ).astype(np.uint8)
    image = Image.fromarray(result, "RGBA")
    pen = ImageDraw.Draw(image)
    edge = [(x, round(262 + abs(x-512) * .14)) for x in range(97, 927)]
    pen.line([(x, y+5) for x, y in edge], fill=(85, 25, 103, 255), width=6, joint="curve")
    pen.line(edge, fill=(242, 181, 70, 255), width=3, joint="curve")
    return image

def render_stitched_text(layer, text, baseline, max_size, steep):
    size = max_size
    font = ImageFont.truetype(str(FONT), size)
    while font.getlength(text) > 710 and size > 36:
        size -= 1
        font = ImageFont.truetype(str(FONT), size)
    assert font.getlength(text) <= 711, (text, size)
    widths = [font.getlength(ch) for ch in text]
    x = 512 - sum(widths) / 2
    curve = .00034 if steep else .00013
    for ch, width in zip(text, widths):
        cx = x + width / 2
        x += width
        if ch == " ":
            continue
        dx = cx - 512
        cy = baseline + curve * dx * dx
        rotation = -math.degrees(math.atan(2 * curve * dx))
        tile = Image.new("RGBA", (size*3, size*3), (0, 0, 0, 0))
        draw = ImageDraw.Draw(tile)
        draw.text((size*1.5+1, size*1.55+2), ch, font=font, anchor="mm",
                  fill=(56, 20, 20, 230), stroke_width=2,
                  stroke_fill=(35, 11, 21, 255))
        draw.text((size*1.5, size*1.54), ch, font=font, anchor="mm",
                  fill=(252, 202, 91, 255), stroke_width=1,
                  stroke_fill=(140, 74, 23, 255))
        tile = tile.rotate(rotation, expand=True, resample=Image.Resampling.BICUBIC)
        layer.alpha_composite(tile, (
            round(cx - tile.width / 2), round(cy - tile.height / 2)
        ))
    return size

def revise(src, words):
    original = src.convert("RGBA")
    result = lay_felt(original)
    lettering = Image.new("RGBA", original.size, (0, 0, 0, 0))
    size1 = render_stitched_text(lettering, words[0], 143, 68, True)
    size2 = render_stitched_text(lettering, words[1], 219, 57, False)
    result.alpha_composite(lettering)
    before = np.asarray(original)
    after = np.asarray(result)
    assert np.array_equal(before[:, :, 3], after[:, :, 3]), "Alpha altered"
    assert np.array_equal(before[345:, :, :], after[345:, :, :]), "Footer or center art altered"
    assert np.array_equal(before[:, :65, :], after[:, :65, :]), "Left rim altered"
    assert np.array_equal(before[:, 959:, :], after[:, 959:, :]), "Right rim altered"
    return result, {
        "firstLineSize": size1,
        "secondLineSize": size2,
        "alphaBeforeEncodingIdentical": True,
        "lowerArtBeforeEncodingIdentical": True,
    }

def make_contact(rows):
    canvas = Image.new("RGB", (1700, 1460), (16, 17, 31))
    pen = ImageDraw.Draw(canvas)
    big = ImageFont.truetype(str(FONT), 19)
    small = ImageFont.truetype(str(FONT), 13)
    pen.text((15, 12), "VITENSKAP v6: STORRE SKRIFT – UTKAST", font=big, fill="white")
    pen.text((15, 45), "V5 original (venstre), v6 kandidat (hoyre). 160 px og 96 px.", font=small, fill="#d3c4ea")
    for col, locale in enumerate(("en", "es", "pt", "fr")):
        pen.text((25 + 420 * col, 85), locale.upper(), font=big, fill="#ffd887")
    for row_num, topic in enumerate(SPLITS):
        y = 135 + row_num * 330
        pen.text((15, y - 29), topic.replace("_", " ").upper(), font=small, fill="white")
        for col, locale in enumerate(("en", "es", "pt", "fr")):
            row = next(it for it in rows if (it["id"], it["locale"]) == (topic, locale))
            a = Image.open(ROOT / row["source"]).convert("RGBA")
            b = Image.open(OUT / row["previewFile"]).convert("RGBA")
            x = 15 + 420 * col
            for im, xpos, ypos, size in (
                (a, x, y, 160), (b, x+190, y, 160),
                (a, x+40, y+182, 96), (b, x+240, y+182, 96)
            ):
                thumb = im.resize((size, size), Image.Resampling.LANCZOS)
                canvas.paste(thumb, (xpos, ypos), thumb)
            pen.text((x+50, y+163), "v5", font=small, fill="white")
            pen.text((x+235, y+163), "v6", font=small, fill="white")
    outfile = OUT / "contact-v5-v6-160-96.jpg"
    canvas.save(outfile, quality=92, optimize=True)
    return outfile

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    v5 = read_json("data/badges/vitenskap_v5_candidates_20261112.json")
    translations = read_json("data/badges/vitenskap_v2_localization_20261112.json")
    active = read_json("data/badges/vitenskap.json")
    assert len(v5["items"]) == 20
    assert len(active["subBadgeImages"]) == 16
    originals = {(it["id"], it["locale"]):it for it in v5["items"]}
    specs = {it["id"]:it["variants"] for it in translations["items"]}
    output = []
    for topic, languages in SPLITS.items():
        for locale, words in languages.items():
            src = originals[(topic, locale)]
            assert " ".join(words) == specs[topic][locale]["heading"], (
                topic, locale, words, specs[topic][locale]["heading"]
            )
            data = (ROOT / src["path"]).read_bytes()
            assert digest(data)["sha256"] == src["sha256"]
            assert src["path"] not in active["subBadgeImages"].values()
            with Image.open(ROOT / src["path"]) as original:
                new, metrics = revise(original, words)
            rel = f"{locale}/{topic}-v6-two-line.webp"
            path = OUT / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            new.save(path, "WEBP", quality=94, method=4)
            with Image.open(path) as verify:
                assert verify.size == (1024, 1024) and verify.mode == "RGBA"
            output.append({
                "id": topic, "locale": locale, "title": specs[topic][locale]["heading"],
                "footer": specs[topic][locale]["footer"],
                "split": list(words), "source": src["path"], "sourceSHA256": src["sha256"],
                "previewFile": rel, "status": "v6_unapproved_nonactive",
                **digest(path.read_bytes()), **metrics,
            })
            print("v6", rel, metrics, flush=True)
    assert len(output) == 16
    sheet = make_contact(output)
    summary = {
        "schemaVersion": 1,
        "categoryId": "vitenskap",
        "status": "16_typography_v6_candidates_unapproved_nonactive",
        "oldBadgeFilesPreserved": True,
        "activeRegisterUnchanged": True,
        "norwegianV2OriginalsPreserved": True,
        "mathematicsV5Unchanged": True,
        "completeParentCategoryNameRetainedInArtwork": True,
        "sheet": "contact-v5-v6-160-96.jpg",
        "sheetSHA256": digest(sheet.read_bytes())["sha256"],
        "items": output,
    }
    (OUT / "manifest.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2)+"\n", encoding="utf8")
    print("16 v6 visual candidates and contact sheet ready; active images unchanged")

if __name__ == "__main__":
    main()
