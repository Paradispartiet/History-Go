#!/usr/bin/env python3
"""Contact sheet of five genuine Norwegian science v2 sources + 20 text candidates."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT=Path(__file__).resolve().parents[1]
plan=json.loads((ROOT/"data/badges/vitenskap_v2_localization_20261112.json").read_text("utf8"))
cols=["nb","en","es","pt","fr"]
ids=[x["id"] for x in plan["items"]]
labels={"informasjonsteknologi":"Informasjonsteknologi",
        "matematikk":"Matematikk",
        "forskning_og_metode":"Forskning og metode",
        "astronomi_og_fysikk":"Astronomi og fysikk",
        "kjemi_og_materialvitenskap":"Kjemi og materialvitenskap"}
W=1480
margin=35
cell=280
gap=9
sheet=Image.new("RGB",(W,1650),(20,18,36))
draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",18)
font_bold=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",22)
title=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",35)
draw.text((42,25),"VITENSKAP & TEKNOLOGI · V2 · SPRÅKKANDIDATER",font=title,fill=(235,225,250))
for c,lang in enumerate(cols):
    draw.text((margin+c*(cell+gap)+102,84),lang.upper(),font=font_bold,fill=(194,169,255))
for idx,item in enumerate(plan["items"]):
    y=130+idx*302
    for col,lang in enumerate(cols):
        x=margin+col*(cell+gap)
        if lang=="nb":
            path=item["sourceNorwegianCandidate"]["path"]
        else:
            path="bilder/merker/vitenskap/kandidater/locales/"+lang+"/"+item["id"]+"-v2.webp"
        with Image.open(ROOT/path) as src:
            icon=src.convert("RGBA")
        icon.thumbnail((260,260),Image.Resampling.LANCZOS)
        sheet.paste(icon,(x+(cell-icon.width)//2,y),icon)
        name=labels[item["id"]]
        draw.text((x+7,y+266),name,font=font,fill=(239,232,248))
out=ROOT/"bilder/merker/vitenskap/kandidater/contact-sheet-localized-v2.jpg"
out.parent.mkdir(parents=True,exist_ok=True)
sheet.save(out,"JPEG",quality=90,optimize=True)
print(out.relative_to(ROOT),out.stat().st_size,"bytes")
