#!/usr/bin/env python3
"""Make a suitably cropped entrance photograph from Wolfmann, CC BY-SA 4.0."""
import io,os,urllib.request
from urllib.parse import quote
from PIL import Image,ImageEnhance
name="Oslo rådhus City Hall Norway Main Entrance Inngang borggård Fridtjof Nansens plass Morning sunlight Shadows Blue skye Sett paving Restaurants outdoor tables Viking Planet etc Distorted panorama 2020-09-02 IMG 9671.jpg"
urls=[
 "https://upload.wikimedia.org/wikipedia/commons/6/61/"+quote(name.replace(" ","_")),
 "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quote(name)+"?width=5120"
]
data=None;error=None
for url in urls:
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"HistoryGoEducationalPhoto/1.0 (https://github.com/Paradispartiet/History-Go)"})
  with urllib.request.urlopen(req,timeout=45) as f: data=f.read()
  test=Image.open(io.BytesIO(data))
  if test.width>=1200: break
  data=None
 except Exception as exc: error=str(exc);print("Source request failed:",error[:250])
if not data: raise RuntimeError("Licensed Commons image unavailable: "+str(error))
im=Image.open(io.BytesIO(data)).convert("RGB")
fx=im.width/2560.0;fy=im.height/566.0
crop=im.crop((0,round(280*fy),round(500*fx),round(560*fy)))
crop=ImageEnhance.Brightness(crop).enhance(1.23)
crop=ImageEnhance.Contrast(crop).enhance(1.04)
crop.thumbnail((2000,1200),Image.Resampling.LANCZOS)
dest="bilder/places/viking_planet_oslo_entrance_2020.jpg"
os.makedirs(os.path.dirname(dest),exist_ok=True)
crop.save(dest,"JPEG",quality=89,subsampling=0,progressive=True,optimize=True)
print("Source dimensions",im.size,"output",crop.size,"bytes",os.path.getsize(dest))
