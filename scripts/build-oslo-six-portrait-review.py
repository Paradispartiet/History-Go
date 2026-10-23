#!/usr/bin/env python3
"""Prepare strictly UNPUBLISHED portrait candidates for five Oslo PlaceCards.

Uses only the fifteen already credited and source-checked landscape WebPs.
Creates two portrait approaches per site for human visual selection:
1. centered crop (may cut historical subjects);
2. uncropped foreground against a blurred image-derived background.
Neither is automatically valid for frontImage until separately reviewed,
checked into the repo and registered with visible attribution.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CREDITS = ROOT / "reports/place-production/oslo-six-generated-image-attribution-20261022.json"
OUT = ROOT / "tmp/oslo-six-portrait-review"
WIDTH, HEIGHT = 800, 1000
EXPECTED_IDS = {
    "linderud_gard", "ekebergrestauranten", "frognerseteren",
    "sarabraten", "saeterhytten_bygdoy",
}


def main() -> None:
    credits = json.loads(CREDITS.read_text(encoding="utf-8"))
    if {p["place_id"] for p in credits["places"]} != EXPECTED_IDS:
        raise RuntimeError("Unexpected or incomplete source photograph list")
    OUT.mkdir(parents=True, exist_ok=True)
    candidates = []
    for place in credits["places"]:
        pid = place["place_id"]
        lead = next(v for v in place["variants"] if v["role"] == "lead")
        source = ROOT / lead["path"]
        original = source.read_bytes()
        if hashlib.sha256(original).hexdigest() != lead["sha256"]:
            raise RuntimeError(f"Input photo checksum changed: {pid}")
        with Image.open(source) as img:
            image = img.convert("RGB")
        if image.size != (1600, 900):
            raise RuntimeError(f"Unexpected lead image geometry: {pid}")
        close = ImageOps.fit(
            image, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5)
        )
        background = close.filter(ImageFilter.GaussianBlur(24))
        foreground = ImageOps.contain(
            image, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS
        )
        background.paste(
            foreground, ((WIDTH - foreground.width)//2, (HEIGHT - foreground.height)//2)
        )
        modes = {"center_crop": close, "full_subject_blurred_backdrop": background}
        for mode, candidate in modes.items():
            path = OUT / (pid + "__frontImage_candidate__" + mode + ".webp")
            candidate.save(path, "WEBP", quality=86, method=6)
            with Image.open(path) as encoded:
                if encoded.size != (WIDTH, HEIGHT) or encoded.height <= encoded.width:
                    raise RuntimeError(f"Invalid portrait output: {path}")
            candidates.append({
                "place_id": pid, "mode": mode,
                "path": path.relative_to(ROOT).as_posix(),
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "width": WIDTH, "height": HEIGHT,
                "source_page": place["source_page"],
                "author": place["author"],
                "license": place["license"],
                "license_url": place["license_url"],
                "source_lead_sha256": lead["sha256"],
                "visually_approved": False,
                "runtime_registered": False,
            })
    report = {
        "schema": "history_go_oslo_six_frontimage_review_candidates_v1",
        "status": "ARTIFACT_ONLY_VISUAL_SELECTION_REQUIRED_NO_RUNTIME_REGISTRATION",
        "note": "Portrait image dimensions do not prove usable building/ruin framing.",
        "candidates": candidates,
    }
    (OUT / "review.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    if len(candidates) != 10:
        raise RuntimeError("Exactly ten portrait candidates required")
    print("Generated 10 UNPUBLISHED portrait candidates, two per place; awaiting visual review.")


if __name__ == "__main__":
    main()
