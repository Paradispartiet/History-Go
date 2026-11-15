#!/usr/bin/env python3
"""Localized embroidery lettering for preserved History Go science v2 artwork.

This makes PREVIEW CANDIDATES, never updates the active badge registry.
The original Norwegian source and its transparent outside are retained.
The decorated central motif is never redrawn or substituted.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT / "data/badges/vitenskap_v2_localization_20261112.json").read_text("utf8"))
LOCALES = ("en", "es", "pt", "fr")
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
RES = 1024

def textile_band(source):
    a = np.array(source.convert("RGBA"))
    y, x = np.mgrid[0:RES, 0:RES]
    xx, yy = x - 512, y - 512
    r = np.hypot(xx, yy)
    deg = np.degrees(np.arctan2(yy, xx))
    upper = (((deg >= -147) & (deg <= -33) & (r >= 389) & (r <= 458)) | ((deg >= -125) & (deg <= -55) & (r >= 349) & (r < 389)))
    lower = (((deg >= 31) & (deg <= 149) & (r >= 384) & (r <= 458)) | ((deg >= 53) & (deg <= 127) & (r >= 343) & (r < 384)))
    mask = upper | lower
    # Soft fabric-toned replacement for ORIGINAL LETTERING ONLY.
    # The embroidered rim and center are not masked.
    noise = (((x * 73 + y * 41 + x * y * 3) % 17) - 8).astype(np.int16)
    new = np.zeros((RES, RES, 3), dtype=np.int16)
    rr = r.astype(np.float32)
    new[...,0] = np.clip(26 + 0.10 * (rr - 420) + noise // 4, 0,255)
    new[...,1] = np.clip(11 + 0.04 * (rr - 420) + noise // 5, 0,255)
    new[...,2] = np.clip(42 + 0.16 * (rr - 420) + noise // 3, 0,255)
    # Feather edges of the text field by 2 pixels, avoiding a sharp patch seam.
    upper_feather = np.minimum(np.minimum(r-349, 458-r),
                           np.minimum(deg+147, -33-deg) * 6)
    lower_feather = np.minimum(np.minimum(r-343, 458-r),
                           np.minimum(deg-31, 149-deg) * 6)
    feather = np.where(upper,upper_feather,np.where(lower,lower_feather,0))
    blend = np.where(mask, np.clip(feather/3.0,0,1),0)[...,None]
    a[...,:3] = np.uint8(np.clip(a[...,:3]*(1-blend) + new*blend,0,255))
    out = Image.fromarray(a, "RGBA")
    # Gold stitched boundaries reinforce the badge's original textile identity.
    d=ImageDraw.Draw(out,"RGBA")
    for angle_start,angle_end,inner,outer in [(-147,-33,350,457),(31,149,344,457)]:
        for radius,color,width in [
            (inner,(178,105,33,210),2),
            (inner+3,(113,50,146,210),2),
            (outer-2,(210,151,61,170),2)
        ]:
            coords=[]
            for step in range(201):
                angle=math.radians(angle_start+(angle_end-angle_start)*step/200)
                coords.append((512+radius*math.cos(angle),512+radius*math.sin(angle)))
            d.line(coords,fill=color,width=width,joint="curve")
    return out

def gold_glyph(char,font):
    length = max(130,font.size*3)
    stamp = Image.new("RGBA",(length,length),(0,0,0,0))
    d=ImageDraw.Draw(stamp)
    bound = d.textbbox((0,0),char,font=font,stroke_width=0)
    start=(length-(bound[2]-bound[0]))/2-bound[0]
    top=(length-(bound[3]-bound[1]))/2-bound[1]
    # A subtle dark, stitched edge and two-tone thread highlights.
    d.text((start+1,top+2),char,font=font,fill="#190819",
           stroke_width=2,stroke_fill="#17071b")
    d.text((start,top),char,font=font,fill="#dc992f",
           stroke_width=1,stroke_fill="#f4ca70")
    d.text((start,top-1),char,font=font,fill="#ffe3a0")
    return stamp

def add_arch_text(img, label, upper):
    r=405 if upper else 389
    limit=math.radians(119)
    size=65
    while size>35:
        font=ImageFont.truetype(FONT_PATH,size)
        widths=[font.getlength(ch) for ch in label]
        if sum(widths) / r < limit * 0.91:
            break
        size-=1
    max_length=r*limit
    tracking=max(1.0,min(7.5,(max_length*0.92-sum(widths))/max(1,len(label)-1)))
    advances=[w+tracking for w in widths]
    total=sum(advances)-tracking
    cursor=0
    for ch,advance in zip(label,advances):
        mid=cursor+advance/2
        if upper:
            theta=-math.pi/2-total/(2*r)+mid/r
            rotation=-(math.degrees(theta)+90)
        else:
            theta=math.pi/2+total/(2*r)-mid/r
            rotation=90-math.degrees(theta)
        if ch!=' ':
            glyph=gold_glyph(ch,font)
            glyph=glyph.rotate(rotation,resample=Image.Resampling.BICUBIC,expand=True)
            x=512+r*math.cos(theta)
            y=512+r*math.sin(theta)
            img.alpha_composite(glyph,(int(x-glyph.width/2),int(y-glyph.height/2)))
        cursor+=advance
    return size

def make_one(item,locale):
    variant=item["variants"][locale]
    source=ROOT / item["sourceNorwegianCandidate"]["path"]
    with Image.open(source) as original:
        image=original.convert("RGBA")
    assert image.size==(RES,RES)
    original_alpha=image.getchannel("A").tobytes()
    out=textile_band(image)
    upper_size=add_arch_text(out,variant["heading"],True)
    lower_size=add_arch_text(out,variant["footer"],False)
    out.putalpha(image.getchannel("A"))
    assert out.getchannel("A").tobytes()==original_alpha
    assert out.crop((270,265,754,755)).tobytes()==image.crop((270,265,754,755)).tobytes(), "Center artwork changed"
    dst=ROOT/"bilder/merker/vitenskap/kandidater/locales"/locale/(item["id"]+"-v2.webp")
    dst.parent.mkdir(parents=True,exist_ok=True)
    out.save(dst, "WEBP",quality=95,method=6)
    data=dst.read_bytes()
    git_sha=hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
    return {"id":item["id"],"locale":locale,"path":str(dst.relative_to(ROOT)),
            "heading":variant["heading"],"footer":variant["footer"],
            "upperFontSize":upper_size,"lowerFontSize":lower_size,
            "bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),
            "gitBlobSha":git_sha}

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--all",action="store_true")
    ap.add_argument("--id",default="matematikk")
    ap.add_argument("--locale",default="en",choices=LOCALES)
    args=ap.parse_args()
    plan=[(x,locale) for x in PLAN["items"] for locale in LOCALES] if args.all else [
       (x,args.locale) for x in PLAN["items"] if x["id"]==args.id]
    if not plan:
        raise SystemExit("Unknown badge id")
    produced=[make_one(item,locale) for item,locale in plan]
    if args.all:
        manifest={
            "schemaVersion":1,"categoryId":"vitenskap",
            "status":"candidate_visual_review_required_not_active",
            "sourcePlan":"data/badges/vitenskap_v2_localization_20261112.json",
            "activeBadgeImagesUnchanged":True,
            "candidateOnly":True,
            "notes":"Machine-generated text-band localization; preserve original motif, not approved for production until each of 20 images passes human visual/text review and center artwork comparison.",
            "items":produced
        }
        path=ROOT/"data/badges/vitenskap_v2_locale_candidates_artwork_20261112.json"
        path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(produced,ensure_ascii=False,indent=2))
