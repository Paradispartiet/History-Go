#!/usr/bin/env python3
"""Create a non-active localization proof of a science embroidered badge.

The source is a stored verified Norwegian v2 WebP. This changes only the
gold stitched lettering in the two outer annular text bands; central artwork
and alpha are preserved. Output is never auto-activated.
"""
import argparse
import json
import math
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT / 'data/badges/vitenskap_v2_localization_20261112.json').read_text())
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
WIDTH = HEIGHT = 1024

def erase_gold_text(img):
    rgb = np.array(img.convert('RGB'))
    yy, xx = np.ogrid[:HEIGHT, :WIDTH]
    dx, dy = xx - 512, yy - 512
    radius = np.sqrt(dx**2 + dy**2)
    angle = np.degrees(np.arctan2(dy, dx))
    top = (angle > -158) & (angle < -22) & (radius >= 372) & (radius <= 463)
    bottom = (angle > 23) & (angle < 157) & (radius >= 371) & (radius <= 462)
    # Gold thread with bright yellow and pale highlights. Avoid the violet
    # stitching, dark velvet, and central symbols.
    r = rgb[:, :, 0].astype(int)
    g = rgb[:, :, 1].astype(int)
    b = rgb[:, :, 2].astype(int)
    gold = (r >= 112) & (g >= 67) & ((r - b) >= 35) & ((g - b) >= 12)
    mask = np.uint8((top | bottom) & gold) * 255
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=1)
    patched = cv2.inpaint(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), mask, 5, cv2.INPAINT_TELEA)
    out = Image.fromarray(cv2.cvtColor(patched, cv2.COLOR_BGR2RGB), 'RGB').convert('RGBA')
    out.putalpha(img.getchannel('A'))
    return out

def glyph_stamp(letter, font):
    # Layer a subtle purple/black thread edge under several gold highlights.
    w = max(140, int(font.size*2.6))
    h = max(140, int(font.size*2.6))
    layer = Image.new('RGBA', (w,h), (0,0,0,0))
    draw = ImageDraw.Draw(layer)
    box=draw.textbbox((0,0), letter, font=font, stroke_width=2)
    cx=(w - (box[2]-box[0])) / 2 - box[0]
    cy=(h - (box[3]-box[1])) / 2 - box[1]
    draw.text((cx+1,cy+2), letter, font=font, fill='#2b1029',
              stroke_width=3, stroke_fill='#2b1029')
    draw.text((cx,cy), letter, font=font, fill='#db9d24',
              stroke_width=2, stroke_fill='#fff2a8')
    draw.text((cx,cy-1), letter, font=font, fill='#ffe7a1',
              stroke_width=0)
    return layer

def curved_label(img, label, band):
    radius = 419 if band=='top' else 406
    size=68
    allowed=math.radians(123 if band=='top' else 133)
    while size>38:
        font=ImageFont.truetype(FONT,size)
        total=sum(font.getlength(c) for c in label)
        if total/radius < allowed: break
        size-=1
    offset=0.0
    for c in label:
        advance=font.getlength(c)
        middle=offset + advance/2
        if band=='top':
            theta = -math.pi/2 - total/(2*radius) + middle/radius
            rotation = - (math.degrees(theta) + 90)
        else:
            theta = math.pi/2 + total/(2*radius) - middle/radius
            rotation = 90-math.degrees(theta)
        # lettering is tangent to its annular band
        x=512+radius*math.cos(theta)
        y=512+radius*math.sin(theta)
        if c.strip():
            stamp=glyph_stamp(c,font)
            stamp=stamp.rotate(rotation, resample=Image.Resampling.BICUBIC, expand=True)
            img.alpha_composite(stamp, (round(x-stamp.width/2),round(y-stamp.height/2)))
        offset += advance

def make(id,locale,output):
    item=next((x for x in PLAN['items'] if x['id']==id),None)
    if not item or locale=='nb' or locale not in item['variants']:
        raise ValueError('Unknown/unsupported locale or badge')
    src=ROOT/item['sourceNorwegianCandidate']['path']
    with Image.open(src) as data:
        original=data.convert('RGBA')
    assert original.size==(1024,1024),original.size
    preserved_alpha=original.getchannel('A').tobytes()
    output_img=erase_gold_text(original)
    curved_label(output_img,item['variants'][locale]['heading'],'top')
    curved_label(output_img,item['variants'][locale]['footer'],'bottom')
    # Keep the exact alpha of the original embroidered patch.
    output_img.putalpha(original.getchannel('A'))
    assert output_img.getchannel('A').tobytes()==preserved_alpha
    out=ROOT/output
    out.parent.mkdir(parents=True,exist_ok=True)
    output_img.save(out,'WEBP',lossless=True,method=6)
    print(f'{out.relative_to(ROOT)} {out.stat().st_size} bytes')

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--badge',default='matematikk')
    parser.add_argument('--lang',default='en')
    parser.add_argument('--output',default='bilder/merker/vitenskap/kandidater/locales/en/matematikk-v2-preview.webp')
    args=parser.parse_args()
    make(args.badge,args.lang,args.output)
