#!/usr/bin/env python3
"""Produce a physical, sourced Oslo tinghus portrait from the canonical local photo.

This changes only the Tinghus canonical Place source and adds its own physical
WebP. It does not approve v1, alter the Quiz/QuizCard or touch Oslo-bolk 04.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PLACE = ROOT / "data/places/politikk/oslo/places_politikk/tinghuset.json"
OUT = ROOT / "bilder/places/tinghuset_front_portrait.webp"
EXPECTED_SOURCE_PAGE = "https://commons.wikimedia.org/wiki/File:Oslo_tinghus.jpg"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    place = json.loads(PLACE.read_text(encoding="utf-8"))
    if place.get("id") != "tinghuset":
        raise ValueError("Script must only modify the Oslo tinghus record")

    image_meta = place.get("imageMeta") or {}
    if image_meta.get("sourceUrl") != EXPECTED_SOURCE_PAGE:
        raise ValueError("Unexpected licensed source: manual review required")
    if image_meta.get("license") != "Public domain" or image_meta.get("author") != "Mahlum":
        raise ValueError("Public-domain ownership and original author need verification")

    source = ROOT / place["image"]
    if not source.exists() or source.suffix.lower() not in (".jpg", ".jpeg"):
        raise ValueError("Referenced local Oslo tinghus photo is missing")

    with Image.open(source) as existing:
        im = ImageOps.exif_transpose(existing).convert("RGB")
        source_size = im.size
        if source_size[0] < 900 or source_size[1] < 600:
            raise ValueError("Existing source image too small for faithful crop")
        portrait = ImageOps.fit(
            im, (900, 1200), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5)
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    portrait.save(OUT, format="WEBP", quality=88, method=6)
    with Image.open(OUT) as check:
        if check.format != "WEBP" or check.size != (900, 1200):
            raise ValueError("Portrait output mismatch")
    if OUT.stat().st_size < 20_000:
        raise ValueError("Portrait output implausibly small")

    place["frontImage"] = str(OUT.relative_to(ROOT)).replace("\\", "/")
    place["frontImageMeta"] = {
        "source": "existing_documented_commons_place_photo",
        "sourcePage": EXPECTED_SOURCE_PAGE,
        "sourceLocalAsset": place["image"],
        "creator": "Mahlum",
        "credit": "Mahlum / Wikimedia Commons",
        "license": "Public domain",
        "originalLocalDimensions": f"{source_size[0]}x{source_size[1]}",
        "outputDimensions": "900x1200",
        "orientation": "portrait",
        "aspectRatio": "3:4",
        "sourceLocalSha256": digest(source),
        "outputSha256": digest(OUT),
        "assetType": "documentary_place_photo",
        "transformation": "Stedstro 3:4-utsnitt fra kildeklarert lokalt fotografi; ingen generativ endring.",
        "reviewStatus": "pending_editorial_crop_review",
        "verifiedAt": "2026-10-22",
    }
    place.setdefault("imageComposition", {})["portraitPosition"] = "50% 50%"
    PLACE.write_text(json.dumps(place, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OSLO_TINGHUS_PORTRAIT", place["frontImage"], digest(OUT))


if __name__ == "__main__":
    main()
