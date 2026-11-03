#!/usr/bin/env python3
"""Integrate two *distinct* licensed documentary photographs of the related atelier quarter.
The photographed buildings are NOT claimed to be the public gallery entrance at Platous gate 18.
Rights provenance: each Wikimedia Commons page explicitly says Ssu / CC BY-SA 4.0.
"""
import io, json, hashlib, pathlib, urllib.request
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parent.parent
FOLDER=ROOT/"assets/places/oslo_prosjektrom"
FOLDER.mkdir(parents=True,exist_ok=True)
PHOTOS=[
    ("image","atelier_schweigaards_34a_header.webp","https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Schweigaards_gate_34A%2C_Oslo.jpg/1280px-Schweigaards_gate_34A%2C_Oslo.jpg","https://commons.wikimedia.org/wiki/File:Schweigaards_gate_34A,_Oslo.jpg",(1200,675),"34A","Beskåret til bredt PlaceCard-headerbilde"),
    ("frontImage","atelier_schweigaards_34c_portrait.webp","https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Schweigaards_gate_34C%2C_Oslo.jpg/1280px-Schweigaards_gate_34C%2C_Oslo.jpg","https://commons.wikimedia.org/wiki/File:Schweigaards_gate_34C,_Oslo.jpg",(800,1200),"34C","Beskåret til stående QuizCard-bilde")
]
def download(url):
    req=urllib.request.Request(url,headers={"User-Agent":"HistoryGoSourceArchive/1.0 (creative commons photo attribution)"})
    with urllib.request.urlopen(req,timeout=40) as response:
        data=response.read()
    if len(data)<50000:raise ValueError("Unexpectedly small source image")
    return data
place_path=ROOT/"data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json"
runtime_path=ROOT/"data/runtime/place-open/oslo_prosjektrom.json"
place=json.loads(place_path.read_text())
runtime=json.loads(runtime_path.read_text())
for field,name,url,source_page,size,address,transformation in PHOTOS:
    raw=download(url)
    im=Image.open(io.BytesIO(raw)).convert("RGB")
    if min(im.size)<900:raise ValueError("Unacceptable source resolution: "+repr(im.size))
    cropped=ImageOps.fit(im,size,method=Image.Resampling.LANCZOS,centering=(0.5,0.48))
    out=FOLDER/name
    cropped.save(out,format="WEBP",quality=83,method=6)
    with Image.open(out) as check:assert check.size==size and check.format=="WEBP"
    rel=out.relative_to(ROOT).as_posix()
    place[field]=rel
    place["imageMeta" if field=="image" else "frontImageMeta"]={
        "source":"wikimedia_commons","sourcePage":source_page,"creator":"Ssu",
        "credit":"Ssu / Wikimedia Commons","license":"CC BY-SA 4.0",
        "licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0/",
        "assetKind":"documentary_related_atelier_quarter_photo",
        "locationContext":"Schweigaards gate "+address+"; dette er ikke dokumentasjon av inngangen i Platous gate 18.",
        "transformation":transformation+" (WebP). Original fotografi 25. mai 2023.",
        "originHashSha256":hashlib.sha256(raw).hexdigest(),
        "localAssetHashSha256":hashlib.sha256(out.read_bytes()).hexdigest()
    }
    print(field,rel,size,len(out.read_bytes()),source_page)
place["cardImage"]=place["image"]
place["imageCredit"]="Ssu / Wikimedia Commons"
place["imageLicense"]="CC BY-SA 4.0"
place["imageLicenseUrl"]="https://creativecommons.org/licenses/by-sa/4.0/"
place["imageSourceUrl"]=PHOTOS[0][3]
place["imageCaption"]="Schweigaards gate 34A i Landbrukskvartalet, der tilknyttede kunstneratelier er dokumentert. Galleriets publikumsinngang er i Platous gate 18. Foto: Ssu (2023)."
place["frontImageCaption"]="Schweigaards gate 34C, i kvartalet ved Oslo Prosjektroms ateliermiljø. Ikke galleriets publikumsinngang. Foto: Ssu (2023)."
for key in ["image","cardImage","frontImage","imageCredit","imageLicense","imageLicenseUrl","imageSourceUrl","imageCaption","frontImageCaption","imageMeta","frontImageMeta"]:
    runtime["place"][key]=place[key]
place_path.write_text(json.dumps(place,ensure_ascii=False,indent=2)+"\n")
runtime_path.write_text(json.dumps(runtime,ensure_ascii=False,separators=(',',':'))+"\n")
