#!/usr/bin/env python3
"""Generate review contact sheets, not activated game assets."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/"data/badges/badge_locale_images_candidates.json").read_text())
out=ROOT/"docs/badge-locale-previews"
out.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",15)
for cat in ("by","scenekunst"):
    entries=[x for x in manifest["entries"] if x["category"]==cat]
    ids=list(dict.fromkeys(x["id"] for x in entries))
    groups=[ids[i:i+3] for i in range(0,len(ids),3)]
    for group_no, group in enumerate(groups,1):
        w,cell,hhead=250,248,25
        sheet=Image.new("RGB",(w*4,(cell+hhead)*len(group)),(19,22,29))
        draw=ImageDraw.Draw(sheet)
        for row,sub in enumerate(group):
            for col,locale in enumerate(("en","es","pt","fr")):
                x=next(e for e in entries if e["id"]==sub and e["locale"]==locale)
                im=Image.open(ROOT/x["path"]).convert("RGBA").resize((cell,cell),Image.Resampling.LANCZOS)
                base=Image.new("RGBA",im.size,(19,22,29,255));base.alpha_composite(im)
                xpos=col*w
                ypos=row*(cell+hhead)
                sheet.paste(base.convert("RGB"),(xpos,ypos+hhead))
                draw.text((xpos+6,ypos+4),f"{sub} / {locale.upper()}",font=font,fill=(255,255,255))
        path=out/f"{cat}-{group_no}.jpg"
        sheet.save(path,"JPEG",quality=68,subsampling=2,optimize=True)
        print(f"{path}: {path.stat().st_size} bytes")
