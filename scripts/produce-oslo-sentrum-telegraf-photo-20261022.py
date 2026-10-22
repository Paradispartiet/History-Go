#!/usr/bin/env python3
"""Materialize a single attributed Commons facade portrait for this account's Oslo sentrum branch.

The source is SHA-1 pinned to the original verified Wikimedia Commons upload. No other
Places or the other ChatGPT account's Oslo batch are within scope.
"""
from __future__ import annotations
import hashlib
import io
import json
import time
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
URL = "https://upload.wikimedia.org/wikipedia/commons/b/b6/Telegrafbygningen_Kongens_gate_21A_21B_21C.jpg"
SOURCE_PAGE = "https://commons.wikimedia.org/wiki/File:Telegrafbygningen_Kongens_gate_21A_21B_21C.jpg"
SOURCE_SHA1 = "d80326c40d8dc535c32838742b14eba36eb88971"
PLACE_FILE = ROOT / "data/places/naeringsliv/oslo/places_naeringsliv/telegrafbygningen.json"
OUT = ROOT / "bilder/places/telegrafbygningen_front_portrait.webp"
UA = "HistoryGo-Sentrum-PlacePhoto/1.0 (public Commons attribution; https://github.com/Paradispartiet/History-Go)"

def download():
    error = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(URL, headers={"User-Agent": UA, "Accept": "image/jpeg"})
            with urllib.request.urlopen(request, timeout=40) as response:
                body = response.read(8_000_000)
                content_type = response.headers.get("Content-Type", "").lower()
            if not content_type.startswith("image/jpeg"):
                raise ValueError(f"Commons did not provide a JPEG: {content_type}")
            if hashlib.sha1(body).hexdigest() != SOURCE_SHA1:
                raise ValueError("Commons source SHA-1 mismatch; refusing to publish")
            return body
        except Exception as exc:
            error = exc
            if attempt < 2:
                time.sleep(3 + attempt * 3)
    raise RuntimeError(f"Verified Commons original unavailable: {error}")

def main():
    place = json.loads(PLACE_FILE.read_text(encoding="utf-8"))
    if place.get("id") != "telegrafbygningen":
        raise ValueError("This script may only modify Telegrafbygningen")
    if not any(x.get("url") == SOURCE_PAGE for x in place.get("externalLinks", [])):
        raise ValueError("Missing canonical Wikimedia attribution link")
    raw = download()
    with Image.open(io.BytesIO(raw)) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        if im.size != (3712, 5417):
            raise ValueError(f"Unrecognized Commons source dimensions: {im.size}")
        portrait = ImageOps.fit(im, (900, 1200), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    portrait.save(OUT, format="WEBP", quality=88, method=6)
    if OUT.stat().st_size < 20_000:
        raise ValueError("Produced portrait is implausibly small")
    with Image.open(OUT) as check:
        if check.format != "WEBP" or check.size != (900, 1200):
            raise ValueError("Invalid WebP output")
    place["frontImage"] = str(OUT.relative_to(ROOT)).replace("\\", "/")
    place["frontImageMeta"] = {
        "source": "wikimedia_commons",
        "sourcePage": SOURCE_PAGE,
        "creator": "Helge Høifødt",
        "credit": "Helge Høifødt / Wikimedia Commons",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
        "originalDimensions": "3712x5417",
        "outputDimensions": "900x1200",
        "orientation": "portrait",
        "aspectRatio": "3:4",
        "assetType": "documentary_place_photo",
        "sourceDate": "2026-07-01",
        "verifiedAt": "2026-10-22",
        "delivery": "local_webp_licensed",
        "sourceSha1": SOURCE_SHA1,
        "sourceSha256": hashlib.sha256(raw).hexdigest(),
        "outputSha256": hashlib.sha256(OUT.read_bytes()).hexdigest(),
        "transformation": "Stedstro 3:4-beskjæring og WebP-normalisering, ingen generativ endring.",
        "reviewStatus": "pending_native_mobile_desktop_and_editorial",
    }
    # Keep image rights auditable: retire unproven legacy PNGs from both
    # display slots. Reuse the SHA-verified Commons portrait rather than
    # assigning any speculative license to the old images.
    place["image"] = place["frontImage"]
    place["cardImage"] = place["frontImage"]
    place["imageMeta"] = dict(place["frontImageMeta"])
    place["imageMeta"]["transformation"] = (
        "Samme verifiserte 3:4-WebP som frontfoto; brukes som hovedbilde."
    )
    place["cardImageMeta"] = dict(place["frontImageMeta"])
    place["cardImageMeta"]["transformation"] = (
        "Samme verifiserte 3:4-WebP som frontfoto; eventuell visningsbeskjæring styres av kortet."
    )
    place.setdefault("imageComposition", {})["portraitPosition"] = "50% 50%"
    place["imageComposition"]["portraitRatio"] = "3:4"
    place["imageComposition"]["portraitFit"] = "cover"
    PLACE_FILE.write_text(json.dumps(place, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print("PHOTO_PRODUCED", place["frontImage"], OUT.stat().st_size, hashlib.sha256(OUT.read_bytes()).hexdigest())

if __name__ == "__main__":
    main()
