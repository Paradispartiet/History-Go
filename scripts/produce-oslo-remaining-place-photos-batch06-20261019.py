#!/usr/bin/env python3
"""Publish only Commons-licensed, place-identified photos into three separate WebP crops.

An image source is never treated as v1 acceptance. One bad source goes to the queue
without stopping other places. The workflow commits successful binary outputs.
"""
from __future__ import annotations
import hashlib, html, io, json, re, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "bilder/places/oslo-20-media-batch06-20261019"
REPORT = ROOT / "reports/oslo-20-media-batch06-20261019"
BATCH_PATH = ROOT / "data/places/production-tiers/v1-oslo-place-media-text-review-20261019-batch04.json"
UA = "HistoryGoOsloTwentyPhotoProduction/1.0 (public-source re-use; github.com/Paradispartiet/History-Go)"
SIZES = {"hero": (1400, 900), "portrait": (900, 1350), "card": (900, 600)}
SOURCES = [
    {"id":"akershus_kaier","path":"data/places/naeringsliv/oslo/places_naeringsliv/akershus_kaier.json",
     "file":"Oslo Havn - no-nb digifoto 20160222 00074 NB NS NM 06937.jpg",
     "author":"Narve Skarpmoen","license":"Public domain",
     "subject":"Søndre Akershuskai og Akershusutstikkeren, historisk havnefoto",
     "hero":(.49,.51),"portrait":(.52,.52),"card":(.49,.51)},
    {"id":"oslo_mek","path":"data/places/naeringsliv/oslo/places_naeringsliv/oslo_mek.json",
     "file":"Ships at Akers Mekaniske Verksted 1931 (NTM 86 2-2039).jpg",
     "author":"Hermann Christian Neupert","license":"Public domain",
     "subject":"Skip og verftsområde ved Akers mekaniske Verksted i 1931",
     "hero":(.51,.51),"portrait":(.50,.50),"card":(.51,.51)},
    {"id":"frysja_industriomrade","path":"data/places/naeringsliv/oslo/places_naeringsliv/frysja_industriomrade.json",
     "file":"Frysja.jpg","author":"Sean Hayford O'Leary","license":"CC BY 2.0",
     "subject":"Brekkefossen ved Frysja, vannkraftlandskapet som industriområdet vokste fram ved",
     "hero":(.50,.54),"portrait":(.52,.48),"card":(.50,.54)},
    {"id":"bryn_industriomrade","path":"data/places/naeringsliv/oslo/places_naeringsliv/bryn_industriomrade.json",
     "file":"Bryn teglverk (1933).jpg","author":"Anders Beer Wilse","license":"CC BY-SA 3.0",
     "subject":"Bryn Teglverk i 1933, dokumentarisk industrifoto fra Østensjøveien",
     "hero":(.50,.50),"portrait":(.50,.50),"card":(.50,.50)},
    {"id":"norges_varemesse","path":"data/places/naeringsliv/oslo/places_naeringsliv/norges_varemesse.json",
     "file":"Varemessen - no-nb digifoto 20150105 00001 NB MIT FNR 20402.jpg",
     "author":"Unknown author","license":"Public domain","preferOriginal":True,
     "subject":"Det historiske utstillingsanlegget til Norges Varemesse ved Sjølyst i 1962, før rivingen",
     "hero":(.50,.50),"portrait":(.50,.51),"card":(.50,.50)},
    {"id":"gronlikaia","path":"data/places/naeringsliv/oslo/places_naeringsliv/gronlikaia.json",
     "file":"OB.X0999 Grønlikaia (cropped).jpg","author":"Anders Beer Wilse","license":"CC BY-SA 4.0",
     "subject":"Skip fortøyd ved Grønlikaia i 1937, med Grønlia i forgrunnen",
     "hero":(.48,.53),"portrait":(.48,.53),"card":(.48,.53)}
]
ALLOWED = {"CC0","CC BY-SA 4.0","CC BY-SA 3.0","CC BY-SA 3.0 no","CC BY 4.0","Public domain","CC BY 2.0"}

def get(url, accept, limit=30_000_000):
    last=None
    for attempt in range(4):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":accept})
            with urllib.request.urlopen(req,timeout=65) as resp:
                body=resp.read(limit+1)
            if len(body)>limit: raise ValueError("Commons response exceeds download limit")
            return body
        except Exception as exc:
            last=exc
            if attempt>=3 or not any(v in str(exc).lower() for v in ("429","503","502","504","timed out","temporarily")):
                raise
            time.sleep(3*(attempt+1))
    raise last

def strip_tags(x):
    return html.unescape(re.sub("<[^>]+>","",str(x or ""))).strip()

# Commons image service: prefer a standard 1280px thumbnail over generating large 2800px thumbnails, to reduce 429 throttling.
def commons_info(entry):
    url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
        "action":"query","format":"json","formatversion":"2","prop":"imageinfo",
        "titles":"File:"+entry["file"],"iiprop":"url|extmetadata","iiurlwidth":"960"})
    data=json.loads(get(url,"application/json"))
    page=data["query"]["pages"][0]
    if "missing" in page or not page.get("imageinfo"): raise ValueError("Commons file missing")
    img=page["imageinfo"][0]
    md=img.get("extmetadata",{})
    license_name=strip_tags(md.get("LicenseShortName",{}).get("value","")).replace("CC-Zero","CC0").replace("CC Zero","CC0")
    artist=strip_tags(md.get("Artist",{}).get("value",""))
    if license_name not in ALLOWED or license_name!=entry["license"]:
        raise ValueError("Unapproved or changed source licence: "+repr(license_name))
    if entry["author"].casefold() not in artist.casefold():
        raise ValueError("Commons creator mismatch: "+repr(artist))
    return {"download":img["url"] if entry.get("preferOriginal") else img.get("thumburl") or img["url"],"author":artist,"license":license_name,
            "sourcePage":"https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(entry["file"].replace(" ","_"))}

def write_image(im, filename, size, focus):
    target=OUT/filename
    target.parent.mkdir(parents=True,exist_ok=True)
    out=ImageOps.fit(im,size,method=Image.Resampling.LANCZOS,centering=focus)
    out.save(target,format="WEBP",quality=86,method=6)
    with Image.open(target) as check:
        if check.size!=size or check.format!="WEBP":raise ValueError("WebP validation failed")
    if target.stat().st_size<8000:raise ValueError("WebP unexpectedly small")
    return str(target.relative_to(ROOT))

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    REPORT.mkdir(parents=True,exist_ok=True)
    results,held,tiles=[],[],[]
    work=json.loads(BATCH_PATH.read_text())
    byid={p["place_id"]:p for p in work["places"]}
    for entry in SOURCES:
        pid=entry["id"]
        place_path=ROOT/entry["path"]
        place=json.loads(place_path.read_text())
        if place.get("id")!=pid:raise RuntimeError("canonical ID mismatch: "+pid)
        files={kind:f"{pid}_{kind}.webp" for kind in SIZES}
        try:
            existing={kind:str((OUT/file).relative_to(ROOT)) for kind,file in files.items()}
            if all((ROOT/file).is_file() for file in existing.values()) and all([
                place.get("image")==existing["hero"],
                place.get("frontImage")==existing["portrait"],
                place.get("cardImage")==existing["card"],
                place.get("imageSourceUrl","").startswith("https://commons.wikimedia.org/wiki/File:"),
                bool(place.get("imageMeta",{}).get("license")),
                bool(place.get("frontImageMeta",{}).get("license")),
            ]):
                results.append({"place_id":pid,"image":existing["hero"],"frontImage":existing["portrait"],
                        "cardImage":existing["card"],"source":place["imageSourceUrl"],
                        "author":place["imageMeta"]["creator"],"license":place["imageMeta"]["license"],
                        "app_verified":False,"v1_promoted":False,
                        "source_sha256":"previously_verified_original"})
                print("PHOTO REUSED",pid,flush=True)
                continue
            if any((OUT/file).exists() for file in files.values()):
                raise ValueError("Refuse to overwrite incomplete or differently bound photo outputs")
            info=commons_info(entry)
            raw=get(info["download"],"image/*",limit=32_000_000)
            if len(raw)<5000:raise ValueError("Commons image download too small")
            with Image.open(io.BytesIO(raw)) as source:
                original=ImageOps.exif_transpose(source).convert("RGB")
            if original.width<780 or original.height<530:raise ValueError("source resolution insufficient for documented crop")
            source_dimensions=[original.width, original.height]
            low_resolution=original.width<1400 or original.height<1000
            output={}
            for kind,size in SIZES.items():
                focus=entry[kind]
                output[kind]=write_image(original,files[kind],size,focus)
            place["image"]=output["hero"]
            place["frontImage"]=output["portrait"]
            place["cardImage"]=output["card"]
            place["imageCard"]=output["card"]
            place["imageCaption"]=entry["subject"]+". Fotograf: "+info["author"]+"."
            place["imageCredit"]=info["author"]+" / Wikimedia Commons"
            place["imageLicense"]=info["license"]
            place["imageSourceUrl"]=info["sourcePage"]
            place["imageSourceDimensions"]=source_dimensions
            place["sourceResolutionNote"]="Historic photo upscaled for hero/portrait; inspect sharpness before any v1 approval" if low_resolution else "Original is large enough for all three crops"
            place["imageMeta"]={
                "source":"wikimedia_commons","sourcePage":info["sourcePage"],
                "creator":info["author"],"credit":place["imageCredit"],"license":info["license"],
                "assetType":"documentary_place_photo","verifiedAt":"2026-10-19",
                "transformation":"Independent subject-led hero and thumbnail crops, 1400x900 and 900x600 WebP."
            }
            place["frontImageMeta"]={**place["imageMeta"],
                "assetType":"documentary_place_portrait","orientation":"portrait",
                "outputDimensions":"900x1350",
                "transformation":"Independently composed portrait crop, 900x1350 WebP, from the licensed original."}
            place["imageComposition"]={
                "portraitPosition":"50% 50%","heroPosition":"50% 50%",
                "portraitRatio":"2:3","heroBehavior":"cover_with_subject_focal_point",
                "quizCardBehavior":"contain_never_crop"}
            place_path.write_text(json.dumps(place,ensure_ascii=False,indent=2)+"\n")
            row=byid[pid]
            row["image_reference_status"]="image_and_portrait_referenced"
            row["photo_production_status"]="source_license_verified_three_webps_written"
            row["image_rights_and_crop_approved"]=False
            row["app_visual_review_status"]="pending_native_placecard_and_mobile_review"
            row["photo_source"]=info["sourcePage"]
            result={"place_id":pid,"image":output["hero"],"frontImage":output["portrait"],
                    "cardImage":output["card"],"source":info["sourcePage"],
                    "author":info["author"],"license":info["license"],
                    "source_sha256":hashlib.sha256(raw).hexdigest(),
                    "source_dimensions":source_dimensions,"low_resolution_historical_image":low_resolution,
                    "app_verified":False,"v1_promoted":False}
            results.append(result)
            print("PHOTO PRODUCED",pid,info["license"],flush=True)
        except Exception as exc:
            for file in files.values(): (OUT/file).unlink(missing_ok=True)
            held.append({"place_id":pid,"reason":str(exc)[:280]})
            print("PHOTO HELD",pid,str(exc)[:180],flush=True)
        time.sleep(2.5)
    for item in results:
        pid=item["place_id"]
        with Image.open(ROOT/item["frontImage"]) as p, Image.open(ROOT/item["image"]) as h:
            tiles.append((pid,p.convert("RGB").copy(),h.convert("RGB").copy()))
    if tiles:
        w,h=280,456
        sheet=Image.new("RGB",(w*len(tiles),h),(19,23,29))
        draw=ImageDraw.Draw(sheet)
        for i,(pid,p,hero) in enumerate(tiles):
            x=i*w
            sheet.paste(ImageOps.fit(p,(244,342)),(x+18,16))
            sheet.paste(ImageOps.fit(hero,(244,69)),(x+18,366))
            draw.text((x+18,438),pid,fill=(245,226,181))
        sheet.save(REPORT/"crop-contact-sheet.jpg",quality=88)
    work["image_production_batch06"]={
        "attempted":len(SOURCES),"assets_produced":len(results)*3,
        "places_with_photo_triplet":len(results),"held":len(held),
        "app_visual_review":"pending","v1_promoted":0}
    work["no_image_refs"]=sum(p.get("image_reference_status")=="no_image" for p in work["places"])
    work["image_and_portrait_refs"]=sum(p.get("image_reference_status")=="image_and_portrait_referenced" for p in work["places"])
    BATCH_PATH.write_text(json.dumps(work,ensure_ascii=False,indent=2)+"\n")
    backlog_path=ROOT/"data/places/place_image_backlog_summary.json"
    backlog=json.loads(backlog_path.read_text())
    n=len([r for r in results if r["source_sha256"]!="previously_verified_original"])
    backlog["generatedAt"]="2026-10-19"
    backlog["generatedFromCommit"]="oslo-20-media-batch06-20261019"
    backlog["summary"]["validLocal"]+=n
    backlog["summary"]["missing"]-=n
    backlog["summary"]["remaining"]-=n
    backlog["byCategory"]["naeringsliv"]["valid"]+=n
    backlog["byCategory"]["naeringsliv"]["missing"]-=n
    backlog_path.write_text(json.dumps(backlog,ensure_ascii=False,indent=2)+"\n")
    report={"schema":"historygo_oslo_twenty_photo_batch06_v1","date":"2026-10-19",
            "produced":results,"held":held,"new_v1":0,
            "held_for_subject_or_rights":["tollbukaia","vippetangen_fisketorg"],
            "note":"No photo substitute for Tollbukaia, the 1933 Fiskehall, or demolished Sjølystsenteret; do not use customs house, 1905 hall or unlicensed performance photograph. Browser and crop review pending."}
    (REPORT/"result.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("FINISHED",json.dumps({"produced":len(results),"held":len(held),"assets":len(results)*3}),flush=True)
    if not results:raise SystemExit("No photographs produced; refuse empty publication")

if __name__=="__main__":main()
