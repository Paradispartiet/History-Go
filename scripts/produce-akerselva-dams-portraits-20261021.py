#!/usr/bin/env python3
"""Materialize two already credited Akerselva dam photographs as local 3:4 WebP fronts.

Fail closed on Commons identity, creator, licensing, or download errors.
Do not modify the existing hero/source photograph or the historical article.
"""
from __future__ import annotations

import hashlib
import html
import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "bilder/places"
REPORT = ROOT / "reports/place-production/akerselva-dams-portraits-20261021.json"
SIZE = (600, 800)  # exact 3:4 front with no further cropping on the 3:4 PlaceCard
EXPECTED = [
    {
        "id": "brekkedammen",
        "file": "data/places/natur/oslo/brekkedammen.json",
        "commons": "Kjelsaas Stilla Brekkedammen.JPG",
        "author": "Bjoertvedt",
        "license": "CC BY-SA 4.0",
        "position": (0.50, 0.51),
    },
    {
        "id": "nydalsdammen",
        "file": "data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalsdammen.json",
        "commons": "Nydalsdammen foilage Akersleva (161215).jpg",
        "author": "Tore Sætre",
        "license": "CC BY-SA 4.0",
        "position": (0.50, 0.50),
    },
]
UA = "HistoryGo-Akerselva-Photo-Production/1.0 (attribution-preserving reuse; github.com/Paradispartiet/History-Go)"

def request(url, accept, limit=24_000_000):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept})
    with urllib.request.urlopen(req, timeout=55) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise RuntimeError("Commons response exceeds size limit")
    return data

def text(raw):
    return html.unescape(re.sub(r"<[^>]*>", "", str(raw or ""))).strip()

def commons_image(entry):
    query = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "prop": "imageinfo", "titles": "File:" + entry["commons"],
        "iiprop": "url|size|extmetadata", "iiurlwidth": "2400",
    })
    document = json.loads(request("https://commons.wikimedia.org/w/api.php?" + query, "application/json"))
    page = document["query"]["pages"][0]
    if "missing" in page or not page.get("imageinfo"):
        raise RuntimeError("Exact Commons file does not exist")
    info = page["imageinfo"][0]
    metadata = info.get("extmetadata") or {}
    artist = text(metadata.get("Artist", {}).get("value"))
    license_name = text(metadata.get("LicenseShortName", {}).get("value"))
    if entry["author"].casefold() not in artist.casefold():
        raise RuntimeError(f"Unexpected Commons creator: {artist!r}")
    if license_name != entry["license"]:
        raise RuntimeError(f"Unexpected Commons license: {license_name!r}")
    photo = request(info.get("thumburl") or info["url"], "image/*")
    if len(photo) < 10_000:
        raise RuntimeError("Suspiciously small image response")
    with Image.open(io.BytesIO(photo)) as source:
        original = ImageOps.exif_transpose(source).convert("RGB")
    if original.width < 800 or original.height < 500:
        raise RuntimeError(f"Insufficient source resolution: {original.size}")
    return photo, original, {"author": artist, "license": license_name,
        "originalWidth": info.get("width"), "originalHeight": info.get("height"),
        "sourcePage": "https://commons.wikimedia.org/wiki/File:" +
            urllib.parse.quote(entry["commons"].replace(" ", "_"))}

def main():
    results = []
    for entry in EXPECTED:
        place_path = ROOT / entry["file"]
        place = json.loads(place_path.read_text(encoding="utf8"))
        if place.get("id") != entry["id"]:
            raise RuntimeError("Canonical place ID mismatch")
        old_meta = place.get("imageMeta") or {}
        if old_meta.get("author") != entry["author"] or old_meta.get("licenseShortName") != entry["license"]:
            raise RuntimeError("Existing verified source differs from expected Commons identity")
        if old_meta.get("fileTitle") != "File:" + entry["commons"]:
            raise RuntimeError("Existing verified file title differs")
        if not (place.get("image") and place.get("imageSourceUrl")):
            raise RuntimeError("Missing existing credited hero/source")
        data, source, info = commons_image(entry)
        filename = entry["id"] + "_front_portrait.webp"
        target = OUTPUT / filename
        if target.exists():
            raise RuntimeError(f"Refusing to overwrite preexisting image: {target}")
        target.parent.mkdir(parents=True, exist_ok=True)
        crop = ImageOps.fit(source, SIZE, method=Image.Resampling.LANCZOS,
                            centering=entry["position"])
        crop.save(target, format="WEBP", quality=85, method=6)
        with Image.open(target) as check:
            if check.format != "WEBP" or check.size != SIZE:
                raise RuntimeError("Invalid local portrait asset")
        if target.stat().st_size < 8_000:
            raise RuntimeError("Suspiciously small portrait WebP")
        front = str(target.relative_to(ROOT))
        place["frontImage"] = front
        place["frontImageMeta"] = {
            "source": "wikimedia_commons",
            "sourcePage": info["sourcePage"],
            "creator": entry["author"],
            "credit": place.get("imageCredit", entry["author"]),
            "license": entry["license"],
            "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
            "sourceSha256": hashlib.sha256(data).hexdigest(),
            "sourceImageDimensions": [source.width, source.height],
            "originalDimensions": [info["originalWidth"], info["originalHeight"]],
            "outputDimensions": list(SIZE),
            "orientation": "portrait",
            "transformation": "Separate subject-centered 3:4 photo crop (600x800 WebP) from existing Commons photograph; no content invented",
            "verifiedAt": "2026-10-21",
            "visualReview": "pending_real_placecard_image_composition_review",
        }
        place["imageComposition"] = {
            **(place.get("imageComposition") or {}),
            "portraitFit": "cover",
            "portraitPosition": "50% 50%",
            "portraitRatio": "3:4",
            "heroPosition": (place.get("imageComposition") or {}).get("heroPosition", "50% 50%"),
        }
        place_path.write_text(json.dumps(place, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
        results.append({
            "id": entry["id"], "image": front, "sourcePage": info["sourcePage"],
            "author": entry["author"], "license": entry["license"],
            "sourceSha256": hashlib.sha256(data).hexdigest(),
            "sourceDimensions": [source.width, source.height],
            "outputDimensions": list(SIZE),
            "outputBytes": target.stat().st_size,
            "appVisualApproval": False,
            "v1MediaApproval": False,
        })
        print("PORTRAIT_WRITTEN", entry["id"], front, target.stat().st_size, flush=True)
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps({
        "schema": "history_go_akerselva_dams_photo_portrait_v1",
        "assets": results, "livePhotoReview": "pending",
        "scope": "independent portrait crops from existing verified Wikimedia documentary photographs",
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf8")

if __name__ == "__main__":
    main()
