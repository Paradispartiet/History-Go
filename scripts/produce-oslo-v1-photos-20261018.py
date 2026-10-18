#!/usr/bin/env python3
"""Curated Oslo v1 image-production batch. Never grant v1 solely on image creation."""
from __future__ import annotations
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
BATCH_PATH = ROOT / "data/places/production-tiers/v1-oslo-nature-music-20261017-batch02.json"
REPORT_PATH = ROOT / "data/places/production-tiers/v1-oslo-photo-batch-20261018.json"
USER_AGENT = "HistoryGoOsloV1PhotoProduction/1.0 (source attribution and public Commons reuse; contact via github.com/Paradispartiet/History-Go)"

# Human-reviewed subject/source pairing. Title and expected licence are verified again
# against the Commons File page metadata before *any* local assets are emitted.
SOURCES = {
    "groruddammen": ("Groruddammen.JPG", None),
    "svartdalen": ("Alna i Svartdalen.JPG", "Public domain"),
    "alnaparken": ("2011-04-03 Alnaelva i Alnaparken.jpg", "CC BY-SA 3.0"),
    "voienfossen": ("Vøyenfallene - Oslo, Norway 2020-09-19 (01).jpg", "CC BY-SA 4.0"),
    "myralokka": ("Myralokka2.JPG", "Public domain"),
    "vulkan_industriomrade": ("Vulkan - Mathallen Kulturmiljø Oslo Akerselva 2026-01-15 01.jpg", "CC0"),
    "blaa": ("Blå Brenneriveien Oslo.JPG", "CC BY-SA 3.0"),
    "sentrum_scene": ("Sentrum Scene, Arbeidersamfunnets plass 1, Oslo.jpg", "CC BY-SA 4.0"),
    "rockefeller": ("Rockefeller audience.jpg", "CC BY-SA 4.0"),
    "alna_bryn": ("Joh petersen 02 id 163332.jpg", None),
}
# These photos exist in place records already. Not a claim that their rights were checked.
EXISTING_PHOTO_IDS = {"ankerbrua", "hausmannsbrua", "hausmania", "torggata_blad"}
ALLOWED = {"Public domain", "CC0", "CC BY-SA 3.0", "CC BY-SA 4.0",
           "CC BY 3.0", "CC BY 4.0", "CC BY-SA 3.0 NO", "CC BY-SA 2.0",
           "CC BY 2.0", "CC BY-SA 3.0 no"}
MAX_DOWNLOAD = 30 * 1024 * 1024

def request_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as response:
        return json.loads(response.read())

def request_image(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "image/*"})
    with urllib.request.urlopen(req, timeout=60) as response:
        data = response.read(MAX_DOWNLOAD + 1)
    if len(data) > MAX_DOWNLOAD:
        raise ValueError("Image exceeds bounded download limit")
    if len(data) < 4000:
        raise ValueError("Image download is implausibly small")
    return data

def clean(value):
    return html.unescape(re.sub(r"<[^>]+>", "", str(value or ""))).strip()

def commons_info(filename):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": 2,
        "prop": "imageinfo", "titles": "File:" + filename,
        "iiprop": "url|extmetadata", "iiurlwidth": 1500,
    })
    payload = request_json(url)
    page = payload["query"]["pages"][0]
    if "missing" in page or not page.get("imageinfo"):
        raise ValueError("Commons File page not found")
    info = page["imageinfo"][0]
    md = info.get("extmetadata") or {}
    lic = clean(md.get("LicenseShortName", {}).get("value", ""))
    artist = clean(md.get("Artist", {}).get("value", ""))
    return {
        "license": lic, "author": artist,
        "download_url": info.get("thumburl") or info["url"],
        "source_url": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(filename.replace(" ", "_")),
    }

def encode(img, target, size):
    img = ImageOps.fit(img, size, method=Image.Resampling.LANCZOS, centering=(.5, .5))
    target.parent.mkdir(parents=True, exist_ok=True)
    img.save(target, "WEBP", quality=83, method=6)
    with Image.open(target) as saved:
        if saved.size != size or saved.format != "WEBP":
            raise ValueError("Image file or dimensions invalid")

def main():
    batch = json.loads(BATCH_PATH.read_text())
    report = {"schema": "history_go_v1_photo_production_v1", "date": "2026-10-18",
              "target": "21 existing river, music and subculture QuizCards",
              "policy": "No v1 status without verified on-device PlaceCard and QuizCard rendering.",
              "produced": [], "held": []}
    for p in batch["places"]:
        id = p["place_id"]
        p["runtime_binding_status"] = "not_verified_in_app"
        p["content_level"] = "v1_candidate"
        if id not in SOURCES:
            if id in EXISTING_PHOTO_IDS:
                p["photo_status"] = "existing_photo_reference_rights_or_image_content_review_pending"
                why = "Existing photo reference; rights, separate portrait and rendering not independently approved"
            else:
                p["photo_status"] = "no_identity_verified_reusable_photo_yet"
                why = "No reviewed photographic source selected for this specific place"
            report["held"].append({"place_id": id, "reason": why})
            continue

        filename, expected_license = SOURCES[id]
        place_path = ROOT / p["place_file"]
        place = json.loads(place_path.read_text())
        if place.get("id") != id:
            report["held"].append({"place_id": id, "reason": "Canonical place-id mismatch"})
            continue
        image_path = "bilder/places/" + id + ".webp"
        portrait_path = "bilder/places/" + id + "_front_portrait.webp"
        card_path = "bilder/kort/places/" + id + ".webp"
        if all((ROOT / asset).is_file() for asset in [image_path, portrait_path, card_path]) and (
                place.get("image") == image_path and place.get("frontImage") == portrait_path
                and place.get("cardImage") == card_path
                and "commons.wikimedia.org/wiki/File:" in place.get("imageSourceUrl", "")):
            # Already materialized earlier in the same batch: keep it, do not redownload
            # or demote to an erroneous hold status on an incremental retry.
            p["photo_status"] = "local_photo_and_rights_record_produced"
            p["frontImage_status"] = "separate_local_portrait_file_produced"
            p["photo_source"] = place["imageSourceUrl"]
            p["photo_license"] = place.get("imageLicense", "")
            p["photo_author"] = place.get("imageCredit", "").replace(" / Wikimedia Commons", "")
            report["produced"].append({
                "place_id": id, "file": p["place_file"],
                "image": image_path, "frontImage": portrait_path, "cardImage": card_path,
                "source_url": place["imageSourceUrl"], "author": p["photo_author"],
                "license": p["photo_license"],
                "transformation": "Landscape, portrait and card: separately generated WebP; same source licence applies",
                "runtime_verification": "pending",
            })
            continue
        if any((ROOT / path).exists() for path in [image_path, portrait_path, card_path]):
            report["held"].append({"place_id": id, "reason": "Would overwrite an existing image asset"})
            continue
        try:
            info = commons_info(filename)
            lic = info["license"].replace("CC-Zero", "CC0").replace("CC Zero", "CC0")
            if lic not in ALLOWED:
                raise ValueError("Unapproved or unknown rights: " + repr(lic))
            if expected_license and lic != expected_license:
                raise ValueError("Commons licence changed or differs: " + repr(lic))
            if not info["author"]:
                raise ValueError("Attributable author missing")
            raw = request_image(info["download_url"])
            with Image.open(io.BytesIO(raw)) as src:
                original = ImageOps.exif_transpose(src)
                if original.width < 650 or original.height < 550:
                    raise ValueError("Photo resolution too low")
                if original.mode != "RGB":
                    original = original.convert("RGB")
                encode(original, ROOT / image_path, (1400, 900))
                encode(original, ROOT / portrait_path, (900, 1350))
                encode(original, ROOT / card_path, (900, 600))
            place["image"] = image_path
            place["frontImage"] = portrait_path
            place["cardImage"] = card_path
            place["imageCredit"] = info["author"] + " / Wikimedia Commons"
            place["imageLicense"] = lic
            place["imageSourceUrl"] = info["source_url"]
            place_path.write_text(json.dumps(place, ensure_ascii=False, indent=2) + "\n")
            p["photo_status"] = "local_photo_and_rights_record_produced"
            p["frontImage_status"] = "separate_local_portrait_file_produced"
            p["photo_source"] = info["source_url"]
            p["photo_license"] = lic
            p["photo_author"] = info["author"]
            report["produced"].append({
                "place_id": id, "file": p["place_file"],
                "image": image_path, "frontImage": portrait_path, "cardImage": card_path,
                "source_url": info["source_url"], "author": info["author"], "license": lic,
                "transformation": "Landscape, portrait and card: separately generated WebP, all cropped from licensed source; same source licence applies",
                "runtime_verification": "pending",
            })
            print("PHOTO PRODUCED", id, lic)
        except Exception as exc:
            # Partial image outputs must never ship or count as success.
            for path in [image_path, portrait_path, card_path]:
                (ROOT / path).unlink(missing_ok=True)
            p["photo_status"] = "photo_source_selected_but_import_blocked"
            report["held"].append({"place_id": id, "source_file": filename,
                                   "reason": str(exc)[:320]})
            print("PHOTO HELD", id, str(exc)[:180])
        time.sleep(.35)

    batch["image_production_20261018"] = {
        "image_assets_produced": len(report["produced"]),
        "places_still_requiring_photo_or_rights": len(report["held"]),
        "runtime_verified": 0,
        "v1_promoted": 0,
        "status": "photo_materialized_not_v1_approved",
    }
    BATCH_PATH.write_text(json.dumps(batch, ensure_ascii=False, indent=2) + "\n")
    report["counts"] = {"candidates": len(batch["places"]), "produced": len(report["produced"]),
                        "held": len(report["held"]), "new_v1": 0}
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report["counts"]))

if __name__ == "__main__":
    main()
