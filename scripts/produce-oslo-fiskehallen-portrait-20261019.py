#!/usr/bin/env python3
"""Source-controlled Fiskehallen photo pass. Never substitute the 1905 hall."""
import hashlib
import io
import json
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PID = "vippetangen_fisketorg"
PLACE = ROOT / f"data/places/naeringsliv/oslo/places_naeringsliv/{PID}.json"
STATUS = ROOT / "data/places/production-tiers/v1-oslo-place-media-text-review-20261019-batch04.json"
OUT = ROOT / "bilder/places/oslo-20-fiskehallen-20261019"
REPORT = ROOT / "reports/oslo-20-fiskehallen-photo-20261019"
MUSEUM = "https://digitaltmuseum.no/021015456022/fiskehallen-pa-vippetangen"
SOURCES = [
    "https://lokalhistoriewiki.no/images/Fiskehallen_Oslo_inne.jpg",
    "https://lokalhistoriewiki.no/thumb.php?f=Fiskehallen_Oslo_inne.jpg&width=1900",
]
OUTPUTS = {"hero": (1400, 900), "portrait": (900, 1350), "card": (900, 600)}

def load(path): return json.loads(path.read_text(encoding="utf-8"))
def save(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main():
    REPORT.mkdir(parents=True, exist_ok=True)
    place, status = load(PLACE), load(STATUS)
    assert place["id"] == PID
    row = next(x for x in status["places"] if x["place_id"] == PID)
    result = {"schema": "historygo_oslo_fiskehallen_photo_v1", "place_id": PID,
              "documented_museum_object": "Oslo Museum OB.Z18506", "photographed": 1950,
              "creator": "Wilhelm Råger", "license": "CC BY-SA (version unspecified in record)",
              "sourcePage": MUSEUM, "sourceImageAttempts": SOURCES,
              "localAssetApproval": False, "appVisualReview": "pending"}
    for source in SOURCES:
        try:
            request = urllib.request.Request(source, headers={
                "User-Agent": "HistoryGoHistoricalPhotoReview/1.0 (GitHub: Paradispartiet/History-Go)",
                "Accept": "image/jpeg,image/*"})
            with urllib.request.urlopen(request, timeout=45) as response:
                body = response.read(30_000_001)
            if len(body) > 30_000_000: raise ValueError("oversized source")
            with Image.open(io.BytesIO(body)) as source_image:
                image = ImageOps.exif_transpose(source_image).convert("RGB")
            if image.width < 1200 or image.height < 850:
                raise ValueError(f"source is too small for responsible place crops: {image.size}")
            OUT.mkdir(parents=True, exist_ok=True)
            paths = {}
            for kind, dimensions in OUTPUTS.items():
                dest = OUT / f"{PID}_{kind}.webp"
                focus = (0.5, 0.53) if kind == "portrait" else (0.50, 0.47)
                cropped = ImageOps.fit(image, dimensions, method=Image.Resampling.LANCZOS, centering=focus)
                cropped.save(dest, "WEBP", quality=88, method=6)
                with Image.open(dest) as check:
                    if check.size != dimensions: raise ValueError("incorrect output dimensions")
                paths[kind] = str(dest.relative_to(ROOT))
            place["image"], place["frontImage"], place["cardImage"] = (
                paths["hero"], paths["portrait"], paths["card"])
            place["imageCard"] = paths["card"]
            place["imageSourceDimensions"] = [image.width, image.height]
            place["sourceResolutionNote"] = "Real museum photograph, resized with independent hero, portrait and card crops; native mobile composition review still pending."
            place["imageMeta"].update({
                "sourcePage": MUSEUM, "sourceSha256": hashlib.sha256(body).hexdigest(),
                "sourceImageUrl": source,
                "transformation": "Subject-centered 1400x900 hero and 900x600 thumbnail, WebP. No generated content.",
            })
            place["frontImageMeta"].update({
                "sourcePage": MUSEUM, "sourceSha256": hashlib.sha256(body).hexdigest(),
                "sourceImageUrl": source, "orientation": "portrait",
                "outputDimensions": "900x1350",
                "transformation": "Separate 900x1350 portrait crop of the documented 1950 museum photograph.",
            })
            save(PLACE, place)
            row.update({
                "image_reference_status": "image_and_portrait_referenced",
                "photo_production_status": "three_local_webps_produced_from_museum_photo",
                "app_visual_review_status": "pending_native_app_mobile_and_crop",
                "image_rights_and_crop_approved": False,
                "pending": "inspect_real_native_portrait_hero_card_before_v1",
            })
            status["image_production_batch09"] = {
                "place_id": PID, "attempted": 1, "assets_produced": 3,
                "places_with_photo_triplet": 1, "held": 0,
                "sourcePage": MUSEUM, "sha256": hashlib.sha256(body).hexdigest(),
                "sourceSize": [image.width, image.height],
                "photoCopyright": "CC BY-SA per DigitaltMuseum; version unspecified",
                "app_visual_review": "pending", "v1_promoted": 0,
            }
            save(STATUS, status)
            result.update({"status": "produced", "sourceUsed": source,
                           "sha256": hashlib.sha256(body).hexdigest(),
                           "sourceSize": [image.width, image.height], "assets": paths})
            break
        except Exception as exc:
            result.setdefault("attempts", []).append({"url": source, "reason": str(exc)[:250]})
            for name in OUTPUTS:
                (OUT / f"{PID}_{name}.webp").unlink(missing_ok=True)
    else:
        result["status"] = "held_external_only"
        result["reason"] = "No source image with confirmed adequate bytes and resolution could be retrieved; retain honest remote reference."
    save(REPORT / "result.json", result)
    print(json.dumps({"place": PID, "photo_status": result["status"],
                      "assets": len(result.get("assets", {})), "review": "pending"}, ensure_ascii=False))
if __name__ == "__main__": main()
