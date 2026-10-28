#!/usr/bin/env python3
"""Visual review of the entrance. Coordinates on the 2560px derivative, original unchanged."""
from PIL import Image, ImageDraw
import os
base="bilder/places/review-viking-planet"
im=Image.open(base+"/full-reference.jpg").convert("RGB")
# Each crop is a 16:9 photo with the Viking Planet signage and actual entrance.
boxes={
 "crop-a":(0,280,500,560),
 "crop-b":(20,184,680,555),
 "crop-c":(25,250,565,554)
}
wall=Image.new("RGB",(1500,980),"#101010");draw=ImageDraw.Draw(wall)
for i,(name,coords) in enumerate(boxes.items()):
 crop=im.crop(coords)
 crop.save(f"{base}/{name}.jpg",quality=94,optimize=True)
 shown=crop.copy();shown.thumbnail((730,410))
 x=20+(i%2)*750;y=35+(i//2)*470
 wall.paste(shown,(x,y+25));draw.text((x,y),f"{name} / {coords}",fill="white")
wall.save(f"{base}/entrance-crop-review.jpg",quality=90,optimize=True)
print("Prepared targeted entrance crops:",[(k,v) for k,v in boxes.items()])
