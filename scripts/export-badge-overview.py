#!/usr/bin/env python3
"""Make one lossless contact sheet from the original tracked HG category badge files."""
from pathlib import Path
import io, json
from PIL import Image, ImageDraw, ImageFont
import cairosvg

root = Path(__file__).resolve().parents[1]
index = json.loads((root/'data/badges/index.json').read_text(encoding='utf-8'))
badges = [json.loads((root/filename).read_text(encoding='utf-8')) for filename in index['files']]
assert len(badges) == 19
out = root/'out'
out.mkdir(exist_ok=True)
canvas_w, columns, rows = 1800, 4, 5
margin, gap, card_w, card_h = 45, 22, 410, 350
header_h=160
canvas_h=header_h+rows*(card_h+gap)+35
canvas=Image.new('RGB',(canvas_w,canvas_h),'#0c1017')
draw=ImageDraw.Draw(canvas)
font_file='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font_bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
title_font=ImageFont.truetype(font_bold,60)
subtitle_font=ImageFont.truetype(font_file,23)
label_font=ImageFont.truetype(font_bold,24)
draw.text((margin,34),'HISTORY GO',font=title_font,fill='#f4d84b')
draw.text((margin,111),'19 eksisterende hovedmerker · originalfiler fra main (28.10.2026)',font=subtitle_font,fill='#b7c5d5')
metadata=[]
for i,badge in enumerate(badges):
    x=margin+(i%columns)*(card_w+gap)
    y=header_h+(i//columns)*(card_h+gap)
    draw.rounded_rectangle((x,y,x+card_w,y+card_h),radius=23,fill='#161c26',outline='#343b49',width=2)
    path=root/badge['image']
    assert str(path.resolve()).startswith(str(root.resolve())) and path.is_file(), path
    if path.suffix.lower()=='.svg':
        src=Image.open(io.BytesIO(cairosvg.svg2png(url=str(path),output_width=550,output_height=550))).convert('RGBA')
    else:
        src=Image.open(path).convert('RGBA')
    # Thumbnail only; keep the original pixels and aspect ratio unchanged.
    src.thumbnail((292,292),Image.Resampling.LANCZOS)
    canvas.paste(src,(x+(card_w-src.width)//2,y+9+(289-src.height)//2),src)
    name=badge['name']
    if len(name)>27: size=20
    elif len(name)>19: size=22
    else: size=26
    f=ImageFont.truetype(font_bold,size)
    left,top,right,bottom=draw.textbbox((0,0),name,font=f)
    draw.text((x+(card_w-(right-left))//2,y+311),name,font=f,fill='#f4f6fa')
    metadata.append({'id':badge['id'],'name':name,'source':badge['image'],'source_size':list(Image.open(path).size) if path.suffix.lower()!='.svg' else [512,512]})
dst=out/'history-go-merker-originale-20261028.png'
canvas.save(dst,optimize=True)
(out/'badge-sources.json').write_text(json.dumps({'badge_count':len(badges),'sources':metadata},ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Created {dst}, {dst.stat().st_size} bytes; {len(badges)} original badge assets')
