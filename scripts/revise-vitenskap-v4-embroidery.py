#!/usr/bin/env python3
"""Add restrained gold-thread relief to existing verified science v3 badge bands.

Never paints new images from scratch. Edits only the two lettering annuli of the
existing complete v3 localized badge. Central scene, transparent alpha, and all
active badge paths are untouched. v4 is candidate-only pending visual QA.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
ID="forskning_og_metode"
LANGS=("fr","en","es","pt")
SIZE=1024
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def paths(locale):
    base="bilder/merker/vitenskap/kandidater/revisjoner"
    return (ROOT/f"{base}/{locale}/{ID}-v3.webp",
            ROOT/f"{base}/{locale}/{ID}-v4-broderi.webp")

def thread_relief(source):
    rgba=np.array(source.convert("RGBA"),dtype=np.uint8)
    original=rgba.copy()
    rgb=rgba[:,:,:3].astype(np.float32)
    yy,xx=np.mgrid[:SIZE,:SIZE]
    x=(xx-512).astype(np.float32)
    y=(yy-512).astype(np.float32)
    r=np.hypot(x,y)
    theta=np.arctan2(y,x)
    degrees=np.degrees(theta)
    # Restricted to outer typography fields. We deliberately avoid the
    # inner science story, laurels, center, and distinctive purple outer rim.
    top=(degrees>-150)&(degrees<-30)&(r>359)&(r<451)
    bottom=(degrees>28)&(degrees<152)&(r>356)&(r<451)
    annulus=top|bottom

    R,G,B=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    # Segmentation of pale gold letters, including the lighter upstroke.
    gold=annulus & (R>122)&(G>72)&(R>G*1.05)&(G>B*1.10)&((R+G)>248)
    # Do not alter tiny gold dividers on edge of the fabric band.
    gold &= (r>365)&(r<440) 
    dark=annulus & (R<122)&(G<85)&(B<140)
    # Yarn weave on dark purple felt, very subtle so lettering stays legible.
    yarn = (np.sin((xx+yy*0.47)*2.0)*0.9 + np.sin((yy-xx*0.25)*1.6)*0.6)
    grain=((np.sin(xx*29.7+yy*13.1)*503.7)%1.0-0.5)
    felt_delta=yarn*1.7+grain*3.0
    rgb[:,:,0]=np.where(dark,np.clip(R+felt_delta*0.75,0,255),R)
    rgb[:,:,1]=np.where(dark,np.clip(G+felt_delta*0.45,0,255),G)
    rgb[:,:,2]=np.where(dark,np.clip(B+felt_delta*1.0,0,255),B)

    # Raised stitch shadow on the southeast/down-thread edge of gold letters.
    # First expand blurred gold shape behind it, then bring stitch highlights
    # back to the original letter without altering its geometry.
    shadow=np.roll(gold,shift=(2,2),axis=(0,1)) & annulus & ~gold
    shadow &= dark
    for ch,amount in enumerate((18,10,23)):
        rgb[:,:,ch]=np.where(shadow,np.clip(rgb[:,:,ch]-amount,0,255),rgb[:,:,ch])

    # Fiber ridges repeated at approximately 3px across the gold glyph fill.
    tangent=theta+math.pi/2
    directional=x*np.cos(tangent)+y*np.sin(tangent)
    radial=np.hypot(x,y)
    fiber=np.sin((directional*0.44 + radial*0.72)*2*math.pi/3.7)
    micro=np.sin((x*0.67-y*0.42)*2*math.pi/2.8)
    relief=0.115*fiber + 0.037*micro + 0.024*grain
    rgb[:,:,0]=np.where(gold,np.clip(rgb[:,:,0]*(1+relief)+4,0,255),rgb[:,:,0])
    rgb[:,:,1]=np.where(gold,np.clip(rgb[:,:,1]*(1+relief*0.94)+3,0,255),rgb[:,:,1])
    rgb[:,:,2]=np.where(gold,np.clip(rgb[:,:,2]*(1+relief*0.65),0,255),rgb[:,:,2])

    # Specular northern edge of each stitched raised glyph.
    left_edge=gold & ~np.roll(gold,shift=(1,1),axis=(0,1))
    right_edge=gold & ~np.roll(gold,shift=(-1,-1),axis=(0,1))
    rgb[:,:,0]=np.where(left_edge,np.minimum(255,rgb[:,:,0]+14),rgb[:,:,0])
    rgb[:,:,1]=np.where(left_edge,np.minimum(255,rgb[:,:,1]+17),rgb[:,:,1])
    rgb[:,:,2]=np.where(left_edge,np.minimum(255,rgb[:,:,2]+12),rgb[:,:,2])
    rgb[:,:,0]=np.where(right_edge,np.maximum(0,rgb[:,:,0]-11),rgb[:,:,0])
    rgb[:,:,1]=np.where(right_edge,np.maximum(0,rgb[:,:,1]-9),rgb[:,:,1])
    rgb[:,:,2]=np.where(right_edge,np.maximum(0,rgb[:,:,2]-6),rgb[:,:,2])

    out=np.concatenate((rgb.clip(0,255).astype(np.uint8),rgba[:,:,3:4]),axis=2)
    assert np.array_equal(out[:,:,3],original[:,:,3])
    # Only annular regions may be edited; the central scientific illustration
    # stays byte-identical BEFORE WebP serialization.
    assert np.array_equal(out[255:770,255:770],original[255:770,255:770])
    assert np.array_equal(out[0:40,0:SIZE],original[0:40,0:SIZE])
    return Image.fromarray(out,"RGBA"), {
        "goldPixelsEnhanced":int(gold.sum()),
        "purpleFeltPixelsEnhanced":int(dark.sum()),
        "framePixelChanges":int(np.count_nonzero(np.any(out[:,:,:3]!=original[:,:,:3],axis=2))),
        "sourceAlphaIdentical":True,
        "centralArtworkBytePreservedBeforeEncoding":True
    }

def sha_info(path):
    b=path.read_bytes()
    return {
        "path":str(path.relative_to(ROOT)),
        "bytes":len(b),
        "sha256":hashlib.sha256(b).hexdigest(),
        "gitBlobSha":hashlib.sha1(b"blob "+str(len(b)).encode()+b"\\0"+b).hexdigest()
    }

def preview(before,after):
    dst=ROOT/"bilder/merker/vitenskap/kandidater/revisjoner/fr/forskning_og_metode-v4-comparison.jpg"
    sheet=Image.new("RGB",(1240,1100),(20,21,29))
    d=ImageDraw.Draw(sheet)
    font=ImageFont.truetype(FONT,21)
    sheet.paste(before.convert("RGB").resize((600,600),Image.Resampling.LANCZOS),(10,35))
    sheet.paste(after.convert("RGB").resize((600,600),Image.Resampling.LANCZOS),(630,35))
    d.text((25,7),"FRA: v3 tekstbaand",fill=(240,240,240),font=font)
    d.text((645,7),"TIL: v4 broderi-revisjon",fill=(240,240,240),font=font)
    # Four closeups: top and bottom ring of each.
    areas=[(115,70,910,305),(105,702,924,960)]
    for i,box in enumerate(areas):
        top_y=667+i*218
        a=before.crop(box).resize((600,200),Image.Resampling.LANCZOS).convert("RGB")
        b=after.crop(box).resize((600,200),Image.Resampling.LANCZOS).convert("RGB")
        sheet.paste(a,(10,top_y))
        sheet.paste(b,(630,top_y))
    dst.parent.mkdir(parents=True,exist_ok=True)
    sheet.save(dst,"JPEG",quality=86,optimize=True)
    return dst

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--lang",choices=LANGS,default="fr")
    p.add_argument("--all",action="store_true")
    args=p.parse_args()
    locales=LANGS if args.all else (args.lang,)
    manifest=[]
    for lang in locales:
        src,dst=paths(lang)
        assert src.exists(),src
        with Image.open(src) as f:before=f.convert("RGBA")
        assert before.size==(1024,1024)
        after,measures=thread_relief(before)
        dst.parent.mkdir(parents=True,exist_ok=True)
        after.save(dst,"WEBP",quality=96,method=6)
        with Image.open(dst) as f:
            decoded=f.convert("RGBA")
        assert decoded.size==(1024,1024)
        assert decoded.getchannel("A").tobytes()==before.getchannel("A").tobytes()
        src_center=np.asarray(before)[255:770,255:770,:3].astype("int16")
        out_center=np.asarray(decoded)[255:770,255:770,:3].astype("int16")
        delta=np.abs(src_center-out_center)
        assert float(delta.mean())<6,delta.mean()
        assert float(np.percentile(delta,99))<38,np.percentile(delta,99)
        candidate={**sha_info(dst),"locale":lang,"source":str(src.relative_to(ROOT)),
                   "status":"non_active_embroidery_preview_pending_visual_review",
                   "metrics":measures,
                   "centerMeanCodecDifference":round(float(delta.mean()),3)}
        manifest.append(candidate)
        if lang=="fr":
            preview(before,after)
        print(lang,candidate['bytes'],candidate['gitBlobSha'],candidate["metrics"])
    report={"schemaVersion":1,"categoryId":"vitenskap","subBadgeId":ID,
            "status":"non_active_visual_revision_pending",
            "activeRegistryUnchanged":True,
            "method":"Mask-based gold-thread relief; no lettering changes or central-illustration redraw",
            "sourcesV3Preserved":True,
            "items":manifest}
    reportpath=ROOT/"data/badges/vitenskap_forskning_v4_embroidered_candidates_20261112.json"
    reportpath.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
if __name__=="__main__":main()
