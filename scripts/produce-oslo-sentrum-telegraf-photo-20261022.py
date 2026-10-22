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
HERO_OUT = ROOT / "bilder/places/telegrafbygningen_hero.webp"
CARD_OUT = ROOT / "bilder/kort/places/telegrafbygningen_card.webp"
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
        hero = ImageOps.fit(im, (1400, 900), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        card = ImageOps.fit(im, (900, 600), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    portrait.save(OUT, format="WEBP", quality=88, method=6)
    HERO_OUT.parent.mkdir(parents=True, exist_ok=True)
    CARD_OUT.parent.mkdir(parents=True, exist_ok=True)
    hero.save(HERO_OUT, format="WEBP", quality=88, method=6)
    card.save(CARD_OUT, format="WEBP", quality=88, method=6)
    if OUT.stat().st_size < 20_000:
        raise ValueError("Produced portrait is implausibly small")
    with Image.open(OUT) as check:
        if check.format != "WEBP" or check.size != (900, 1200):
            raise ValueError("Invalid WebP output")
    for asset, size in ((HERO_OUT, (1400, 900)), (CARD_OUT, (900, 600))):
        if asset.stat().st_size < 20_000:
            raise ValueError(f"Produced image too small: {asset}")
        with Image.open(asset) as check:
            if check.format != "WEBP" or check.size != size:
                raise ValueError(f"Invalid WebP image: {asset}")
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
    # Three separate, provenance-bound physical crops; never invent a
    # license for the old Telegraf PNG. Editorial crop approval is separate.
    place["image"] = str(HERO_OUT.relative_to(ROOT)).replace("\\", "/")
    place["cardImage"] = str(CARD_OUT.relative_to(ROOT)).replace("\\", "/")
    place["imageMeta"] = dict(place["frontImageMeta"])
    place["imageMeta"]["outputDimensions"] = "1400x900"
    place["imageMeta"]["orientation"] = "landscape"
    place["imageMeta"]["aspectRatio"] = "14:9"
    place["imageMeta"]["outputSha256"] = hashlib.sha256(HERO_OUT.read_bytes()).hexdigest()
    place["imageMeta"]["transformation"] = "Eget 1400x900 fasadeutsnitt fra verifisert fotografi; WebP, ingen generativ endring."
    place["cardImageMeta"] = dict(place["frontImageMeta"])
    place["cardImageMeta"]["outputDimensions"] = "900x600"
    place["cardImageMeta"]["orientation"] = "landscape"
    place["cardImageMeta"]["aspectRatio"] = "3:2"
    place["cardImageMeta"]["outputSha256"] = hashlib.sha256(CARD_OUT.read_bytes()).hexdigest()
    place["cardImageMeta"]["transformation"] = "Eget 900x600 kortutsnitt fra verifisert fotografi; WebP, ingen generativ endring."
    place.setdefault("imageComposition", {})["portraitPosition"] = "50% 50%"
    place["imageComposition"]["portraitRatio"] = "3:4"
    place["imageComposition"]["portraitFit"] = "cover"
    PLACE_FILE.write_text(json.dumps(place, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print("PHOTO_PRODUCED", place["frontImage"], OUT.stat().st_size, hashlib.sha256(OUT.read_bytes()).hexdigest())

if __name__ == "__main__":
    main()
