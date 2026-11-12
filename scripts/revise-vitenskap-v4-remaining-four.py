#!/usr/bin/env python3
"""Generate archival v4 text-band relief for four OTHER History Go science subbadges.

Reuses the proven masked annular yarn-relief from the research v4 prototype.
Only original, already committed EN/ES/PT/FR v2 translated candidate WebPs
are input; active assets, science registry and source candidates are immutable.
A deterministic SHA-provenance manifest and a visual review sheet are produced.
Nothing is approved for PlaceCard activation.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"bilder/merker/vitenskap/kandidater"
PLAN=json.loads((ROOT/"data/badges/vitenskap_v2_localization_20261112.json").read_text(encoding="utf-8"))
V2=json.loads((ROOT/"data/badges/vitenskap_v2_locale_candidates_artwork_20261112.json").read_text(encoding="utf-8"))
ACTIVE=json.loads((ROOT/"data/badges/vitenskap.json").read_text(encoding="utf-8"))
SOURCE=ROOT/"scripts/revise-vitenskap-v4-embroidery.py"
spec=importlib.util.spec_from_file_location("science_v4_research",SOURCE)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

LANGS=("en","es","pt","fr")
IDS=("informasjonsteknologi","matematikk","astronomi_og_fysikk","kjemi_og_materialvitenskap")
REPORT=ROOT/"data/badges/vitenskap_v4_remaining_four_locales_20261112.json"
SHEET=BASE/"contact-sheet-v4-remaining-four.jpg"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def data_hash(data):
    return {
        "bytes":len(data),
        "sha256":hashlib.sha256(data).hexdigest(),
        "gitBlobSha":hashlib.sha1(b"blob "+str(len(data)).encode()+bytes([0])+data).hexdigest()
    }

def make_one(item,language):
    candidate=next((r for r in V2["items"] if r["id"]==item and r["locale"]==language),None)
    assert candidate, (item,language)
    source=ROOT/candidate["path"]
    srcdata=source.read_bytes()
    assert hashlib.sha256(srcdata).hexdigest()==candidate["sha256"],source
    assert data_hash(srcdata)["gitBlobSha"]==candidate["gitBlobSha"],source
    with Image.open(source) as im:
        original=im.convert("RGBA")
    assert original.size==(1024,1024)
    out,metrics=module.thread_relief(original)
    newpath=f"bilder/merker/vitenskap/kandidater/revisjoner/{language}/{item}-v4-broderi.webp"
    target=ROOT/newpath
    target.parent.mkdir(parents=True,exist_ok=True)
    out.save(target,format="WEBP",quality=96,method=6)
    with Image.open(target) as im:
        decoded=im.convert("RGBA")
    assert decoded.size==(1024,1024)
    assert decoded.getchannel("A").tobytes()==original.getchannel("A").tobytes()
    a=np.asarray(original)[280:744,280:744,:3].astype("int16")
    b=np.asarray(decoded)[280:744,280:744,:3].astype("int16")
    d=np.abs(a-b)
    assert float(d.mean())<6,(item,language,"mean",d.mean())
    assert np.percentile(d,99)<38,(item,language,"99-percentile",np.percentile(d,99))
    assert metrics["goldPixelsEnhanced"]>1000,(item,language)
    assert metrics["purpleFeltPixelsEnhanced"]>1000,(item,language)
    label=next(p for p in PLAN["items"] if p["id"]==item)["variants"][language]
    return {
        "id":item,"locale":language,"source":candidate["path"],
        "sourceGitBlobSha":candidate["gitBlobSha"],"path":newpath,
        "heading":label["heading"],"footer":label["footer"],
        **data_hash(target.read_bytes()),
        "metrics":metrics,
        "centerMeanCodecDifference":round(float(d.mean()),3),
        "status":"candidate_pending_individual_visual_review_not_active",
    }

def contact_sheet(rows):
    width,height=1600,1700
    sheet=Image.new("RGB",(width,height),(19,21,31))
    d=ImageDraw.Draw(sheet)
    ft=ImageFont.truetype(FONT,23)
    small=ImageFont.truetype(FONT,17)
    d.text((28,16),"HISTORY GO – VITENSKAP V4 • REVIEW ONLY",font=ft,fill=(248,241,220))
    w=360
    for row_index,item in enumerate(IDS):
        y=64+row_index*405
        for col,language in enumerate(LANGS):
            x=20+col*395
            record=next(m for m in rows if m["id"]==item and m["locale"]==language)
            with Image.open(ROOT/record["path"]) as im:
                patch=im.convert("RGBA").resize((w,w),Image.Resampling.LANCZOS)
            sheet.paste(patch,(x,y),patch)
            caption=f"{language.upper()}  {item.replace('_',' ')}"
            d.text((x+5,y+365),caption,font=small,fill=(230,232,240))
    SHEET.parent.mkdir(parents=True,exist_ok=True)
    sheet.save(SHEET,"JPEG",quality=86,optimize=True)
    return str(SHEET.relative_to(ROOT))

def main():
    assert len(ACTIVE["subBadgeImages"])==16
    assert not any(str(v).startswith("bilder/merker/vitenskap/kandidater") for v in ACTIVE["subBadgeImages"].values())
    assert len(V2["items"])==20
    rows=[make_one(item,language) for item in IDS for language in LANGS]
    assert len(rows)==16
    report={
      "schemaVersion":1,"categoryId":"vitenskap",
      "ids":list(IDS),"locales":list(LANGS),
      "status":"sixteen_v4_candidates_not_approved_or_active",
      "method":"masked golden-thread and violet-felt relief on existing v2 translated bands; no interior text edits",
      "activeBadgeRegistryUnchanged":True,
      "existingNorwegianAndV2AssetsPreserved":True,
      "qualityWarning":"Close image by image inspection required; enhanced band relief does not itself certify matching the original Norwegian embroidery quality.",
      "items":rows,
      "contactSheet":contact_sheet(rows),
    }
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Produced",len(rows),"inactive WebP v4 candidates and review sheet")
    for r in rows:print(r["id"],r["locale"],r["bytes"],r["gitBlobSha"])

if __name__=="__main__":main()
