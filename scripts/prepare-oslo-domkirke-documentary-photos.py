#!/usr/bin/env python3
"""Prepare verified CC BY-SA 4.0 Oslo domkirke photos; no generative alterations."""
import hashlib
import io
import json
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PLACE = ROOT / "data/places/by/oslo/oslo_domkirke/oslo_domkirke.json"
SOURCES = {
    "hero": {
        "name": "OSLO DOMKIRKE CATHEDRAL Lutheran cruciform korskirke 1697 (restored c 1850 1950 2010) Stortorvet Oslo Norway Fasade mot sør Southern facade Tårn tower Nakne trær mars 2022-03-03 IMG 0025.jpg",
        "page": "https://commons.wikimedia.org/wiki/File:OSLO_DOMKIRKE_CATHEDRAL_Lutheran_cruciform_korskirke_1697_(restored_c_1850_1950_2010)_Stortorvet_Oslo_Norway_Fasade_mot_s%C3%B8r_Southern_facade_T%C3%A5rn_tower_Nakne_tr%C3%A6r_mars_2022-03-03_IMG_0025.jpg",
        "author": "Wolfmann",
        "date": "2022-03-03",
    },
    "portrait": {
        "name": "Oslo Domkirke, 2024.jpg",
        "page": "https://commons.wikimedia.org/wiki/File:Oslo_Domkirke,_2024.jpg",
        "author": "Ssu",
        "date": "2024-08-08",
    },
}

def download(source):
    params = urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url", "titles": "File:" + source["name"],
    })
    headers = {"User-Agent": "HistoryGoMediaResearch/1.0 (source-credited Oslo history app)"}
    url = "https://commons.wikimedia.org/w/api.php?" + params
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=40) as res:
        data = json.load(res)
    record = next(iter(data["query"]["pages"].values()))
    if "imageinfo" not in record:
        raise ValueError("Wikimedia file missing: " + source["name"])
    download_url = record["imageinfo"][0]["url"]
    with urllib.request.urlopen(urllib.request.Request(download_url, headers=headers), timeout=90) as res:
        raw = res.read()
    if len(raw) < 100000:
        raise ValueError("Unexpected short photo: " + source["name"])
    im = Image.open(io.BytesIO(raw))
    im.verify()
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGB")
    return im, hashlib.sha256(raw).hexdigest()

def render(src, name, dimensions, centering):
    dest = ROOT / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    ImageOps.fit(src, dimensions, method=Image.Resampling.LANCZOS,
                 centering=centering).save(dest, "WEBP", quality=89, method=6)
    if Image.open(dest).size != dimensions:
        raise ValueError("Bad image dimensions: " + str(dest))
    print(name, dimensions, dest.stat().st_size)

def source_meta(src, sha, transformation):
    return {
        "source": "wikimedia_commons", "sourcePage": src["page"],
        "creator": src["author"], "credit": src["author"] + " / Wikimedia Commons",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
        "date": src["date"], "sourceSha256": sha,
        "assetType": "documentary_place_photo", "verifiedAt": "2026-10-27",
        "transformation": transformation,
    }

def main():
    landscape, sha_landscape = download(SOURCES["hero"])
    portrait, sha_portrait = download(SOURCES["portrait"])
    hero = "bilder/places/oslo-domkirke-20261027/oslo_domkirke_hero.webp"
    front = "bilder/places/oslo-domkirke-20261027/oslo_domkirke_portrait.webp"
    card = "bilder/places/oslo-domkirke-20261027/oslo_domkirke_card.webp"
    render(landscape, hero, (1400, 900), (0.52, 0.52))
    render(portrait, front, (900, 1350), (0.50, 0.50))
    render(landscape, card, (900, 600), (0.52, 0.52))
    place = json.loads(PLACE.read_text(encoding="utf-8"))
    assert place["id"] == "oslo_domkirke"
    place["image"] = hero
    place["frontImage"] = front
    place["cardImage"] = card  # Keep legacy card consumers working.
    place["imageCredit"] = "Wolfmann / Wikimedia Commons"
    place["imageLicense"] = "CC BY-SA 4.0"
    place["imageSourceUrl"] = SOURCES["hero"]["page"]
    place["imageMeta"] = source_meta(SOURCES["hero"], sha_landscape,
                                   "Documentary landscape crop 1400x900; separate 900x600 card")
    place["frontImageMeta"] = source_meta(SOURCES["portrait"], sha_portrait,
                                        "Distinct documentary portrait crop 900x1350")
    place["imageComposition"] = {
        "heroPosition": "52% 52%", "portraitPosition": "50% 50%",
        "portraitRatio": "2:3", "heroBehavior": "cover_with_subject_focal_point",
        "quizCardBehavior": "contain_never_crop",
    }
    PLACE.write_text(json.dumps(place, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Verified documentary media linked to canonical Oslo domkirke")

if __name__ == "__main__":
    main()
