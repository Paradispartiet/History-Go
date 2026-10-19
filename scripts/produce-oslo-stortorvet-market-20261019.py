#!/usr/bin/env python3
"""Replace Stortorvet's tram-dominated card with a licensed photograph of the actual market."""
from __future__ import annotations
import hashlib
import html
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PID = "stortorget"
FILE = "Oslo, market.JPG"
AUTHOR = "Michal Klajban"
LICENSE = "CC BY-SA 3.0"
PAGE = "https://commons.wikimedia.org/wiki/File:Oslo,_market.JPG"
PLACE = ROOT / "data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/stortorget.json"
STATUS = ROOT / "data/places/production-tiers/v1-oslo-place-media-text-review-20261019-batch04.json"
OUT = ROOT / "bilder/places/oslo-20-stortorvet-market-20261019"
REPORT = ROOT / "reports/oslo-20-stortorvet-market-20261019"
SIZES = {"hero": (1400, 900), "portrait": (900, 1350), "card": (900, 600)}
UA = "HistoryGoStortorvetPhoto/1.0 (historical-place-media; github.com/Paradispartiet/History-Go)"

def fetch(url, mime):
    last = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": mime})
            with urllib.request.urlopen(request, timeout=50) as response:
                data = response.read(18_000_001)
            if len(data) > 18_000_000:
                raise ValueError("Image/source response exceeds 18 MB")
            return data
        except Exception as error:
            last = error
            if attempt < 2:
                time.sleep(4 * (attempt + 1))
    raise last

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main():
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "prop": "imageinfo", "titles": "File:" + FILE, "iiprop": "url|extmetadata",
        "iiurlwidth": "2560",
    })
    data = json.loads(fetch(api, "application/json"))
    page = data["query"]["pages"][0]
    if "missing" in page or not page.get("imageinfo"):
        raise ValueError("Missing exact Wikimedia file")
    info = page["imageinfo"][0]
    meta = info.get("extmetadata", {})
    def plain(field):
        return html.unescape(re.sub(r"<[^>]+>", "", meta.get(field, {}).get("value", ""))).strip()
    found_license = plain("LicenseShortName")
    found_artist = plain("Artist")
    if found_license != LICENSE or AUTHOR.casefold() not in found_artist.casefold():
        raise ValueError(f"Source creator/license mismatch: {found_artist!r}, {found_license!r}")
    # Prefer Wikimedia's official 2560px rendition over the rate-limited full original.
    # Source identity and copyright metadata still come from exact Commons imageinfo.
    download_url = info.get("thumburl") or info["url"]
    raw = fetch(download_url, "image/jpeg,image/*")
    with Image.open(io.BytesIO(raw)) as src:
        image = ImageOps.exif_transpose(src).convert("RGB")
    if image.width < 2200 or image.height < 1400:
        raise ValueError(f"Source too small for all three real crops: {image.size}")
    place = json.loads(PLACE.read_text(encoding="utf-8"))
    status = json.loads(STATUS.read_text(encoding="utf-8"))
    if place.get("id") != PID:
        raise ValueError("Wrong canonical place")
    row = next(x for x in status["places"] if x["place_id"] == PID)
    OUT.mkdir(parents=True, exist_ok=True)
    assets = {}
    for key, dimensions in SIZES.items():
        destination = OUT / f"{PID}_{key}.webp"
        focus = (0.50, 0.54) if key == "portrait" else (0.50, 0.51)
        ImageOps.fit(image, dimensions, method=Image.Resampling.LANCZOS, centering=focus).save(
            destination, format="WEBP", quality=89, method=6
        )
        with Image.open(destination) as test:
            if test.size != dimensions or test.format != "WEBP":
                raise ValueError("Invalid image dimensions or encoding")
        if destination.stat().st_size < 8_000:
            raise ValueError(f"Produced {key} WebP is suspiciously small")
        assets[key] = str(destination.relative_to(ROOT))
    place.update({
        "image": assets["hero"], "frontImage": assets["portrait"],
        "cardImage": assets["card"], "imageCard": assets["card"],
        "imageCredit": AUTHOR + " / Wikimedia Commons", "imageLicense": LICENSE,
        "imageSourceUrl": PAGE, "imageSourceDimensions": [image.width, image.height],
        "imageCaption": "Blomster- og grønnsakshandel på Stortorvet i 2012. Foto: Michal Klajban.",
        "sourceResolutionNote": "Originalt dokumentarfoto av torghandelen; særskilte utsnitt for hero, portrett og kort. Appens mobilkomposisjon krever visuell sluttkontroll.",
        "imageComposition": {
            "heroPosition": "50% 50%", "portraitPosition": "50% 50%",
            "portraitRatio": "2:3", "heroBehavior": "cover_with_subject_focal_point",
            "quizCardBehavior": "contain_never_crop"
        }
    })
    shared = {
        "source": "wikimedia_commons", "sourcePage": PAGE,
        "creator": AUTHOR, "credit": AUTHOR + " / Wikimedia Commons",
        "license": LICENSE, "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
        "sourceSha256": hashlib.sha256(raw).hexdigest(),
        "assetType": "documentary_place_photo", "verifiedAt": "2026-10-19",
        "representationScope": "Stortorvets blomster- og grønnsaksmarked, ikke bare trikkeholdeplassen"
    }
    place["imageMeta"] = {
        **shared, "transformation": "Separate documentary 1400x900 hero and 900x600 card crops."
    }
    place["frontImageMeta"] = {
        **shared, "orientation": "portrait", "outputDimensions": "900x1350",
        "transformation": "Separate 900x1350 portrait crop of the licensed market photograph."
    }
    row.update({
        "image_reference_status": "image_and_portrait_referenced",
        "photo_production_status": "source_license_verified_three_market_photo_webps_written",
        "image_rights_and_crop_approved": False,
        "app_visual_review_status": "pending_native_placecard_and_mobile_review",
        "photo_source": PAGE,
        "pending": "review_real_native_market_photo_crops_before_v1"
    })
    status["image_production_stortorvet_market"] = {
        "attempted": 1, "assets_produced": 3, "held": 0,
        "app_visual_review": "pending", "v1_promoted": 0
    }
    save(PLACE, place)
    save(STATUS, status)
    report = {
        "schema": "history_go_stortorvet_market_photo_v1", "place_id": PID,
        "sourcePage": PAGE, "creator": AUTHOR, "license": LICENSE,
        "originalDimensions": [image.width, image.height],
        "sourceSha256": hashlib.sha256(raw).hexdigest(),
        "assets": assets, "appVisualApproval": False,
        "v1Promoted": False, "sourceReview": "verified imageinfo artist, exact CC BY-SA 3.0 license and place category"
    }
    save(REPORT / "result.json", report)
    print("STORTORVET_REAL_MARKET_PHOTO", json.dumps({
        "source": PAGE, "assets": len(assets), "dimensions": [image.width, image.height]
    }))

if __name__ == "__main__":
    main()
