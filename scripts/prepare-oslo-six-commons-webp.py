#!/usr/bin/env python3
"""Prepare, but DO NOT publish, 4 source-checked Commons place image triplets.

The file license, dimensions and SHA-1 come from MediaWiki imageinfo.
Every output remains an editorially unapproved, central-cropped WebP.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path
from urllib.parse import unquote, urlparse, urlencode
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SHORTLIST = ROOT / "reports/place-production/oslo-six-image-rights-shortlist-20261022.json"
OUT = ROOT / "bilder/places/auto"
ATTRIBUTION = ROOT / "reports/place-production/oslo-six-generated-image-attribution-20261022.json"
APPROVED_IDS = ("linderud_gard", "ekebergrestauranten", "frognerseteren", "sarabraten", "saeterhytten_bygdoy")
USER_AGENT = "HistoryGo-ImageQA/1.0 (https://github.com/Paradispartiet/History-Go; Commons author credit preserved)"
MAX_INPUT = 24 * 1024 * 1024

CROPS = {
    "lead": (1600, 900),
    "card": (900, 600),
    "popup": (1200, 800),
}

def fetch(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json, image/jpeg"})
    with urlopen(req, timeout=50) as response:
        mime = response.headers.get("Content-Type", "").split(";")[0].strip()
        data = response.read(MAX_INPUT + 1)
    if len(data) > MAX_INPUT:
        raise RuntimeError("Image exceeds size budget")
    if not data:
        raise RuntimeError("Empty Commons response")
    return data

def commons_image_info(page: str) -> dict:
    prefix = "https://commons.wikimedia.org/wiki/File:"
    if not page.startswith(prefix):
        raise RuntimeError("Only previously reviewed Wikimedia Commons file pages are allowed")
    file_name = unquote(page[len(prefix):]).replace("_", " ")
    params = urlencode({
        "action": "query", "format": "json",
        "titles": "File:" + file_name,
        "prop": "imageinfo", "iiprop": "url|mime|sha1|size",
    })
    response = json.loads(fetch("https://commons.wikimedia.org/w/api.php?" + params))
    items = list(response["query"]["pages"].values())
    if len(items) != 1 or "imageinfo" not in items[0]:
        raise RuntimeError("Commons file missing: " + file_name)
    info = items[0]["imageinfo"][0]
    parsed = urlparse(info["url"])
    if parsed.scheme != "https" or parsed.netloc != "upload.wikimedia.org":
        raise RuntimeError("Unexpected Commons image host")
    if info["mime"] != "image/jpeg":
        raise RuntimeError("Unexpected Commons image format")
    return info

def sha1_base36(data: bytes) -> str:
    num = int.from_bytes(hashlib.sha1(data).digest(), "big")
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    result = ""
    while num:
        num, remainder = divmod(num, 36)
        result = digits[remainder] + result
    return result.rjust(31, "0")

def main() -> None:
    shortlist = json.loads(SHORTLIST.read_text(encoding="utf-8"))
    candidates = {row["place_id"]: row for row in shortlist["places"]}
    if shortlist["status"] not in ("SOURCE_PAGES_REVIEWED_NO_IMAGE_IMPORTED_OR_CROPPED", "SOURCE_PAGES_REVIEWED_12_CROPS_STAGED_NOT_REGISTERED", "SOURCE_PAGES_REVIEWED_15_CROPS_STAGED_NOT_REGISTERED"):
        raise RuntimeError("Source image review stage has changed")
    if set(APPROVED_IDS) - set(candidates):
        raise RuntimeError("Missing image source rows")
    prepared = []
    OUT.mkdir(parents=True, exist_ok=True)
    for place_id in APPROVED_IDS:
        row = candidates[place_id]
        lead = row.get("lead_candidate")
        if row["status"] not in ("LICENSE_PAGE_CHECKED_IMAGE_NOT_IMPORTED", "LICENSE_PAGE_CHECKED_IMAGE_ASSETS_STAGED_NOT_BOUND") or not lead:
            raise RuntimeError("Source not license-reviewed: " + place_id)
        if lead["license"] not in ("CC BY-SA 3.0", "CC BY 3.0", "CC BY 2.5", "public_domain_dedication_by_author"):
            raise RuntimeError("Unexpected license " + place_id)
        info = commons_image_info(lead["page"])
        data = fetch(info["url"])
        # MediaWiki imageinfo deployments can represent SHA-1 in base-36 or hex.
        # Accept only a checksum that exactly matches one of those two encodings.
        expected = str(info["sha1"]).lower().lstrip("0")
        hashes = {sha1_base36(data).lstrip("0"), hashlib.sha1(data).hexdigest().lstrip("0")}
        if expected not in hashes:
            raise RuntimeError(
                "Commons content checksum mismatch for " + place_id +
                "; expected=" + str(info["sha1"]) + ", derived_base36=" +
                sha1_base36(data) + ", derived_hex=" + hashlib.sha1(data).hexdigest()
            )
        with Image.open(io.BytesIO(data)) as raw:
            raw.load()
            if raw.format != "JPEG":
                raise RuntimeError("Decoded file is not JPEG")
            picture = ImageOps.exif_transpose(raw).convert("RGB")
        width, height = picture.size
        if [width, height] != lead["original_dimensions"]:
            raise RuntimeError("Image dimensions no longer match source review: " + place_id)
        outputs = []
        for role, size in CROPS.items():
            rendered = ImageOps.fit(picture, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            target = OUT / (place_id + "__commons_" + role + ".webp")
            rendered.save(target, "WEBP", quality=84, method=6)
            outputs.append({"role": role, "path": target.relative_to(ROOT).as_posix(),
                            "width": size[0], "height": size[1],
                            "sha256": hashlib.sha256(target.read_bytes()).hexdigest()})
        prepared.append({
            "place_id": place_id, "source_page": lead["page"], "source_download_url": info["url"],
            "author": lead["author"], "license": lead["license"],
            "license_url": lead["license_url"], "original_sha1_base36": info["sha1"],
            "cropping": "deterministic centered crop with EXIF orientation and Lanczos resize",
            "visual_quality_approved": False, "canonical_place_bound": False,
            "attribution_display_checked": False, "variants": outputs
        })
    result = {
        "schema": "history_go_oslo_six_prepared_commons_image_triplets_v1",
        "as_of": "2026-10-22", "status": "PREPARED_BYTES_NOT_VISUALLY_QA_NOT_REGISTERED",
        "disclaimer": "These are unapproved WebP candidates only. Verify subject cropping, appropriate credit placement and runtime before activation.",
        "places": prepared
    }
    ATTRIBUTION.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Prepared", len(prepared), "Commons photos and", len(prepared) * len(CROPS), "WebP variants; 0 live Place bindings.")

if __name__ == "__main__":
    main()
