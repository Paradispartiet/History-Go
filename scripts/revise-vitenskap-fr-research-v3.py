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
 ("HYPOTHÈSE", 544,222,656,249, 18, 0, "paper", "hypothesis sign"),
 ("TEST", 701,282,792,308, 19, 0, "paper", "testing sign"),
 ("RÉSULTAT", 749,328,857,360, 16, 0, "paper", "result sign"),
 ("CONCLUSION", 759,389,867,421, 15, 0, "paper", "conclusion sign"),
 ("MÉTHODE", 179,402,280,436, 18,-5,"paper","clipboard heading"),
 ("Échantillon", 213,442,291,466, 12,-5,"paper","clipboard sampling"),
 ("Procédure", 216,471,293,493, 12,-5,"paper","clipboard procedure"),
 ("Mesure", 220,498,285,519, 13,-5,"paper","clipboard measurement"),
 ("Analyse", 227,522,299,547, 13,-5,"paper","clipboard analysis"),
 ("PRÉLÈV.", 345,723,401,747, 11,-8,"paper","sample packet"),
]
# Additional label stays as neutral sample identification A-037.

def amend_patch(base, title, rect, px, tilt=0):
    x0,y0,x1,y1=rect
    # Clean only dark glyph strokes in the sign's inner paper; do not overwrite
    # the surrounding gold embroidered borders, arrows, or scientific equipment.
    a=np.asarray(base.convert("RGBA")).copy()
    y0=max(0,y0);x0=max(0,x0);y1=min(1024,y1);x1=min(1024,x1)
    rgb=a[y0:y1,x0:x1,:3]
    # The original ink is near-black on cream parchment. The mask is restricted
    # to inside each text field; gold, purple and other objects lie outside.
    dark=(rgb[:,:,0]<170)&(rgb[:,:,1]<150)&(rgb[:,:,2]<142)
    dark=np.uint8(dark)*255
    dark=cv2.dilate(dark,np.ones((3,3),np.uint8),iterations=1)
    inp=cv2.inpaint(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),dark,3,cv2.INPAINT_TELEA)
    a[y0:y1,x0:x1,:3]=cv2.cvtColor(inp,cv2.COLOR_BGR2RGB)
    out=Image.fromarray(a,'RGBA')
    w,h=x1-x0,y1-y0
    # Stitched dark ink on paper; preserve the source's sign and illustration.
    font_size=px
    d=ImageDraw.Draw(out)
    while font_size>8:
        font=ImageFont.truetype(FONT,font_size)
        bb=d.textbbox((0,0),title,font=font,stroke_width=0)
        tw=bb[2]-bb[0];th=bb[3]-bb[1]
        if tw<=w-5 and th<=h-5:break
        font_size-=1
    ink=Image.new("RGBA",(max(w+25,150),max(h+25,90)),(0,0,0,0))
    di=ImageDraw.Draw(ink)
    bb=di.textbbox((0,0),title,font=font,stroke_width=0)
    ix=(ink.width-(bb[2]-bb[0]))/2-bb[0]
    iy=(ink.height-(bb[3]-bb[1]))/2-bb[1]
    di.text((ix+0.4,iy+1.1),title,font=font,fill=(116,89,66,180))
    di.text((ix,iy),title,font=font,fill=(37,30,38,255))
    if tilt:ink=ink.rotate(tilt,resample=Image.Resampling.BICUBIC,expand=True)
    # Important: paste the glyph's center at the center of the cleaned field.
    out.alpha_composite(ink,(round((x0+x1-ink.width)/2),round((y0+y1-ink.height)/2)))
    return out, font_size

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
