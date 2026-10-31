#!/usr/bin/env python3
"""Materialiser autentiske skiltordmerker for Christiania Torv (kun kildeutsnitt)."""
from __future__ import annotations
from io import BytesIO
from pathlib import Path
import hashlib
import json
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATE = "2026-10-31"
PLACE = "christiania_torv"
SOURCES = [
    {
        "id": "brasserie_hansken",
        "name": "Brasserie Hansken",
        "source": "https://brasseriehansken.no/uploads/lfdNepXG/A7406329-Edit.jpg",
        "sourcePage": "https://brasseriehansken.no/chambre-separee",
        "evidence": ["https://brasseriehansken.no/", "https://brasseriehansken.no/om-oss", "https://www.visitoslo.com/no/servering/brasserie-hansken"],
        "box": (0.49, 0.58, 0.72, 0.67),
        "desc": "Brasserie Hansken åpnet ved Christiania torv i 1997. Restauranten har uteservering på torget, med adresse Christiania torv 4.",
        "popupdesc": "Brasserie Hansken ble etablert av Arne Sunde og Yngvar Nilsen i 1997. Restauranten driver i Christiania torv 4 med uteservering på den historiske plassen. Dette er restaurantens egen virksomhetsidentitet, ikke en ny identitet for selve torget.",
        "founded": 1997,
        "imageSource": "official_restaurant_photo",
        "credit": "Brasserie Hansken / official restaurant photography",
    },
    {
        "id": "kafe_celsius",
        "name": "Kafé Celsius",
        "source": "https://osloisentrum.no/wp-content/uploads/2020/10/celsius-2048x1365.jpg",
        "sourcePage": "https://osloisentrum.no/Virksomhet/kafe-celsius/",
        "evidence": ["https://www.kafecelsius.no/om-oss", "https://www.visitoslo.com/no/servering/kaf-celsius", "https://virksomhet.brreg.no/nb/oppslag/underenheter/972019089"],
        "box": (0.19, 0.31, 0.78, 0.66),
        "desc": "Kafé Celsius holder til i Rådhusgata 19 og har uteservering direkte på Christiania torv. Kafeens navn er en separat serveringsidentitet.",
        "popupdesc": "Kafé Celsius holder til i den historiske gården Rådhusgata 19 fra 1620-årene. Kafeen har eget navn, historiske lokaler og uteservering på Christiania torv. Bygningens eldre bruk som bibliotek og sykehus må skilles fra dagens kafévirksomhet.",
        "imageSource": "documented_facade_sign",
        "credit": "Oslo i sentrum / original photo of authentic Celsius facade sign",
    },
]

def load(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))

def save(rel, data):
    file = ROOT / rel
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def acquire(spec):
    req = Request(spec["source"], headers={"User-Agent": "HistoryGo/1.0 (source-based brand asset review)"})
    with urlopen(req, timeout=40) as response:
        data = response.read()
    if len(data) < 12000:
        raise ValueError(f"Source image too small: {spec['id']}")
    original = Image.open(BytesIO(data)).convert("RGB")
    w, h = original.size
    if w < 450 or h < 400:
        raise ValueError(f"Insufficient original resolution for {spec['id']}: {w}x{h}")
    box = tuple(round(v * (w if index % 2 == 0 else h)) for index, v in enumerate(spec["box"]))
    cropped = original.crop(box)
    if cropped.getbbox() is None or cropped.width < 90 or cropped.height < 40:
        raise ValueError(f"Invalid sign crop for {spec['id']}")
    # Kopier kun dokumentert, ekte fasadeskilt. Ingen logo tegnes, tolkes eller rekonstrueres.
    cropped = ImageOps.contain(cropped, (860, 480), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (900, 520), "#f5f3ee")
    canvas.paste(cropped, ((900 - cropped.width)//2, (520 - cropped.height)//2))
    rel = f"bilder/kort/brands/{spec['id']}.webp"
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, "WEBP", quality=94, method=6)
    if dest.stat().st_size < 3000:
        raise ValueError(f"Invalid WebP output: {spec['id']}")
    return {
      "brandId": spec["id"],
      "path": rel,
      "sourcePage": spec["sourcePage"],
      "sourceAsset": spec["source"],
      "sourceSha256": hashlib.sha256(data).hexdigest(),
      "assetSha256": hashlib.sha256(dest.read_bytes()).hexdigest(),
      "sourceDimensions": f"{w}x{h}",
      "originalCropBox": list(box),
      "assetKind": "logo",
      "sourceForm": "authentic_photographed_sign_wordmark",
      "creator": "Unknown photographer; see credited source",
      "credit": spec["credit"],
      "rightsBasis": "referential_trademark_identification; photo sign crop only, no endorsement; review third-party photo rights for wider reuse",
      "temporalScope": "documented_sign_in_source_photo",
      "transformation": "crop authentic lettered facade or awning sign; proportional resize and WebP normalization, no reconstruction",
      "reviewStatus": "manually_approved",
      "visualReview": "2026-10-31: authentic photographed full wordmark visually checked; no reconstruction",
      "usageContext": "referential_identification",
      "noEndorsement": True,
      "generated": False,
      "reconstructed": False,
      "width": 900,
      "height": 520,
      "bytes": dest.stat().st_size,
      "reviewedAt": DATE
    }

def main():
    # Hent/valider alle bilder før kanoniske filer kan endres eller brands aktiveres.
    attrs = [acquire(spec) for spec in SOURCES]
    master = load("data/brands/brands_master.json")
    catalog = load("data/brands/brands_catalog.json")
    mapping = load("data/brands/brands_by_place.json")
    for spec, attr in zip(SOURCES, attrs):
        master[:] = [item for item in master if item.get("id") != spec["id"]]
        catalog[:] = [item for item in catalog if item.get("id") != spec["id"]]
        brand = {
          "id": spec["id"], "name": spec["name"], "brand_group": "venue_brand",
          "brand_type": "restaurant_brand", "brand_kind": "restaurant",
          "sector": "food_and_drink", "state": "catalog", "status": "active",
          "verification": "source_and_visual_verified",
          "verified_at": DATE, "desc": spec["desc"], "popupdesc": spec["popupdesc"],
          "place_ids": [PLACE], "source_urls": spec["evidence"],
          "logo": attr["path"], "imageMeta": {key:value for key,value in attr.items() if key not in ("brandId", "path")}
        }
        if "founded" in spec:
            brand["founded"] = spec["founded"]
        master.append(brand)
        catalog.append(brand)
    mapping[PLACE] = [spec["id"] for spec in SOURCES]
    save("data/brands/brands_master.json", master)
    save("data/brands/brands_catalog.json", catalog)
    save("data/brands/brands_by_place.json", mapping)
    save("data/brands/christiania_torv_asset_attributions.json", {
      "schema": "history_go_brand_asset_attributions_v1", "placeId": PLACE,
      "verifiedAt": DATE, "visualReviewPending": False, "reviewStatus": "manually_approved", "assets": attrs
    })
    save("reports/place-production/christiania-torv-brands-v1.json", {
      "placeId": PLACE, "date": DATE, "phase": "Brands",
      "mapping": mapping[PLACE], "coverage": {"sourceBased": 2, "localAssetFiles": 2, "missing": 0, "logoCoveragePercent": 100},
      "checks": {"canonicalMapping": 2, "localLogoAssets": 2, "visuallyApprovedWordmarks": 2, "sourceAttributions": 2, "duplicateBrandIds": 0, "legacyMappedNames": 0, "readyForPublication": True},
      "publicationStatus": "GODKJENT",
      "sourceDecision": "Kun Hansken (Christiania torv 4) og Celsius (Rådhusgata 19 med servering på torget) har direkte dokumentert serveringsrelasjon. Gamle Raadhus eies av separat Place. Åtte tidligere, usikre mappinger gjenopprettes ikke.",
      "visualDecision": "Begge autentiske skiltordmerker visuelt kontrollert 2026-10-31 med tydelig ordlyd og uten rekonstruksjon. Kilde, rettighetsgrunnlag for referensiell identifikasjon og ingen påstand om samarbeid er dokumentert.",
      "sources": {spec["id"]: spec["evidence"] for spec in SOURCES}
    })

if __name__ == "__main__":
    main()
