#!/usr/bin/env python3
"""One-shot reviewed crop production for Oslo v1. Does not grant v1 approval."""
from __future__ import annotations
import html, io, json, re, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
BATCH=ROOT/"data/places/production-tiers/v1-oslo-nature-music-20261017-batch02.json"
REPORT=ROOT/"data/places/production-tiers/v1-oslo-image-design-review-20261018.json"
PREVIEW=ROOT/"reports/oslo-v1-image-composition-preview-20261018.jpg"
AGENT="HistoryGoOsloMediaReview/1.0 (Wikimedia attribution; github.com/Paradispartiet/History-Go)"
# An image must depict the named location, have a Commons-verified reuse licence,
# and be preferable when previewed in BOTH a 3:4 portrait and a wide header.
REPLACEMENTS={
  "groruddammen":{"file":"Groruddammen seen from above..JPG","expected":None,"portrait":(0.52,0.52),"landscape":(0.50,0.55),"card":(0.50,0.56),"caption":"Groruddammen sett ovenfra; faktisk dam og parkanlegg."},
  "blaa":{"file":"Blå 17.jpg","expected":"CC BY-SA 4.0","portrait":(0.50,0.52),"landscape":(0.50,0.52),"card":(0.50,0.55),"caption":"Uteserveringen ved Blå i Brenneriveien, sommeren 2018."},
  "vulkan_industriomrade":{"file":"Vulkan Oslo 2022-08-17 01.jpg","expected":"CC0","portrait":(0.50,0.50),"landscape":(0.50,0.50),"card":(0.50,0.55),"caption":"Vulkan-området ved Akerselva fotografert i august 2022."},
  "glads_molle":{"file":"Sagene Glads Moelle 86157 IMG 3925.jpg","expected":None,"portrait":(0.50,0.44),"landscape":(0.50,0.52),"card":(0.50,0.50),"caption":"Glads mølle, den historiske fabrikkbygningen ved Akerselva."}
}
FOCAL={
 "groruddammen":("52% 53%","50% 65%"),
 "svartdalen":("50% 50%","50% 54%"),
 "alnaparken":("50% 52%","50% 60%"),
 "alna_bryn":("52% 52%","50% 70%"),
 "kvaernerbyen_alna":("50% 50%","50% 55%"),
 "alna_utlop_bjorvika":("50% 50%","50% 59%"),
 "voienfossen":("50% 50%","50% 51%"),
 "myralokka":("50% 50%","50% 46%"),
 "vaterland_historisk_elvelop":("50% 50%","50% 57%"),
 "vulkan_industriomrade":("50% 50%","50% 51%"),
 "glads_molle":("50% 50%","50% 54%"),
 "salt":("50% 50%","50% 55%"),
 "blaa":("50% 50%","50% 58%"),
 "rockefeller":("50% 50%","50% 54%"),
 "john_dee":("50% 50%","50% 57%"),
 "sentrum_scene":("50% 50%","50% 48%")
}
ALLOWED={"CC0","Public domain","CC BY-SA 4.0","CC BY-SA 3.0","CC BY-SA 3.0 no","CC BY 3.0","CC BY 4.0"}
def clean(value): return html.unescape(re.sub(r"<[^>]+>","",str(value or ""))).strip()
def open_url(url,accept):
 for attempt in range(4):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":accept})
   with urllib.request.urlopen(req,timeout=70) as r:
    data=r.read(36_000_001)
   if len(data)>36_000_000: raise ValueError("file too large")
   return data
  except Exception as e:
   if attempt==3 or not any(code in str(e) for code in ("429","503","502","504","timed out")): raise
   time.sleep(3*(attempt+1))
def info(filename):
 url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
  "action":"query","format":"json","formatversion":2,"titles":"File:"+filename,
  "prop":"imageinfo","iiprop":"url|extmetadata","iiurlwidth":"2600"})
 page=json.loads(open_url(url,"application/json"))["query"]["pages"][0]
 if "missing" in page or not page.get("imageinfo"): raise ValueError("Commons file missing")
 image=page["imageinfo"][0]
 md=image.get("extmetadata",{})
 license=clean(md.get("LicenseShortName",{}).get("value","")).replace("CC-Zero","CC0").replace("CC Zero","CC0")
 creator=clean(md.get("Artist",{}).get("value",""))
 if license not in ALLOWED: raise ValueError("Licence not in approved reuse set: "+license)
 if not creator: raise ValueError("Missing Commons creator attribution")
 return {"license":license,"creator":creator,"download":image.get("thumburl") or image["url"],
         "source":"https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(filename.replace(" ","_"))}
def crop(im,size,center):
 return ImageOps.fit(im,size,method=Image.Resampling.LANCZOS,centering=center)
def record_asset(root_obj,key,p):
 root_obj[key]=p
def replace_assets(item,settings):
 pid=item["place_id"]
 path=ROOT/item["place_file"]
 place=json.loads(path.read_text())
 if place.get("id")!=pid: raise ValueError("Place ID mismatch")
 details=info(settings["file"])
 if settings["expected"] and settings["expected"]!=details["license"]:
  raise ValueError("Unexpected source license: "+details["license"])
 raw=open_url(details["download"],"image/*")
 if len(raw)<4000: raise ValueError("Truncated image")
 with Image.open(io.BytesIO(raw)) as original:
  im=ImageOps.exif_transpose(original).convert("RGB")
  if im.width<1200 or im.height<850: raise ValueError("Insufficient resolution")
  imgs={
   "image":("bilder/places/"+pid+".webp",(1400,900),settings["landscape"]),
   "frontImage":("bilder/places/"+pid+"_front_portrait.webp",(900,1350),settings["portrait"]),
   "cardImage":("bilder/kort/places/"+pid+".webp",(900,600),settings["card"])}
  encoded={}
  for key,(rel,size,point) in imgs.items():
   buf=io.BytesIO();crop(im,size,point).save(buf,"WEBP",quality=87,method=6)
   if buf.tell()<10000: raise ValueError("Output unexpectedly small")
   encoded[key]=(rel,buf.getvalue())
 # Only write once all derivatives exist, to avoid half-updated place metadata.
 for key,(rel,data) in encoded.items():
  p=ROOT/rel
  p.parent.mkdir(parents=True,exist_ok=True)
  p.write_bytes(data)
  place[key]=rel
 place["imageCard"]=place["cardImage"]
 place["imageCaption"]=settings["caption"]
 place["imageCredit"]=details["creator"]+" / Wikimedia Commons"
 place["imageLicense"]=details["license"]
 place["imageSourceUrl"]=details["source"]
 place["imageMeta"]={"source":"wikimedia_commons","sourcePage":details["source"],"creator":details["creator"],
                     "credit":place["imageCredit"],"license":details["license"],
                     "assetType":"documentary_place_photo","verifiedAt":"2026-10-18",
                     "transformation":"Editorial subject-led crops, WebP; 1400x900 and 900x600."}
 place["frontImageMeta"]={**place["imageMeta"],"assetType":"documentary_place_portrait",
                         "orientation":"portrait","outputDimensions":"900x1350",
                         "transformation":"Separate, intentional 3:4 composition from licensed original."}
 path.write_text(json.dumps(place,ensure_ascii=False,indent=2)+"\n")
 item["photo_source"]=details["source"]
 item["photo_license"]=details["license"]
 item["photo_author"]=details["creator"]
 item["photo_status"]="local_photo_and_rights_record_produced"
 item["frontImage_status"]="separate_local_portrait_file_produced"
 return {"place_id":pid,"source":details["source"],"author":details["creator"],"license":details["license"],"caption":settings["caption"]}
def build_contact_sheet(batch):
 ids=list(FOCAL)
 tilew,tileh=252,410
 canvas=Image.new("RGB",(tilew*4,tileh*4),(15,18,23))
 draw=ImageDraw.Draw(canvas)
 for ix,id in enumerate(ids):
  x=(ix%4)*tilew
  y=(ix//4)*tileh
  with Image.open(ROOT/f"bilder/places/{id}_front_portrait.webp") as im:
   preview=ImageOps.fit(im.convert("RGB"),(218,320))
   canvas.paste(preview,(x+17,y+14))
  with Image.open(ROOT/f"bilder/places/{id}.webp") as im:
   wide=ImageOps.fit(im.convert("RGB"),(218,58))
   canvas.paste(wide,(x+17,y+339))
  draw.text((x+17,y+399),id,fill=(246,208,88))
 PREVIEW.parent.mkdir(parents=True,exist_ok=True)
 canvas.save(PREVIEW,"JPEG",quality=80,optimize=True)
def main():
 batch=json.loads(BATCH.read_text())
 records={p["place_id"]:p for p in batch["places"]}
 if len(FOCAL)!=16: raise ValueError("Expected sixteen materialized places")
 result={"schema":"history_go_oslo_v1_image_design_review_v1","reviewDate":"2026-10-18",
         "method":"Reviewed original sources, separate portrait/landscape/card compositions; visible card preview is not device approval.",
         "attemptedReplacements":list(REPLACEMENTS),"replaced":[],"held":[],"focalPositions":FOCAL,
         "visualAppVerification":"pending","v1Approved":0}
 for pid, settings in REPLACEMENTS.items():
  try:
   item=replace_assets(records[pid],settings)
   result["replaced"].append(item)
   print("REPLACED",pid,item["license"],flush=True)
  except Exception as e:
   result["held"].append({"place_id":pid,"reason":str(e)[:300]})
   print("HELD",pid,str(e)[:260],flush=True)
 for pid,(portrait,hero) in FOCAL.items():
  item=records[pid]
  path=ROOT/item["place_file"]
  place=json.loads(path.read_text())
  if place.get("id")!=pid: raise ValueError("ID drift "+pid)
  for field in ("image","frontImage","cardImage"):
   asset=str(place.get(field,""))
   if not asset.startswith("bilder/") or not (ROOT/asset).is_file(): raise ValueError(pid+": "+field+" missing")
  place["imageComposition"]={"portraitPosition":portrait,"heroPosition":hero,
          "portraitRatio":"3:4","heroBehavior":"cover_with_subject_focal_point",
          "quizCardBehavior":"contain_never_crop"}
  path.write_text(json.dumps(place,ensure_ascii=False,indent=2)+"\n")
  item["media_design_review"]="composition_reviewed_in_contact_sheet_not_device_verified"
  item["runtime_binding_status"]="not_verified_in_app"
  item["content_level"]="v1_candidate"
 result["replacedCount"]=len(result["replaced"])
 result["heldCount"]=len(result["held"])
 result["reviewedPlaces"]=len(FOCAL)
 build_contact_sheet(batch)
 result["preview"]="reports/oslo-v1-image-composition-preview-20261018.jpg"
 BATCH.write_text(json.dumps(batch,ensure_ascii=False,indent=2)+"\n")
 REPORT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
 print("RESULT",json.dumps({"replaced":result["replacedCount"],"held":result["heldCount"],"reviewed":16}),flush=True)
if __name__=="__main__": main()
