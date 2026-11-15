#!/usr/bin/env python3
"""Isolated v5 relief trial for the 20 stored, non-active science v4 translations.

Produces new review-only WebPs and 96/160 px mobile contact sheets under out/.
Never writes a production badge, its registry, or the archived v4 originals.
Final design approval and committed binaries must follow visual comparison.
"""
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out/vitenskap-v5-review"
LANGS = ("en", "es", "pt", "fr")
IDS = (
    "informasjonsteknologi", "matematikk", "forskning_og_metode",
    "astronomi_og_fysikk", "kjemi_og_materialvitenskap",
)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def sha(data):
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "gitBlobSha": hashlib.sha1(
            b"blob " + str(len(data)).encode() + b"\0" + data
        ).hexdigest(),
    }


def make_masks():
    yy, xx = np.mgrid[:1024, :1024]
    x, y = xx.astype(np.float32) - 512, yy.astype(np.float32) - 512
    r = np.hypot(x, y)
    angle = np.degrees(np.arctan2(y, x))
    annulus = (
        ((angle > -150) & (angle < -30) & (r > 359) & (r < 451))
        | ((angle > 28) & (angle < 152) & (r > 356) & (r < 451))
    )
    return xx, yy, x, y, r, annulus


def thread_raised_v5(source):
    original = np.array(source.convert("RGBA"), dtype=np.uint8)
    assert original.shape == (1024, 1024, 4)
    xx, yy, x, y, r, annulus = make_masks()
    rgb = original[:, :, :3].astype(np.float32)
    red, green, blue = rgb[:, :, 0].copy(), rgb[:, :, 1].copy(), rgb[:, :, 2].copy()

    # Preserve the original lettering, center, braided outer rim and transparency.
    # These thresholds segment the existing gold glyphs, not invented text.
    gold = annulus & (red > 122) & (green > 72) & (
        red > green * 1.05
    ) & (green > blue * 1.10) & ((red + green) > 248) & (r > 365) & (r < 440)
    felt = annulus & (red < 122) & (green < 85) & (blue < 140)
    assert int(gold.sum()) > 1000 and int(felt.sum()) > 1000

    # Woven violet threads: two crossing yarn directions plus a deterministic
    # high-frequency fiber grain, all restricted to existing dark fabric.
    warp = np.sin(xx * 2.23 + yy * 0.27)
    weft = np.sin(yy * 2.17 - xx * 0.21)
    fibers = np.sin(xx * 6.13 + yy * 4.31) * 0.8
    textile = 5.3 * warp * weft + 2.7 * warp + 1.7 * weft + fibers
    for channel, strength in enumerate((0.74, 0.48, 1.0)):
        rgb[:, :, channel] = np.where(
            felt, np.clip(rgb[:, :, channel] + textile * strength, 0, 255),
            rgb[:, :, channel],
        )

    # Tightly repeated raised stitches run across the existing gold letter
    # strokes. Direction and phase are fixed; no source geometry is repainted.
    thread = (
        np.sin((xx * 0.83 + yy * 0.40) * (2 * math.pi / 3.15)) * 0.16
        + np.sin((xx * 0.34 - yy * 0.86) * (2 * math.pi / 5.2)) * 0.057
        + np.sin(xx * 6.3 - yy * 2.2) * 0.026
    )
    for channel, strength in enumerate((1.0, 0.94, 0.65)):
        rgb[:, :, channel] = np.where(
            gold,
            np.clip(rgb[:, :, channel] * (1 + thread * strength)
                    + (6 if channel < 2 else 1), 0, 255),
            rgb[:, :, channel],
        )

    # One-pixel highlights and drop-shadows make each original stitch look
    # lifted from the textile. All overlays are constrained to the same bands.
    lit = gold & ~np.roll(gold, (1, 1), axis=(0, 1))
    shaded = gold & ~np.roll(gold, (-1, -1), axis=(0, 1))
    cast = np.roll(gold, (2, 2), axis=(0, 1)) & felt & ~gold & annulus
    for channel, hi, lo, drop in ((0, 23, 17, 24), (1, 22, 16, 17), (2, 14, 10, 28)):
        layer = rgb[:, :, channel]
        layer = np.where(lit, np.minimum(255, layer + hi), layer)
        layer = np.where(shaded, np.maximum(0, layer - lo), layer)
        layer = np.where(cast, np.maximum(0, layer - drop), layer)
        rgb[:, :, channel] = layer

    out = original.copy()
    out[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    changes = np.any(out[:, :, :3] != original[:, :, :3], axis=2)
    assert not changes[~annulus].any(), "Modification outside text-band rings"
    assert np.array_equal(out[:, :, 3], original[:, :, 3])
    assert np.array_equal(out[280:744, 280:744], original[280:744, 280:744])
    assert int(changes.sum()) > 10_000
    return Image.fromarray(out, "RGBA"), {
        "goldPixels": int(gold.sum()),
        "wovenFeltPixels": int(felt.sum()),
        "modifiedPixelsInBands": int(changes.sum()),
        "outsideBandChangesBeforeEncoding": 0,
        "sourceAlphaIdentical": True,
        "centralArtworkIdenticalBeforeEncoding": True,
    }


def render_sheet(rows, by_key):
    # Real 96px and 160px badge sizes, including the unmodified v4 beside v5.
    w, h = 1640, 1730
    image = Image.new("RGB", (w, h), (16, 19, 31))
    pen = ImageDraw.Draw(image)
    f24 = ImageFont.truetype(FONT, 24)
    f16 = ImageFont.truetype(FONT, 16)
    f12 = ImageFont.truetype(FONT, 12)
    pen.text((22, 15), "VITENSKAP – V5 THREAD RELIEF • VISUAL REVIEW ONLY", font=f24, fill="white")
    pen.text((22, 47), "Each cell: original v4 (left), candidate v5 (right). 160px and 96px. Not active.", font=f16, fill="#c2cada")
    for j, language in enumerate(LANGS):
        pen.text((22 + 409 * j, 83), language.upper(), font=f24, fill="#e6c77c")
    for i, badge in enumerate(IDS):
        y = 123 + i * 314
        pen.text((22, y), badge.replace("_", " ").upper(), font=f16, fill="#f2e5c4")
        for j, lang in enumerate(LANGS):
            x = 22 + j * 409
            record = by_key[(badge, lang)]
            before = ROOT / record["source"]
            after = OUT / record["previewFile"]
            with Image.open(before) as img:
                a = img.convert("RGBA")
            with Image.open(after) as img:
                b = img.convert("RGBA")
            for p, thumb, size in (
                (x, a, 160), (x + 190, b, 160),
                (x + 45, a, 96), (x + 232, b, 96),
            ):
                top = y + (28 if size == 160 else 192)
                t = thumb.resize((size, size), Image.Resampling.LANCZOS)
                image.paste(t, (p, top), t)
            pen.text((x + 50, y + 184), "v4", fill="#c1c6d4", font=f12)
            pen.text((x + 239, y + 184), "v5 candidate", fill="#c1c6d4", font=f12)
    outfile = OUT / "mobile-96-160-v4-v5-comparison.jpg"
    image.save(outfile, "JPEG", quality=90, optimize=True)
    return outfile.relative_to(OUT).as_posix()


def main():
    v4 = read("data/badges/vitenskap_v4_remaining_four_locales_20261112.json")
    research = read("data/badges/vitenskap_forskning_v4_embroidered_candidates_20261112.json")
    active = read("data/badges/vitenskap.json")
    assert len(active["subBadgeImages"]) == 16
    all_items = v4["items"] + [
        dict(item, id="forskning_og_metode") for item in research["items"]
    ]
    assert len(all_items) == 20
    assert {(r["id"], r["locale"]) for r in all_items} == {
        (id_, lang) for id_ in IDS for lang in LANGS
    }
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []
    for item in all_items:
        src = ROOT / item["path"]
        original_bytes = src.read_bytes()
        assert sha(original_bytes)["sha256"] == item["sha256"]
        assert sha(original_bytes)["gitBlobSha"] == item["gitBlobSha"]
        assert not item["path"] in active["subBadgeImages"].values()
        with Image.open(src) as im:
            before = im.convert("RGBA")
        after, metrics = thread_raised_v5(before)
        rel = f'{item["locale"]}/{item["id"]}-v5-broderi.webp'
        dst = OUT / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        after.save(dst, "WEBP", quality=97, method=6)
        with Image.open(dst) as im:
            decoded = im.convert("RGBA")
        assert np.array_equal(
            np.asarray(before)[:, :, 3], np.asarray(decoded)[:, :, 3]
        ), rel
        difference = np.abs(
            np.asarray(before)[280:744, 280:744, :3].astype(np.int16)
            - np.asarray(decoded)[280:744, 280:744, :3].astype(np.int16)
        )
        assert float(difference.mean()) < 6.0, rel
        assert float(np.percentile(difference, 99)) < 38, rel
        rows.append({
            "id": item["id"], "locale": item["locale"],
            "source": item["path"], "sourceGitBlobSha": item["gitBlobSha"],
            "previewFile": rel, **sha(dst.read_bytes()),
            "metrics": metrics,
            "centerMeanCodecDifference": round(float(difference.mean()), 3),
            "status": "candidate_not_approved_not_active",
        })
        print("rendered", rel, rows[-1]["bytes"])
    lookup = {(row["id"], row["locale"]): row for row in rows}
    sheet = render_sheet(rows, lookup)
    summary = {
        "schemaVersion": 1,
        "status": "v5_preview_unapproved_nonactive",
        "sourceCandidateCount": 20,
        "existingActiveUnderbadgesPreserved": True,
        "norwegianOriginalsPreserved": True,
        "cartographyAndPlaceCardUntouched": True,
        "contactSheet": sheet,
        "items": rows,
    }
    (OUT / "manifest.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf8"
    )
    print("all 20 previews generated; active files and registries unchanged")


if __name__ == "__main__":
    main()
