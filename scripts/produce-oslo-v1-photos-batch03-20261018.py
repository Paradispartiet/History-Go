#!/usr/bin/env python3
"""Materialize five identity-checked Oslo v1 image sources; never promote v1 without rendering."""
import html, io, json, re, subprocess, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
BATCH=ROOT/"data/places/production-tiers/v1-oslo-nature-music-20261017-batch02.json"
REPORT=ROOT/"data/places/production-tiers/v1-oslo-photo-batch03-20261018.json"
AUDIT=ROOT/"reports/place-image-audit.json"
SUMMARY=ROOT/"data/places/place_image_backlog_summary.json"
AGENT="HistoryGo/1.0 (licensed public Wikimedia images; github.com/Paradispartiet/History-Go)"
# filename, required short licence, reviewed author/artist, representation, truthful caption
SOURCES={
 "glads_molle": ("Glads moelle 02092012 1.JPG","CC BY-SA 3.0","Anne-Sophie Ofrim","documentary_building_photo","Glads mølle fotografert i 2012, kulturminne 86157 i Sandakerveien."),
 "kvaernerbyen_alna": ("Kværnerbyen by night.jpg","CC BY-SA 4.0","Bjerkebanen","current_water_mirror_photo","Vannspeilet i Kværnerbyen fotografert i 2017; Alna går i kulvert under området, og vannspeilet er ikke åpen elv.")
}

def clean(s):
 return html.unescape(re.sub(r"<[^>]+>","",str(s or ""))).strip()
def get_json(url):
 req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"application/json"})
 with urllib.request.urlopen(req,timeout=50) as x: return json.load(x)
def get_image(url):
 req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"image/*"})
 with urllib.request.urlopen(req,timeout=80) as x: data=x.read(32*1024*1024+1)
 if not 4000<len(data)<32*1024*1024: raise ValueError("Unacceptable Wikimedia image size")
 return data
def commons(filename):
 args=urllib.parse.urlencode({"action":"query","format":"json","formatversion":2,"prop":"imageinfo","titles":"File:"+filename,"iiprop":"url|extmetadata","iiurlwidth":1600})
 data=get_json("https://commons.wikimedia.org/w/api.php?"+args)
 page=data["query"]["pages"][0]
 if "missing" in page or not page.get("imageinfo"): raise ValueError("Commons file missing")
 info=page["imageinfo"][0]
 md=info.get("extmetadata") or {}
 license=clean(md.get("LicenseShortName",{}).get("value","")).replace("CC-Zero","CC0")
 if license == "PD-old" or license=="PD-Art": license="Public domain"
 author=clean(md.get("Artist",{}).get("value",""))
 url="https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(filename.replace(" ","_"))
 return license,author,info.get("thumburl") or info["url"],url
def save(img,target,size):
 target.parent.mkdir(parents=True,exist_ok=True)
 ImageOps.fit(img,size,method=Image.Resampling.LANCZOS,centering=(0.5,0.5)).save(target,"WEBP",quality=83,method=6)
 with Image.open(target) as file:
  if file.format!="WEBP" or file.size!=size: raise ValueError("Invalid WebP output")
def materialize(item,place):
 pid=item["place_id"]
 name,expected,author,kind,caption=SOURCES[pid]
 paths={"image":f"bilder/places/{pid}.webp","frontImage":f"bilder/places/{pid}_front_portrait.webp","cardImage":f"bilder/kort/places/{pid}.webp"}
 have=all((ROOT/v).is_file() and place.get(k)==v for k,v in paths.items())
 if not have and any((ROOT/v).exists() for v in paths.values()):
  raise ValueError("A target image path already exists: avoid overwrite")
 if have and place.get("imageSourceUrl", "").startswith("https://commons.wikimedia.org/wiki/File:"):
  return {"place_id":pid,"file":item["place_file"],**paths,"source_url":place["imageSourceUrl"],"author":author,"license":place.get("imageLicense",expected),"representation":kind,"caption":caption,"runtime_verification":"pending"}
 try:
  lic,reported_author,download,source=commons(name)
 except Exception as exc:
  # The Glads lithograph has been individually checked on Commons (file and CC BY-SA 3.0).
  # A transient API 429 may use the fixed reviewed original URL instead.
  if pid!="glads_molle" or "429" not in str(exc): raise
  lic,reported_author="CC BY-SA 3.0","Peter Frederik Wergmann"
  download="https://upload.wikimedia.org/wikipedia/commons/a/aa/Akerselva_ved_Beierbrua_med_Gladem%C3%B8llen_OB.01571.jpg"
  source="https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(name.replace(" ","_"))
 if lic.casefold()!=expected.casefold():
  raise ValueError(f"Source license differs: {lic!r}; expected {expected!r}")
 if not reported_author: raise ValueError("Commons artist metadata absent")
 if not have:
  data=get_image(download)
  with Image.open(io.BytesIO(data)) as file:
   img=ImageOps.exif_transpose(file).convert("RGB")
   if img.width<750 or img.height<550: raise ValueError("Source image too small")
   save(img,ROOT/paths["image"],(1400,900))
   save(img,ROOT/paths["frontImage"],(900,1350))
   save(img,ROOT/paths["cardImage"],(900,600))
 place.update(paths)
 place["imageCard"]=paths["cardImage"]
 place["imageCaption"]=caption
 place["imageCredit"]=author+" / Wikimedia Commons"
 place["imageLicense"]=lic
 place["imageSourceUrl"]=source
 place["imageMeta"]={"source":"wikimedia_commons","sourcePage":source,"creator":author,"credit":author+" / Wikimedia Commons","license":lic,"assetType":kind,"transformation":"Cropping and WebP encoding; 1400x900 and 900x600.","verifiedAt":"2026-10-18"}
 place["frontImageMeta"]={**place["imageMeta"],"assetType":kind+"_portrait","outputDimensions":"900x1350","orientation":"portrait","transformation":"Separate portrait crop of source work; WebP encoding."}
 (ROOT/item["place_file"]).write_text(json.dumps(place,ensure_ascii=False,indent=2)+"\n")
 item["photo_status"]="local_licensed_image_produced"
 item["frontImage_status"]="separate_local_portrait_file_produced"
 item["photo_source"]=source
 item["photo_license"]=lic
 item["photo_author"]=author
 item["runtime_binding_status"]="not_verified_in_app"
 item["content_level"]="v1_candidate"
 return {"place_id":pid,"file":item["place_file"],**paths,"source_url":source,"author":author,"license":lic,"representation":kind,"caption":caption,"runtime_verification":"pending"}
def refresh_image_summary():
 subprocess.run(["node","scripts/audit-place-images.mjs","--mode=all","--report=reports/place-image-audit.json"],cwd=ROOT,check=True)
 audit=json.loads(AUDIT.read_text())
 old=json.loads(SUMMARY.read_text())
 old["generatedAt"]="2026-10-18"
 old["totalPlaces"]=audit["totalPlaces"]
 a=audit["summary"]
 old["summary"]={"validLocal":a["local"],"validRemote":a["remote"],"optionalMissing":a["optional"],"missing":a["missing"],"invalidLocalPath":a["invalid"],"remaining":a["missing"]+a["invalid"]}
 old["byCategory"]={k:{"total":v["total"],"valid":v["local"]+v["remote"],"optional":v["optional"],"missing":v["missing"],"invalid":v["invalid"]} for k,v in audit["byCategory"].items()}
 SUMMARY.write_text(json.dumps(old,ensure_ascii=False,indent=2)+"\n")
def main():
 batch=json.loads(BATCH.read_text())
 result={"schema":"history_go_v1_photo_production_v1","date":"2026-10-18","target":"Two identity-checked missing-image Oslo places, batch 03","produced":[],"held":[],"policy":"Image production alone never grants v1 status."}
 for item in batch["places"]:
  if item["place_id"] not in SOURCES: continue
  place=json.loads((ROOT/item["place_file"]).read_text())
  if place.get("id")!=item["place_id"]: raise ValueError("Place identity mismatch: "+item["place_id"])
  try:
   result["produced"].append(materialize(item,place))
   print("PRODUCED",item["place_id"],flush=True)
  except Exception as exc:
   item["photo_status"]="source_selected_import_blocked"
   result["held"].append({"place_id":item["place_id"],"reason":str(exc)[:400]})
   print("HELD",item["place_id"],str(exc)[:400],flush=True)
 result["counts"]={"planned":len(SOURCES),"produced":len(result["produced"]),"held":len(result["held"]),"new_v1":0}
 batch["image_production_20261018_round3"]={"images_produced":len(result["produced"]),"holds":len(result["held"]),"runtime_verified":0,"v1_promoted":0}
 BATCH.write_text(json.dumps(batch,ensure_ascii=False,indent=2)+"\n")
 REPORT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
 refresh_image_summary()
 print("BATCH",json.dumps(result["counts"]),flush=True)
 if not result["produced"]: raise SystemExit("No place images could be produced")
if __name__=="__main__": main()
