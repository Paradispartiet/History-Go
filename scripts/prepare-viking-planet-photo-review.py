#!/usr/bin/env python3
"""Review-only crop proof for documented Wolfmann CC BY-SA 4.0 panorama."""
import io, os, urllib.request
from PIL import Image, ImageDraw, ImageFont
name="Oslo_rådhus_City_Hall_Norway_Main_Entrance_Inngang_borggård_Fridtjof_Nansens_plass_Morning_sunlight_Shadows_Blue_skye_Sett_paving_Restaurants_outdoor_tables_Viking_Planet_etc_Distorted_panorama_2020-09-02_IMG_9671.jpg"
from urllib.parse import quote
urls=[
"https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quote(name)+"?width=2560",
"https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/"+quote(name)+"/2560px-thumbnail.jpg"
]
raw=None
for url in urls:
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"HistoryGoEducationalMediaReview/1.0 (contact: https://github.com/Paradispartiet/History-Go)"})
  with urllib.request.urlopen(req,timeout=35) as res: raw=res.read()
  if raw and len(raw)>10000: break
 except Exception as e: print("Source failed",str(e)[:250])
if not raw: raise RuntimeError("Could not load licensed Commons photo")
im=Image.open(io.BytesIO(raw)).convert("RGB")
print("Loaded panorama:",im.size)
out="bilder/places/review-viking-planet"
os.makedirs(out,exist_ok=True)
im.thumbnail((2560,2560))
im.save(out+"/full-reference.jpg",quality=85,optimize=True)
w,h=im.size
tw=min(680,w//3)
lefts=[0,int((w-tw)*.2),int((w-tw)*.4),int((w-tw)*.6),w-tw]
wall=Image.new("RGB",(3*680,2*500),(20,20,20))
d=ImageDraw.Draw(wall)
for i,left in enumerate(lefts):
 crop=im.crop((left,0,min(w,left+tw),h))
 crop.thumbnail((650,460))
 xx=(i%3)*680+15;yy=(i//3)*500+28
 wall.paste(crop,(xx,yy))
 d.text((xx,yy-20),f"Section {i+1}, x={left}/{w}",fill="white")
 crop.save(out+f"/section-{i+1}.jpg",quality=87,optimize=True)
wall.save(out+"/contact-sheet.jpg",quality=88,optimize=True)
