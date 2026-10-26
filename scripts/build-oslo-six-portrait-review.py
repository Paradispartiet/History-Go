#!/usr/bin/env python3
"""Build UNPUBLISHED standing frontImage review candidates from ORIGINAL Commons JPEGs.

Never derive frontImage from a landscape lead/card/popup derivative. History Go's
PLACE_PRODUCTION_MINIMUM_V1 requires a separate, genuine portrait photo file
from the licensed source. Crops are review candidates only, never runtime assets.
"""
from __future__ import annotations

import hashlib
import io
import json
import sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CREDITS = ROOT / "reports/place-production/oslo-six-generated-image-attribution-20261022.json"
SHORTLIST = ROOT / "reports/place-production/oslo-six-image-rights-shortlist-20261022.json"
OUT = ROOT / "tmp/oslo-six-portrait-review"
WIDTH, HEIGHT = 900, 1350
MAX_BYTES = 24 * 1024 * 1024
EXPECTED_IDS = {
    "linderud_gard", "ekebergrestauranten", "frognerseteren",
    "sarabraten", "saeterhytten_bygdoy",
}
# Two distinct framing proposals from the original photo, not two artificial
# letterbox/blur composites. Neither is automatically an approved composition.
# All five source photographs are landscape, whereas the portrait crop is 2:3.
# Pillow's centering tuple is (horizontal, vertical), so changing only y
# yielded two byte-identical variants. Shift x to give reviewers a real choice.
# These are candidates, not approved frontImage crops.
CENTERS = {
    "linderud_gard": (0.35, 0.50),
    "ekebergrestauranten": (0.36, 0.50),
    "frognerseteren": (0.65, 0.50),
    "sarabraten": (0.66, 0.50),
    "saeterhytten_bygdoy": (0.36, 0.50),
}
USER_AGENT = "HistoryGo-PlacePhotoQA/1.1 (https://github.com/Paradispartiet/History-Go)"


def sha1_base36(data: bytes) -> str:
    n = int.from_bytes(hashlib.sha1(data).digest(), "big")
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while n:
        n, rem = divmod(n, 36)
        out = digits[rem] + out
    return out.rjust(31, "0")


def validated_original_bytes(place: dict, lead: dict) -> bytes:
    url = place["source_download_url"]
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "upload.wikimedia.org" or not parsed.path.endswith((".jpg", ".JPG", ".jpeg", ".JPEG")):
        raise RuntimeError("Unapproved original-photo download URL: " + place["place_id"])
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "image/jpeg"})
    with urlopen(req, timeout=55) as response:
        mimetype = response.headers.get("Content-Type", "").split(";")[0].strip()
        if mimetype != "image/jpeg":
            raise RuntimeError("Expected JPEG original: " + place["place_id"])
        data = response.read(MAX_BYTES + 1)
    if len(data) <= 12000 or len(data) > MAX_BYTES:
        raise RuntimeError("Unexpected original JPEG size: " + place["place_id"])
    actual = {
        hashlib.sha1(data).hexdigest().lstrip("0"),
        sha1_base36(data).lstrip("0"),
    }
    expected = place["original_sha1_base36"].lower().lstrip("0")
    if expected not in actual:
        raise RuntimeError("Original Commons SHA-1 changed: " + place["place_id"])
    if lead["page"] != place["source_page"] or lead["author"] != place["author"] or lead["license"] != place["license"]:
        raise RuntimeError("Original Commons attribution differs from checked lead: " + place["place_id"])
    return data


def original_portrait(original: Image.Image, center: tuple[float, float]) -> Image.Image:
    return ImageOps.fit(
        original, (WIDTH, HEIGHT),
        method=Image.Resampling.LANCZOS,
        centering=center,
    )


def write_contact_sheet(thumbs: list[tuple[str, str, Image.Image]]) -> Path:
    w, h = 270, 405
    gutter, label_h = 14, 40
    canvas = Image.new("RGB", (2 * (w + gutter) + gutter, 5 * (h + label_h + gutter) + gutter), "#121820")
    draw = ImageDraw.Draw(canvas)
    for index, (name, method, frame) in enumerate(thumbs):
        x = gutter + (index % 2) * (w + gutter)
        y = gutter + (index // 2) * (h + label_h + gutter)
        canvas.paste(ImageOps.contain(frame, (w, h)), (x, y))
        draw.text((x, y + h + 8), (name + " | " + method)[:40], fill="#ffffff")
    contact = OUT / "portrait-contact-sheet.jpg"
    canvas.save(contact, "JPEG", quality=85)
    return contact


def self_test() -> None:
    sample = Image.new("RGB", (1800, 1200), "#4b5648")
    # Introduce a distinctive pattern so horizontal displacement is measurable.
    draw = ImageDraw.Draw(sample)
    draw.rectangle((0, 0, 450, 1199), fill="#f03020")
    draw.rectangle((1350, 0, 1799, 1199), fill="#2050f0")
    a = original_portrait(sample, (0.5, 0.5))
    b = original_portrait(sample, (0.30, 0.5))
    assert a.size == (WIDTH, HEIGHT) and b.size == (WIDTH, HEIGHT)
    assert a.height > a.width
    assert a.tobytes() != b.tobytes(), "Shifting the horizontal crop must change pixels"
    assert sha1_base36(b"source-check") == sha1_base36(b"source-check")
    print("Source-original portrait crop orientation and distinctness passed self-test")


def main() -> None:
    credits = json.loads(CREDITS.read_text(encoding="utf-8"))
    shortlist = json.loads(SHORTLIST.read_text(encoding="utf-8"))
    sources = {p["place_id"]: p["lead_candidate"] for p in shortlist["places"]}
    if {p["place_id"] for p in credits["places"]} != EXPECTED_IDS:
        raise RuntimeError("Exactly five independently licensed original photographs expected")
    if len(credits["places"]) != 5 or set(sources) != EXPECTED_IDS | {"kristiania_teglverk_bryn"}:
        raise RuntimeError("Image-source identity set changed")
    if sources["kristiania_teglverk_bryn"] is not None:
        raise RuntimeError("Teglverk identity HOLD cannot be bypassed with another source photo")
    OUT.mkdir(parents=True, exist_ok=True)
    candidates = []
    thumbs = []
    for place in credits["places"]:
        pid = place["place_id"]
        lead = sources[pid]
        if not lead:
            raise RuntimeError("Missing licensed source for " + pid)
        image_bytes = validated_original_bytes(place, lead)
        with Image.open(io.BytesIO(image_bytes)) as decoded:
            if decoded.format != "JPEG":
                raise RuntimeError("Not an original JPEG: " + pid)
            decoded.load()
            original = ImageOps.exif_transpose(decoded).convert("RGB")
        if list(original.size) != lead["original_dimensions"]:
            raise RuntimeError("Original JPEG geometry differs from source review: " + pid)
        for mode, center in (("center_original", (0.50, 0.50)), ("offset_original", CENTERS[pid])):
            frame = original_portrait(original, center)
            target = OUT / (pid + "__frontImage_candidate__" + mode + ".webp")
            frame.save(target, "WEBP", quality=86, method=6)
            with Image.open(target) as check:
                if check.size != (WIDTH, HEIGHT) or check.height <= check.width:
                    raise RuntimeError("Invalid standing photo: " + pid)
            candidates.append({
                "place_id": pid,
                "mode": mode,
                "source_provenance": "VERIFIED_ORIGINAL_COMMONS_JPEG",
                "derived_from_lead_or_card_image": False,
                "cropping": "original JPEG EXIF transpose; LANCZOS fit; centering=" + str(center),
                "original_sha1": place["original_sha1_base36"],
                "source_original_dimensions": list(original.size),
                "path": target.relative_to(ROOT).as_posix(),
                "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                "width": WIDTH, "height": HEIGHT,
                "source_page": place["source_page"],
                "author": place["author"],
                "license": place["license"],
                "license_url": place["license_url"],
                "visually_approved": False,
                "runtime_registered": False,
            })
            thumbs.append((pid, mode.replace("_original", ""), frame))
    report = {
        "schema": "history_go_oslo_six_frontimage_review_candidates_v2",
        "status": "ORIGINAL_SOURCE_CROPS_ARTIFACT_ONLY_VISUAL_REVIEW_REQUIRED",
        "note": "10 actual standing photo crops created independently from original JPEGs. Do not copy to active frontImage without site-specific visual/attribution QA.",
        "count": len(candidates),
        "place_count": 5,
        "pair_distinct_sha256": True,
        "candidates": candidates,
    }
    if len(candidates) != 10:
        raise RuntimeError("Expected two original-photo portrait crops per place")
    for pid in EXPECTED_IDS:
        pair = [x for x in candidates if x["place_id"] == pid]
        if len(pair) != 2 or pair[0]["sha256"] == pair[1]["sha256"]:
            raise RuntimeError("Portrait candidates must show distinct pixels: " + pid)
    contact = write_contact_sheet(thumbs)
    (OUT / "review.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("Prepared", len(candidates), "standing ORIGINAL-source WebP candidates and", contact.name, "for manual QA. Zero live Place bindings.")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    else:
        main()
