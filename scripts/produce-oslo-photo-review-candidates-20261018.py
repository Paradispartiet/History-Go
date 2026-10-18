#!/usr/bin/env python3
"""Produce LICENSED review candidates only; never touch live PlaceCard bindings."""
from __future__ import annotations
import html
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/places/production-tiers/oslo-v1-photo-candidates-20261018.json"
OUT = ROOT / "bilder/places/candidates/oslo-v1-20261018"
REPORT = ROOT / "reports/oslo-v1-photo-candidates-20261018"
AGENT = "HistoryGoOsloPhotoEditorial/1.0 (commons license review; https://github.com/Paradispartiet/History-Go)"
MAX_BYTES = 32 * 1024 * 1024

def clean(value):
    return html.unescape(re.sub(r"<[^>]*>", "", str(value or ""))).strip()

def get(url, content_type):
    last_error = None
    for retry in range(4):
        try:
            headers = {"User-Agent": AGENT, "Accept": content_type}
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=70) as response:
                contents = response.read(MAX_BYTES + 1)
                if len(contents) > MAX_BYTES:
                    raise ValueError("Source exceeds download limit")
                return contents
        except Exception as exc:
            last_error = exc
            if retry != 3:
                time.sleep((retry + 1) * 2)
    raise ValueError("Download failed after retries: " + str(last_error))

def file_info(name):
    query = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "prop": "imageinfo", "titles": "File:" + name,
        "iiprop": "url|extmetadata", "iiurlwidth": "3200"
    })
    response = json.loads(get("https://commons.wikimedia.org/w/api.php?" + query, "application/json"))
    page = response["query"]["pages"][0]
    if "missing" in page or not page.get("imageinfo"):
        raise ValueError("Commons File not found: " + name)
    info = page["imageinfo"][0]
    lic = clean((info.get("extmetadata") or {}).get("LicenseShortName", {}).get("value"))
    artist = clean((info.get("extmetadata") or {}).get("Artist", {}).get("value"))
    if not artist:
        raise ValueError("Missing source artist on Commons")
    if not (info.get("thumburl") or info.get("url")):
        raise ValueError("No Commons source file URL")
    return lic, artist, info.get("thumburl") or info["url"]

def subject_crop(image, shape, centering):
    # Centers apply to the available crop margin, not the raw image's center.
    cx, cy, zoom = centering
    if not all(isinstance(n, (int, float)) for n in centering):
        raise ValueError("Crop coordinate must be numeric")
    if not (0 <= cx <= 1 and 0 <= cy <= 1 and 1 <= zoom <= 1.3):
        raise ValueError("Unsafe crop configuration")
    w, h = image.size
    ratio = shape[0] / shape[1]
    cw, ch = (h * ratio, h) if w / h > ratio else (w, w / ratio)
    cw /= zoom
    ch /= zoom
    left = max(0, min(w - cw, (w - cw) * cx))
    top = max(0, min(h - ch, (h - ch) * cy))
    cropped = image.crop((round(left), round(top), round(left + cw), round(top + ch)))
    return cropped.resize(tuple(shape), Image.Resampling.LANCZOS)

def build(candidate, manifest):
    pid = candidate["place_id"]
    if pid not in {"groruddammen", "alna_bryn", "blaa", "rockefeller"}:
        raise ValueError("Unapproved place ID")
    canonical = json.loads((ROOT / "data/runtime/place-open" / (pid + ".json")).read_text())
    if canonical["place"]["id"] != pid:
        raise ValueError("Canonical runtime ID mismatch")
    expected = "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(
        candidate["source_filename"].replace(" ", "_")
    )
    if urllib.parse.unquote(candidate["source_page"]) != urllib.parse.unquote(expected):
        raise ValueError("Candidate source page does not match filename")
    license_name, source_artist, image_url = file_info(candidate["source_filename"])
    if license_name.lower() != candidate["license"].lower():
        raise ValueError("License mismatch: expected " + candidate["license"] + ", got " + license_name)
    data = get(image_url, "image/*")
    if len(data) < 4000:
        raise ValueError("Implausibly short Commons image")
    with Image.open(io.BytesIO(data)) as src:
        image = ImageOps.exif_transpose(src).convert("RGB")
    if image.width < 1500 or image.height < 1000:
        raise ValueError("Photograph is too small for three derivatives")
    paths = {}
    for kind, shape in manifest["outputs"].items():
        path = OUT / (pid + "_" + kind + ".webp")
        if path.exists():
            raise ValueError("Would overwrite an existing candidate file: " + str(path))
        path.parent.mkdir(parents=True, exist_ok=True)
        image_result = subject_crop(image, shape, candidate["crop"][kind])
        image_result.save(path, "WEBP", quality=85, method=6)
        with Image.open(path) as check:
            if check.format != "WEBP" or list(check.size) != shape:
                raise ValueError("Generated image dimensions invalid")
        paths[kind] = str(path.relative_to(ROOT))
    return {
        "place_id": pid, "output": paths,
        "commons_source": candidate["source_page"],
        "license": license_name, "license_url": candidate["license_url"],
        "creator_credit": candidate["creator"], "commons_artist_metadata": source_artist,
        "copyright_policy": "Attribution + share alike; cropped and encoded derivative",
        "crop_settings": candidate["crop"],
        "review_status": "not_yet_approved_for_live_place",
    }

def contact_sheet(produced, manifest):
    if not produced:
        return
    # Purely an editorial viewing aid: actual asset files remain independent.
    thumb_w, thumb_h = 420, 270
    portrait_w, portrait_h = 180, 270
    row_h = 310
    sheet = Image.new("RGB", (660, len(produced) * row_h + 18), (22, 23, 26))
    draw = ImageDraw.Draw(sheet)
    for row, item in enumerate(produced):
        top = row * row_h + 25
        with Image.open(ROOT / item["output"]["hero"]) as img:
            sheet.paste(img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (15, top))
        with Image.open(ROOT / item["output"]["portrait"]) as img:
            sheet.paste(img.resize((portrait_w, portrait_h), Image.Resampling.LANCZOS), (450, top))
        draw.text((15, top - 16), item["place_id"], fill="white")
    path = REPORT / "editorial-contact-sheet.jpg"
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, "JPEG", quality=84)

def main():
    manifest = json.loads(MANIFEST.read_text())
    if manifest["schema"] != "history_go_oslo_photo_candidate_selection_v1":
        raise ValueError("Unsupported candidate manifest")
    REPORT.mkdir(parents=True, exist_ok=True)
    report = {
        "schema": "history_go_oslo_photo_candidates_artifacts_v1",
        "date": "2026-10-18",
        "produced": [], "held": [],
        "policy": "No live images changed or v1 promoted. Human editorial review required."
    }
    for candidate in manifest["candidates"]:
        try:
            entry = build(candidate, manifest)
            report["produced"].append(entry)
            print("CANDIDATE PRODUCED:", entry["place_id"], flush=True)
        except Exception as exc:
            pid = candidate["place_id"]
            for path in OUT.glob(pid + "_*.webp"):
                path.unlink()
            report["held"].append({"place_id": pid, "reason": str(exc)[:320]})
            print("CANDIDATE HELD:", pid, str(exc)[:160], flush=True)
        time.sleep(0.4)
    report["counts"] = {
        "requested": len(manifest["candidates"]),
        "produced": len(report["produced"]),
        "held": len(report["held"]),
        "live_images_replaced": 0,
        "v1_promoted": 0
    }
    (REPORT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    contact_sheet(report["produced"], manifest)
    print("PHOTO EDITORIAL SUMMARY", json.dumps(report["counts"]), flush=True)
    if not report["produced"]:
        raise SystemExit("No licensed candidate images generated")

if __name__ == "__main__":
    main()
