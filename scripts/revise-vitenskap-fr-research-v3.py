#!/usr/bin/env python3
"""One-place French science badge text localization, visually reviewable v3 candidate.

Never edits live badge paths, v2 originals, or the existing 20-candidate manifest.
Localized text on small signs is deliberately revised without redrawing the scene.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"bilder/merker/vitenskap/kandidater/locales/fr/forskning_og_metode-v2.webp"
DST=ROOT/"bilder/merker/vitenskap/kandidater/revisjoner/fr/forskning_og_metode-v3.webp"
REPORT=ROOT/"data/badges/vitenskap_forskning_fr_internal_labels_v3.json"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

# Individual text areas selected inside cream-coloured embroidered placards.
# Coordinates are on the exact 1024x1024 v2 source, excluding borders and icons.
LABELS=[
 ("HYPOTHÈSE", 543,219,657,250, 18, 0, "paper", "hypothesis sign"),
 ("TEST", 701,267,792,309, 19, 0, "paper", "testing sign"),
 ("RÉSULTAT", 746,330,856,360, 16, 0, "paper", "result sign"),
 ("CONCLUSION", 760,391,869,422, 15, 0, "paper", "conclusion sign"),
 ("MÉTHODE", 177,399,286,438, 18,-5,"paper","clipboard heading"),
 ("Échantillon", 211,440,291,466, 12,-5,"paper","clipboard sampling"),
 ("Procédure", 214,469,296,495, 12,-5,"paper","clipboard procedure"),
 ("Mesure", 218,496,286,520, 13,-5,"paper","clipboard measurement"),
 ("Analyse", 225,520,301,548, 13,-5,"paper","clipboard analysis"),
 ("PRÉLÈV.\nA-037", 345,718,403,764, 11,-8,"paper","sample packet"),
]
# Additional label stays as neutral sample identification A-037.

def amend_patch(base, title, rect, px, tilt=0):
    x0,y0,x1,y1=rect
    x0=max(0,x0);y0=max(0,y0);x1=min(1024,x1);y1=min(1024,y1)
    w,h=x1-x0,y1-y0
    # Rebuild only each small parchment field. The original black lettering
    # must be fully covered, not overprinted; exterior sign borders remain.
    source=np.array(base.convert("RGBA"))
    local=source[y0:y1,x0:x1,:3].astype(np.float32)
    bright=(local[:,:,0]>=174)&(local[:,:,1]>=137)&(local[:,:,2]>=90)
    if bright.sum() > 60:
        median=np.median(local[bright],axis=0)
    else:
        median=np.array([235,217,180],dtype=np.float32)
    # Keep warm cream with faint deterministically seeded linen grain.
    median=np.clip(median,[210,180,145],[250,235,210])
    yy,xx=np.mgrid[0:h,0:w]
    grain=(((xx*37+yy*51+x0*3+y0*7)%13)-6).astype(np.float32)
    rgb=np.empty((h,w,3),dtype=np.uint8)
    for ch in range(3):
        grad=(yy-h/2)*0.05 + (xx-w/2)*0.02
        rgb[:,:,ch]=np.clip(median[ch]+grad+grain*.55,0,255).astype(np.uint8)
    patch=Image.fromarray(rgb,'RGB').convert('RGBA')
    m=Image.new('L',(w,h),0)
    md=ImageDraw.Draw(m)
    md.rounded_rectangle((1,1,w-2,h-2),radius=3,fill=255)
    m=m.filter(ImageFilter.GaussianBlur(1.2))
    out=base.copy()
    out.paste(patch,(x0,y0),m)
    font_size=px
    measurement=ImageDraw.Draw(out)
    lines=title.splitlines()
    while font_size>8:
        font=ImageFont.truetype(FONT,font_size)
        box=measurement.multiline_textbbox((0,0),title,font=font,spacing=1)
        tw,th=box[2]-box[0],box[3]-box[1]
        if tw<=w-8 and th<=h-6:break
        font_size-=1
    ink=Image.new('RGBA',(max(w+25,150),max(h+25,90)),(0,0,0,0))
    di=ImageDraw.Draw(ink)
    box=di.multiline_textbbox((0,0),title,font=font,spacing=1,align='center')
    ix=(ink.width-(box[2]-box[0]))/2-box[0]
    iy=(ink.height-(box[3]-box[1]))/2-box[1]
    di.multiline_text((ix+.35,iy+1),title,font=font,spacing=1,
                      align='center',fill=(115,85,62,180))
    di.multiline_text((ix,iy),title,font=font,spacing=1,
                      align='center',fill=(43,31,40,255))
    if tilt:ink=ink.rotate(tilt,resample=Image.Resampling.BICUBIC,expand=True)
    out.alpha_composite(ink,(round((x0+x1-ink.width)/2),
                             round((y0+y1-ink.height)/2)))
    return out,font_size

def main():
    with Image.open(SRC) as im:
        original=im.convert("RGBA")
    assert original.size==(1024,1024)
    alpha=original.getchannel('A').tobytes()
    edited=original.copy()
    used=[]
    for title,x0,y0,x1,y1,size,tilt,surface,meaning in LABELS:
        edited,chosen=amend_patch(edited,title,(x0,y0,x1,y1),size,tilt)
        used.append({"meaning":meaning,"frenchText":title,"bbox":[x0,y0,x1,y1],"fontPx":chosen})
    edited.putalpha(original.getchannel('A'))
    assert alpha==edited.getchannel('A').tobytes()
    DST.parent.mkdir(parents=True,exist_ok=True)
    edited.save(DST,'WEBP',quality=96,method=6)
    data=DST.read_bytes()
    sha256=hashlib.sha256(data).hexdigest()
    gitsha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    report={
        "schemaVersion":1,"categoryId":"vitenskap","id":"forskning_og_metode",
        "locale":"fr","status":"individual_revised_candidate_requires_visual_approval",
        "source":"bilder/merker/vitenskap/kandidater/locales/fr/forskning_og_metode-v2.webp",
        "path":str(DST.relative_to(ROOT)),"dimensions":[1024,1024],
        "originalAlphaPreserved":True,"activeBadgeUnchanged":True,
        "edits":used,"bytes":len(data),"sha256":sha256,"gitBlobSha":gitsha,
        "note":"French internal labels amended in isolated v3 preview. No claim of approved visual embroidery or production activation."
    }
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding='utf8')
    print('French internal-label revision:',str(DST.relative_to(ROOT)))
    print('SHA256',sha256,'Git-blob',gitsha,'bytes',len(data))
    print('ALPHA IDENTICAL, ACTIVE REGISTRY UNCHANGED')
if __name__=='__main__':main()
