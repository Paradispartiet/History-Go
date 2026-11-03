#!/usr/bin/env python3
"""Generate review-only localized WebPs from existing canonical badge art.

Original source files and the active subBadgeImages mappings remain untouched.
Image QA and user approval are required before these candidates are activated.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import hashlib, json, math, shutil

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT/'data/badges/badge_locales_by_scenekunst_v1.json').read_text(encoding='utf8'))
LOCALES = ('en','es','pt','fr')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'

def fabric_band(im, category, sub, foot):
    w,h=im.size
    yy,xx=np.mgrid[:h,:w].astype('float32')
    r=np.hypot(xx-w*.5, yy-h*.515)/w
    angle=np.abs(np.arctan2(xx-w*.5,h*.515-yy))
    limit=math.radians(64 if category=='scenekunst' or sub=='klassisk_arkitektur' else 59)
    lo=.343 if category=='by' else .365
    hi=.448 if category=='by' else .455
    ramp=lambda x,a,b: np.clip((x-a)/(b-a),0,1)
    opacity = ramp(r,lo,lo+.010)*(1-ramp(r,hi-.010,hi))*(1-ramp(angle,limit-.075,limit))*(1-ramp(yy,h*.28,h*.30))
    rgb=np.asarray(im.convert('RGB'),dtype='float32')
    rng=np.random.default_rng(112)
    noise=rng.normal(0,2.2,(h,w)).astype('float32')
    fabric_yarn=np.sin((xx+yy*.34)*2*math.pi/3.4)*2.1 + np.sin((yy-xx*.19)*2*math.pi/2.4)*1.5
    dark=(opacity>.82)&(r>lo+.01)&(r<hi-.01)&(rgb[:,:,0]<120)&(rgb[:,:,1]<95)&(rgb[:,:,2]<115)
    col=np.median(rgb[dark],axis=0) if dark.sum()>100 else np.array([13,25,42] if category=='by' else [89,16,40])
    cloth=np.clip(col[None,None,:]+(noise+fabric_yarn)[:,:,None],0,255)
    rgb=rgb*(1-opacity[:,:,None])+cloth*opacity[:,:,None]
    if foot:
        dx=(xx-w*.5)/(w*(.156 if sub=='klassisk_arkitektur' else .130))
        dy=(yy-h*.838)/(h*.058)
        cover=np.clip((1.1-(dx*dx+dy*dy))/.18,0,1)
        if sub=='klassisk_arkitektur': bg=np.array([238,211,167])
        else:
            dark2=(xx>w*.30)&(xx<w*.70)&(yy>h*.79)&(yy<h*.92)&(rgb[:,:,0]<120)&(rgb[:,:,1]<110)
            bg=np.median(rgb[dark2],axis=0) if dark2.sum()>10 else np.array([13,20,31])
        new=np.clip(bg[None,None,:]+(noise+fabric_yarn)[:,:,None],0,255)
        rgb=rgb*(1-cover[:,:,None])+new*cover[:,:,None]
    out=Image.fromarray(np.uint8(rgb),'RGB').convert('RGBA')
    out.putalpha(im.getchannel('A'))
    return out

def top_title(canvas, caption, category):
    w,h=canvas.size
    R=w*.406
    sz=66 if category=='by' else 69
    while sz>30:
        font=ImageFont.truetype(FONT,sz)
        lengths=[font.getlength(char)+3 for char in caption]
        if sum(lengths)/R < math.radians(100 if category=='by' else 116): break
        sz-=1
    pos=-sum(lengths)/2
    for ch,L in zip(caption,lengths):
        th=(pos+L/2)/R
        cx=w/2+R*math.sin(th)
        cy=h*.517-R*math.cos(th)
        block=Image.new('RGBA',(sz*3,sz*3))
        painter=ImageDraw.Draw(block)
        bound=painter.textbbox((0,0),ch,font=font)
        x=(block.width-(bound[2]-bound[0]))/2-bound[0]
        y=(block.height-(bound[3]-bound[1]))/2-bound[1]
        painter.text((x+1,y+3),ch,font=font,fill=(23,16,20,240),stroke_width=3,stroke_fill=(23,16,20,255))
        painter.text((x,y),ch,font=font,fill=(245,220,172,255),stroke_width=1,stroke_fill=(102,72,51,255))
        block=block.rotate(-math.degrees(th),resample=Image.Resampling.BICUBIC)
        canvas.alpha_composite(block,(int(cx-block.width/2),int(cy-block.height/2)))
        pos+=L

def bottom_title(canvas,caption,classical=False):
    w,h=canvas.size
    sz=65
    while sz>27:
        font=ImageFont.truetype(FONT,sz)
        if font.getlength(caption)<w*.275: break
        sz-=1
    painter=ImageDraw.Draw(canvas)
    b=painter.textbbox((0,0),caption,font=font)
    x=(w-(b[2]-b[0]))/2-b[0]
    y=h*.838-(b[3]-b[1])/2-b[1]
    ink=(29,27,30) if classical else (245,220,183)
    painter.text((x+1,y+3),caption,font=font,fill=(26,20,21),stroke_width=2,stroke_fill=(26,20,21))
    painter.text((x,y),caption,font=font,fill=ink,stroke_width=1,stroke_fill=(111,87,63))

def main():
    manifest={'version':1,'status':'review_required_not_active','locales':list(LOCALES),'entries':[],'skipped':[]}
    for category in ('by','scenekunst'):
        badge=json.loads((ROOT/'data/badges'/f'{category}.json').read_text(encoding='utf8'))
        for sub,path in badge['subBadgeImages'].items():
            src=ROOT/path
            assert src.is_file(), f'Missing registered original: {path}'
            original_hash=hashlib.sha256(src.read_bytes()).hexdigest()
            original=Image.open(src).convert('RGBA')
            assert original.size==(1024,1024)
            for locale in LOCALES:
                title=CATALOG['subLabels'][category][sub][locale].upper()
                bottom=CATALOG['categoryLabels']['by'][['nb','en','es','pt','fr'].index(locale)].upper() if category=='by' else None
                dst=ROOT/'bilder/merker'/category/'locales'/locale/f'{sub}.webp'
                dst.parent.mkdir(parents=True,exist_ok=True)
                # Exact source copy for same-language, same-text badges.
                source_title=CATALOG['subLabels'][category][sub]['nb'].upper()
                if title==source_title and bottom is None:
                    shutil.copyfile(src,dst)
                else:
                    result=fabric_band(original,category,sub,bottom is not None)
                    top_title(result,title,category)
                    if bottom: bottom_title(result,bottom,sub=='klassisk_arkitektur')
                    result.save(dst,'WEBP',lossless=True,method=5)
                inspect=Image.open(dst).convert('RGBA')
                assert inspect.size==original.size
                assert np.array_equal(np.asarray(inspect.getchannel('A')),np.asarray(original.getchannel('A'))),f'Alpha changed: {dst}'
                manifest['entries'].append({'category':category,'id':sub,'locale':locale,
                    'path':dst.relative_to(ROOT).as_posix(),'label':title,'footer':bottom,
                    'originalSha256':original_hash,'sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),
                    'bytes':dst.stat().st_size})
            assert hashlib.sha256(src.read_bytes()).hexdigest()==original_hash,'Source changed'
        for sub in badge['sub']:
            if sub not in badge['subBadgeImages']:
                manifest['skipped'].append({'category':category,'id':sub,'reason':'No approved active source image'})
    assert len(manifest['entries'])==36, f'Expected 9 active subbadges x 4 languages, got {len(manifest["entries"])}'
    target=ROOT/'data/badges/badge_locale_images_candidates.json'
    target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(f'Generated {len(manifest["entries"])} review-only WebPs; original images unchanged')

if __name__=='__main__':main()
