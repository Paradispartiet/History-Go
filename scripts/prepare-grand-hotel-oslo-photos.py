#!/usr/bin/env python3
"""Produce documented, non-generative Grand Hotel Oslo photo variants."""
import hashlib
import io
import json
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
PLACE=ROOT/"data/places/media/oslo/grand_hotel.json"
STEM="bilder/places/grand-hotel-20261027/grand_hotel"
SOURCES={
 "hero":{
  "file":"Grand Hotel Oslo, 2024.jpg","creator":"Ssu","date":"2024-12-13",
  "license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0/",
  "sourcePage":"https://commons.wikimedia.org/wiki/File:Grand_Hotel_Oslo,_2024.jpg",
 },
 "portrait":{
  "file":"The Grand Hotel, Oslo.jpg","creator":"James Cridland","date":"2006-10-21",
  "license":"CC BY 2.0","licenseUrl":"https://creativecommons.org/licenses/by/2.0/",
  "sourcePage":"https://commons.wikimedia.org/wiki/File:The_Grand_Hotel,_Oslo.jpg",
 }
}
HEADERS={"User-Agent":"HistoryGoDocumentaryPhotoImporter/1.0 (contact via github.com/Paradispartiet/History-Go)"}

def source_image(record):
    params=urllib.parse.urlencode({"action":"query","format":"json","prop":"imageinfo","iiprop":"url|extmetadata","titles":"File:"+record["file"]})
    req=urllib.request.Request("https://commons.wikimedia.org/w/api.php?"+params,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=50) as reply:
        metadata=json.load(reply)
    entry=next(iter(metadata["query"]["pages"].values()))
    info=(entry.get("imageinfo") or [None])[0]
    if not info:
        raise ValueError("Missing source photo "+record["file"])
    source_license=info.get("extmetadata",{}).get("LicenseShortName",{}).get("value","")
    if record["license"].replace(" ","").lower() not in source_license.replace(" ","").lower():
        raise ValueError(f"License mismatch: expected {record['license']}, Commons reported {source_license!r}")
    with urllib.request.urlopen(urllib.request.Request(info["url"],headers=HEADERS),timeout=120) as r:
        raw=r.read()
    if len(raw)<100000:
        raise ValueError("Too small source")
    img=ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGB")
    if min(img.size)<1300:
        raise ValueError("Source resolution too small")
    return img,hashlib.sha256(raw).hexdigest()

def save(src,path,size,centering):
    dest=ROOT/path
    dest.parent.mkdir(parents=True,exist_ok=True)
    cropped=ImageOps.fit(src,size,method=Image.Resampling.LANCZOS,centering=centering)
    cropped.save(dest,"WEBP",quality=89,method=6)
    if Image.open(dest).size!=size:
        raise ValueError("Wrong dimensions")
    print(path, size, dest.stat().st_size)

def meta(record,source_sha,transformation):
    return {
      "source":"wikimedia_commons","sourcePage":record["sourcePage"],"creator":record["creator"],
      "credit":record["creator"]+" / Wikimedia Commons",
      "license":record["license"],"licenseUrl":record["licenseUrl"],
      "date":record["date"],"sourceSha256":source_sha,
      "assetType":"documentary_place_photo","verifiedAt":"2026-10-27",
      "transformation":transformation
    }

def main():
    hero=STEM+"_hero.webp"
    front=STEM+"_portrait.webp"
    card=STEM+"_card.webp"
    current=json.loads(PLACE.read_text(encoding="utf-8"))
    if current.get("id")!="grand_hotel":
        raise ValueError("Canonical Grand Hotel identity changed")
    # The documentary assets may already have been materialized by a previous run.
    # Do not redownload or overwrite a valid, credited set just to sync cardImage.
    if current.get("image")==hero and current.get("frontImage")==front:
        for path,size in ((hero,(1400,900)),(front,(900,1350)),(card,(900,600))):
            file=ROOT/path
            if not file.is_file():
                raise ValueError("Missing documentary asset: "+path)
            with Image.open(file) as image:
                if image.format!="WEBP" or image.size!=size:
                    raise ValueError("Invalid documentary asset: "+path)
        if current.get("imageMeta",{}).get("sourcePage")!=SOURCES["hero"]["sourcePage"] or current.get("frontImageMeta",{}).get("sourcePage")!=SOURCES["portrait"]["sourcePage"]:
            raise ValueError("Existing image metadata differs from reviewed Commons sources")
        current["cardImage"]=card
        PLACE.write_text(json.dumps(current,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("Grand Hotel licensed image assets validated; cardImage synchronized")
        return
    if current.get("image") or current.get("frontImage") or current.get("cardImage"):
        raise ValueError("Unexpected pre-existing image pointer; review before importing")
    landscape,land_sha=source_image(SOURCES["hero"])
    portrait,port_sha=source_image(SOURCES["portrait"])
    save(landscape,hero,(1400,900),(0.50,0.50))
    save(portrait,front,(900,1350),(0.50,0.50))
    save(landscape,card,(900,600),(0.50,0.50))
    p=json.loads(PLACE.read_text(encoding="utf-8"))
    if p["id"]!="grand_hotel" or p.get("image") or p.get("frontImage"):
        raise ValueError("Canonical identity changed or image already set; inspect before overwrite")
    p["image"]=hero
    p["frontImage"]=front
    p["cardImage"]=card
    p["imageCredit"]=SOURCES["hero"]["creator"]+" / Wikimedia Commons"
    p["imageLicense"]=SOURCES["hero"]["license"]
    p["imageSourceUrl"]=SOURCES["hero"]["sourcePage"]
    p["imageMeta"]=meta(SOURCES["hero"],land_sha,"1400x900 documentary crop, 900x600 card")
    p["frontImageMeta"]=meta(SOURCES["portrait"],port_sha,"900x1350 documentary portrait crop")
    p["imageComposition"]={
        "heroPosition":"50% 50%","portraitPosition":"50% 50%","portraitRatio":"2:3",
        "heroBehavior":"cover_with_subject_focal_point","quizCardBehavior":"contain_never_crop"
    }
    PLACE.write_text(json.dumps(p,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Grand Hotel documentary photos and provenance written to existing canonical Place")

if __name__=="__main__":
    main()
