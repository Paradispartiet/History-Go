#!/usr/bin/env python3
"""Stage independently composed Commons-licensed wide/card/portrait assets for six canonical Kvadraturen Places.
This program does NOT grant v1 approval. It preserves each source original and attribution.
"""
from __future__ import annotations
from pathlib import Path
import io, json, urllib.request, time, os, math
from PIL import Image, ImageOps, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
ITEMS={
"den_gamle_krigsskolen":("data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/den_gamle_krigsskolen.json", (0.51,0.52),(0.49,0.54),(0.51,0.54)),
"garmanngarden":("data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/garmanngarden.json", (0.47,0.54),(0.46,0.56),(0.50,0.54)),
"stattholdergarden":("data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/stattholdergarden.json", (0.50,0.50),(0.52,0.52),(0.50,0.52)),
"hotel_du_nord":("data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/hotel_du_nord.json", (0.50,0.50),(0.52,0.53),(0.50,0.53)),
"cafe_engebret":("data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/cafe_engebret.json", (0.61,0.50),(0.76,0.52),(0.70,0.50)),
"treschowgarden":("data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/treschowgarden.json", (0.51,0.50),(0.51,0.52),(0.51,0.52)),
}
ALLOWED={"CC BY-SA 4.0","CC BY 4.0","CC BY 3.0","CC BY-SA 3.0","CC0","Public domain"}
AGENT="HistoryGoKvadraturenMediaReview/1.0 (https://github.com/Paradispartiet/History-Go; Commons attribution)"
def download(url):
    last=None
    for attempt in range(4):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"image/*"})
            with urllib.request.urlopen(req, timeout=45) as r:
                typ=r.headers.get("Content-Type","")
                if not typ.startswith("image/"): raise ValueError(f"Unexpected media type: {typ}")
                data=r.read(25_000_001)
                if not 10000<len(data)<25_000_000: raise ValueError(f"Image bytes not credible: {len(data)}")
                return data
        except Exception as exc:
            last=exc
            time.sleep(3*(attempt+1))
    raise RuntimeError(f"Failed licensed source image: {last}")
def crop(im,size,xy):
    return ImageOps.fit(im,size,method=Image.Resampling.LANCZOS,centering=xy)
def write_image(path,im):
    path.parent.mkdir(parents=True,exist_ok=True)
    im.save(path,format="WEBP",quality=87,method=6)
    if path.stat().st_size < 12000: raise ValueError(f"Too little visual information: {path}")
def main():
    photo={}
    # Validate and render ALL six before changing any Place JSON.
    for pid,(rel,wide,portrait,card) in ITEMS.items():
        p=json.loads((ROOT/rel).read_text())
        assert p["id"]==pid
        assert p["image"].startswith("https://upload.wikimedia.org/wikipedia/commons/")
        assert p["imageSourceUrl"].startswith("https://commons.wikimedia.org/wiki/File:")
        assert p["imageLicense"] in ALLOWED
        assert p["imageMeta"]["creator"] and p["imageMeta"]["license"]==p["imageLicense"]
        raw=download(p["image"])
        with Image.open(io.BytesIO(raw)) as im:
            im=ImageOps.exif_transpose(im).convert("RGB")
            if im.width<1150 or im.height<730:
                raise ValueError(f"{pid}: source only {im.width}x{im.height}; do not invent resolution")
            photo[pid]=dict(original=(im.width,im.height),license=p["imageLicense"],credit=p["imageCredit"],source=p["imageSourceUrl"],url=p["image"])
            for kind,dim,focal,relout in [
                ("hero",(1400,900),wide,f"bilder/places/{pid}_hero.webp"),
                ("portrait",(900,1350),portrait,f"bilder/places/{pid}_front_portrait.webp"),
                ("card",(900,600),card,f"bilder/kort/places/{pid}.webp")]:
                out=ROOT/relout
                write_image(out,crop(im,dim,focal))
                photo[pid][kind]=dict(path=relout,width=dim[0],height=dim[1],bytes=out.stat().st_size,focus=focal)
        print("COMPOSED",pid,photo[pid]["original"],flush=True)
    # Contact sheet: visually inspect all 18 crops before setting any v1 approval bit.
    cols,rows=6,3;tw,th=232,210
    contact=Image.new("RGB",(cols*tw,rows*th),(25,27,29))
    draw=ImageDraw.Draw(contact)
    ids=list(ITEMS)
    for i,pid in enumerate(ids):
        for row,kind in enumerate(["hero","portrait","card"]):
            with Image.open(ROOT/photo[pid][kind]["path"]) as im:
                thumb=ImageOps.contain(im.convert("RGB"),(214,168))
                x=i*tw+9+(214-thumb.width)//2;y=row*th+8+(168-thumb.height)//2
                contact.paste(thumb,(x,y))
            draw.text((i*tw+9,row*th+178),f"{pid[:23]} {kind}",fill=(230,230,230))
    preview=ROOT/"reports/place-production/oslo-kvadraturen-six-media-composition-preview-20261026.jpg"
    preview.parent.mkdir(parents=True,exist_ok=True)
    contact.save(preview,quality=86,optimize=True)
    # Stage metadata only after all images are present and high-enough resolution.
    for pid,(rel,wide,portrait,card) in ITEMS.items():
        file=ROOT/rel;p=json.loads(file.read_text())
        p["heroImage"]=photo[pid]["hero"]["path"]
        p["frontImage"]=photo[pid]["portrait"]["path"]
        p["cardImage"]=photo[pid]["card"]["path"]
        p["imageCard"]=p["cardImage"]
        p["imageComposition"]={
            "portraitPosition":f"{round(portrait[0]*100)}% {round(portrait[1]*100)}%",
            "heroPosition":f"{round(wide[0]*100)}% {round(wide[1]*100)}%",
            "cardPosition":f"{round(card[0]*100)}% {round(card[1]*100)}%",
            "portraitRatio":"3:4",
            "heroBehavior":"cover_with_subject_focal_point",
            "quizCardBehavior":"contain_never_crop",
            "reviewStatus":"contact_sheet_generated_visual_device_approval_pending"
        }
        p["frontImageMeta"]={**p["imageMeta"],"assetType":"documentary_place_portrait",
                             "orientation":"portrait","outputDimensions":"900x1350",
                             "transformation":"Independently cropped WebP from exact Commons original, no AI alteration."}
        p["cardImageMeta"]={**p["imageMeta"],"assetType":"documentary_place_quiz_card",
                            "outputDimensions":"900x600","transformation":"Separate editorial card composition from licensed original."}
        file.write_text(json.dumps(p,ensure_ascii=False,indent=2)+"\n")
        runtime=ROOT/f"data/runtime/place-open/{pid}.json"
        v=json.loads(runtime.read_text())
        obj=v.get("place",v)
        if obj.get("id")!=pid: raise ValueError("Runtime ID mismatch: "+pid)
        for k in ("heroImage","frontImage","cardImage","imageCard","imageComposition","frontImageMeta","cardImageMeta"):
            obj[k]=p[k]
        runtime.write_text(json.dumps(v,ensure_ascii=False,indent=2)+"\n")
    report={
        "schema":"history_go_kvadraturen_six_composition_v1","review_date":"2026-10-26",
        "numberOfPlaces":len(photo),"derivativeImages":len(photo)*3,
        "v1ApprovedPlaces":0,"visualReview":"pending_manual_contact_sheet_and_app_view",
        "method":"License-preserving documentary photo crops; unchanged original Wikimedia Commons image; separate hero/portrait/card. No upscaling source beneath resolution threshold.",
        "places":photo,"contact_sheet":"reports/place-production/oslo-kvadraturen-six-media-composition-preview-20261026.jpg"}
    (ROOT/"reports/place-production/oslo-kvadraturen-six-media-composition-audit-20261026.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("COMPOSED_SIX="+str(len(photo))+" DERIVATIVES="+str(len(photo)*3)+" REVIEW_PENDING",flush=True)
if __name__=="__main__":main()
