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

def fabric_band(im, category, sub, foot, preserve_header=False):
    w,h=im.size
    yy,xx=np.mgrid[:h,:w].astype('float32')
    r=np.hypot(xx-w*.5, yy-h*.515)/w
    angle=np.abs(np.arctan2(xx-w*.5,h*.515-yy))
    limit=math.radians(77 if sub=='klassisk_arkitektur' else (73 if sub=='sceneproduksjon' else 64 if category=='scenekunst' else 59))
    lo=(.32 if category=='by' else {'teater':.30,'dans':.29,'sceneproduksjon':.29,'musikkteater':.345,'regi':.32,'dramaturgi':.32}.get(sub,.34))
    hi=(.485 if sub=='klassisk_arkitektur' else .469 if category=='by' else .468)
    ramp=lambda x,a,b: np.clip((x-a)/(b-a),0,1)
    opacity = ramp(r,lo,lo+.010)*(1-ramp(r,hi-.010,hi))*(1-ramp(angle,limit-.075,limit))*(1-ramp(yy,h*.28,h*.30))
    if preserve_header:
        opacity *= 0
    rgb=np.asarray(im.convert('RGB'),dtype='float32')
    rng=np.random.default_rng(112)
    noise=rng.normal(0,2.2,(h,w)).astype('float32')
    fabric_yarn=np.sin((xx+yy*.34)*2*math.pi/3.4)*2.1 + np.sin((yy-xx*.19)*2*math.pi/2.4)*1.5
    dark=(opacity>.82)&(r>lo+.01)&(r<hi-.01)&(rgb[:,:,0]<120)&(rgb[:,:,1]<95)&(rgb[:,:,2]<115)
    col=np.median(rgb[dark],axis=0) if dark.sum()>100 else np.array([13,25,42] if category=='by' else [89,16,40])
    cloth=np.clip(col[None,None,:]+(noise+fabric_yarn)[:,:,None],0,255)
    rgb=rgb*(1-opacity[:,:,None])+cloth*opacity[:,:,None]
    if foot:
        dx=(xx-w*.5)/(w*(.156 if sub=='klassisk_arkitektur' else .148))
        dy=(yy-h*(.838 if sub=='klassisk_arkitektur' else .813))/(h*(.058 if sub=='klassisk_arkitektur' else .070))
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



def replace_embroidered_letters(canvas, original, category, sub):
    """Remove the old *letter stitches*, not the entire title fabric.

    The former annular paint-over erased woven detail, stars and decorative
    trim. This isolates the cream-colored yarn and its shadow, reconstructs
    only those pixels with local source textile and leaves the rest untouched.
    """
    w,h=original.size
    yy,xx=np.mgrid[:h,:w]
    cx,cy=w*.5,h*.515
    radial=np.hypot(xx-cx,yy-cy)
    angle=np.abs(np.arctan2(xx-cx,cy-yy))
    # Restrict the mask to embroidered title yarn; retain clouds, roof,
    # curtains, skyline and silver border surrounding the original title.
    outer={'klassisk_arkitektur':535,'sceneproduksjon':491}.get(sub,478)
    inner={'klassisk_arkitektur':351,'teater':323,'dans':232,
           'sceneproduksjon':335,'musikkteater':347}.get(sub,345)
    theta=math.radians(85 if sub=='klassisk_arkitektur'
                       else 78 if sub=='sceneproduksjon'
                       else 73 if category=='scenekunst' else 66)
    max_y=339 if sub=='klassisk_arkitektur' else (318 if sub=='dans' else 306)
    roi=(radial>=inner)&(radial<=outer)&(angle<theta)&(yy>=58)&(yy<max_y)
    if sub=='klassisk_arkitektur':
        # The curved original title finishes near the lower outer corners.
        # Extend only those side-glyph zones; never touch the sky or pediment.
        roi &= ((yy<=300)|(radial>=414))
        left_side = (xx>=95)&(xx<235)&(yy>=185)&(yy<344)&(radial>373)
        right_side = (xx>753)&(xx<=930)&(yy>=170)&(yy<347)&(radial>359)
        roi |= (left_side | right_side)
    elif sub=='dans':
        # Avoid the dancer's hands, head and drapery beneath the old DANS.
        # The old caption's D and S descend farther than the middle letters.
        glyph_area=(((xx>=270)&(xx<405)&(yy<278))|
                    ((xx>=405)&(xx<607)&(yy<245))|
                    ((xx>=607)&(xx<763)&(yy<277)))
        roi &= glyph_area
    raw=np.asarray(original.convert('RGB'),dtype=np.int16)
    rr,gg,bb=raw[:,:,0],raw[:,:,1],raw[:,:,2]
    cream=(rr>128)&(gg>95)&(bb>58)&((rr-gg)>8)&((gg-bb)>1)
    # Protect the two gold/cream stars adjacent to the Modernisme caption.
    if category=='by' and sub=='modernisme':
        for sx in (210,820):
            roi &= ((xx-sx)**2+(yy-237)**2)>53**2
    seed=np.uint8(cream&roi)*255
    # Reconnect threads within each letter and remove the dark stitched outline.
    mask=Image.fromarray(seed,'L').filter(ImageFilter.MaxFilter(7))
    mask=mask.filter(ImageFilter.MinFilter(5))
    mask=mask.filter(ImageFilter.MaxFilter(17))
    if not np.any(np.asarray(mask)):
        raise ValueError(f"No source title glyph detected for {category}/{sub}")
    m=np.asarray(mask)>0

    # Search for a small, genuine woven-textile swatch in the source's
    # non-lettered header. No synthetic paint or external artwork.
    arr=np.asarray(original.convert('RGB'),dtype=np.float32)
    source_alpha=np.asarray(original.getchannel('A'))
    candidates=[]
    # Sixteen-pixel swatches fit between the border's original satin stitches.
    n=16
    for y in range(88,305,8):
        for x in range(85,914,8):
            patch=arr[y:y+n,x:x+n]
            if patch.shape!=(n,n,3):continue
            if m[y:y+n,x:x+n].any():continue
            if source_alpha[y:y+n,x:x+n].min()<248:continue
            med=np.median(patch,axis=(0,1))
            bright=np.mean(np.max(patch,axis=2)>168)
            if category=='by':
                ok=(med[0]<118 and med[1]<131 and med[2]<155)
            else:
                ok=(med[0]>med[1]*1.10 and med[0]>med[2]*1.04
                    and 25<med[0]<207 and med[1]<138)
            if not ok or bright>.18:continue
            sigma=float(patch.std(axis=(0,1)).mean())
            if 2.5<sigma<39:
                candidates.append((abs(sigma-12),x,y))
    # Reference backing tint from unaltered source, excluding the letter yarn.
    neighborhood=roi&(~m)
    if category=='by': neighborhood &= (rr<125)&(gg<132)&(bb<165)
    else: neighborhood &= (rr>gg*1.13)&(rr>bb*1.04)&(rr<207)&(gg<140)
    target=np.median(arr[neighborhood],axis=0) if np.any(neighborhood) else (
        np.array([16,24,39]) if category=='by' else np.array([96,28,54]))
    if candidates:
        _,tx,ty=min(candidates,key=lambda z:z[0])
        swatch=arr[ty:ty+n,tx:tx+n]
        texture=swatch[(yy+17)%n,(xx+9)%n]
        texture=np.clip(texture+target-np.median(swatch,axis=(0,1)),0,255)
    else:
        # Narrow script and especially the classical badge leave no
        # untouched 16px block. Synthesize only the erased glyph yarn from
        # the local backing tint, *never* erase the whole title annulus.
        yarn=(np.sin((xx+yy*.35)*math.pi*2/3.4)*2.5+
              np.sin((yy-xx*.23)*math.pi*2/2.6)*2.2)
        texture=np.clip(target[None,None,:]+yarn[:,:,None],0,255)

    feather=np.asarray(mask.filter(ImageFilter.GaussianBlur(1.15)),dtype=np.float32)[:,:,None]/255
    out=np.clip(np.asarray(canvas.convert('RGB'),dtype=np.float32)*(1-feather)
                +texture*feather,0,255).astype(np.uint8)
    fixed=Image.fromarray(out,'RGB').convert('RGBA')
    fixed.putalpha(original.getchannel('A'))
    if sub=='dans':
        # The ballerina's left hand crosses the low D of the old title.
        # Reinstate the *exact original arm pixels*, not a painted replica.
        protect=Image.new('L',(w,h),0)
        ImageDraw.Draw(protect).polygon([
            (197,249),(235,231),(283,245),(333,272),(390,299),
            (458,322),(488,356),(455,380),(391,344),(320,311),
            (276,283),(223,281)],fill=255)
        protect=protect.filter(ImageFilter.GaussianBlur(1.2))
        fixed=Image.composite(original,fixed,protect)
    return fixed

def top_title(canvas, caption, category, sub=None):
    w,h=canvas.size
    R=w*(.380 if sub=='dans' else .406)
    sz=84 if sub=='dans' else 66 if category=='by' else 69
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
                    result=fabric_band(original,category,sub,bottom is not None,preserve_header=True)
                    if category=='by' and sub=='modernisme':
                        # Preserve the original cream stitched stars beside the upper caption.
                        from PIL import ImageFilter
                        for cx in (210,825):
                            side=Image.new('L',original.size,0)
                            from PIL import ImageDraw
                            ImageDraw.Draw(side).ellipse((cx-46,206,cx+46,290),fill=255)
                            side=side.filter(ImageFilter.GaussianBlur(3))
                            result=Image.composite(original,result,side)
                    if title!=source_title:
                        result=replace_embroidered_letters(result,original,category,sub)
                        top_title(result,title,category,sub)
                    if bottom: bottom_title(result,bottom,sub=='klassisk_arkitektur')
                    # Compositing translated letterforms changes alpha at antialiased
                    # patch edges. Restore the exact original silhouette before export.
                    result.putalpha(original.getchannel('A'))
                    result.save(dst,'WEBP',lossless=True,method=5,exact=True)
                inspect=Image.open(dst).convert('RGBA')
                assert inspect.size==original.size
                assert np.array_equal(np.asarray(inspect.getchannel('A')),np.asarray(original.getchannel('A'))),f'Alpha changed: {dst}'
                # A localized caption must never replace a building, actor,
                # instrument, flower or other interior motif.
                top_safe=430 if category=='by' else 405
                # By footer translations begin near y=750, so protect the
                # architecture between header and footer, not the footer.
                bottom_safe=715 if category=='by' else 770
                assert np.array_equal(np.asarray(inspect)[top_safe:bottom_safe,:,:3],
                                      np.asarray(original)[top_safe:bottom_safe,:,:3]), (
                    f'Non-caption illustration changed: {dst}')
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
