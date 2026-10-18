#!/usr/bin/env python3
"""Materialize three reviewed-source photos; never promote editorial v1 status."""
from pathlib import Path
import importlib.util
import io
import json
import subprocess
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('photo_helpers', ROOT/'scripts/produce-oslo-photo-review-candidates-20261018.py')
HELPERS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(HELPERS)
OUT = ROOT/'bilder/places/oslo-v1-20261018-batch04'
REPORT = ROOT/'reports/oslo-v1-photos-batch04-20261018'
BATCH = ROOT/'data/places/production-tiers/v1-oslo-nature-music-20261017-batch02.json'
SIZES = {'hero': [1400,900], 'portrait': [900,1350], 'card': [900,600]}
SOURCES = [
 {'id':'ankerbrua','file':'Ankerbrua Oslo.jpg','author':'Mahlum','license':'Public domain',
  'license_url':'https://creativecommons.org/publicdomain/mark/1.0/', 'date':'2008-04-17',
  'caption':'Ankerbrua og Akerselva, fotografert av Mahlum i april 2008.',
  'crop':{'hero':[.5,.6,1], 'portrait':[.5,.55,1.05], 'card':[.5,.6,1]},'hero_position':'50% 58%'},
 {'id':'hausmannsbrua','file':'Hausmanns bru north side.jpg','author':'Helge Høifødt','license':'CC BY-SA 3.0',
  'license_url':'https://creativecommons.org/licenses/by-sa/3.0/', 'date':'2011-06-29',
  'caption':'Hausmannsbruas nordside over Akerselva, fotografert av Helge Høifødt i juni 2011.',
  'crop':{'hero':[.5,.57,1], 'portrait':[.53,.56,1], 'card':[.5,.57,1]},'hero_position':'50% 60%'},
 {'id':'hausmania','file':'Hausmania fasade.jpg','author':'Hellando','license':'CC BY-SA 4.0',
  'license_url':'https://creativecommons.org/licenses/by-sa/4.0/', 'date':'2017-08-01',
  'caption':'Hausmania sett fra gangveien langs Akerselva, fotografert av Hellando i august 2017.',
  'crop':{'hero':[.5,.53,1], 'portrait':[.5,.53,1], 'card':[.5,.53,1]},'hero_position':'50% 52%'}
]

def dump(path, value):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def main():
 if OUT.exists():
  raise SystemExit('Immutable output directory already exists; refusing to overwrite published files')
 records=[]; buffers={}
 batch=json.loads(BATCH.read_text()); rows={p['place_id']:p for p in batch['places']}
 for source in SOURCES:
  license_name,artist,url=HELPERS.file_info(source['file'])
  if license_name.casefold()!=source['license'].casefold():raise ValueError('License mismatch: '+source['id'])
  if source['author'].casefold() not in artist.casefold():raise ValueError('Author mismatch: '+source['id'])
  data=HELPERS.get(url,'image/*')
  with Image.open(io.BytesIO(data)) as raw:
   image=ImageOps.exif_transpose(raw).convert('RGB')
  if image.width<1400 or image.height<1000:raise ValueError('Insufficient source resolution: '+source['id'])
  outputs={}
  for kind,size in SIZES.items():
   rel=str((OUT/(source['id']+'_'+kind+'.webp')).relative_to(ROOT))
   buf=io.BytesIO();HELPERS.subject_crop(image,size,source['crop'][kind]).save(buf,'WEBP',quality=87,method=6)
   buffers[rel]=buf.getvalue();outputs[kind]=rel
  records.append({**source,'source_page':'https://commons.wikimedia.org/wiki/File:'+HELPERS.urllib.parse.quote(source['file'].replace(' ','_')),
                  'commons_artist_metadata':artist,'download_url':url,'source_dimensions':[image.width,image.height],
                  'output':outputs,'review_status':'materialized_pending_visual_review'})
 # All downloads and encodes succeeded before changing any served binding.
 for rel,data in buffers.items():
  target=ROOT/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 index_path=ROOT/'data/places/places_index.json';index=json.loads(index_path.read_text())
 for record in records:
  row=rows[record['id']];path=ROOT/row['place_file'];place=json.loads(path.read_text())
  if place['id']!=record['id']:raise ValueError('Canonical identity mismatch')
  meta={'source':'wikimedia_commons','sourcePage':record['source_page'],'creator':record['author'],
        'credit':record['author']+' / Wikimedia Commons','license':record['license'],'licenseUrl':record['license_url'],
        'date':record['date'],'verifiedAt':'2026-10-18','transformation':'Separate subject-led crop and WebP encoding.'}
  for kind,field,mfield in [('hero','image','imageMeta'),('portrait','frontImage','frontImageMeta'),('card','cardImage','cardImageMeta')]:
   place[field]=record['output'][kind]
   place[mfield]={**meta,'assetType':'documentary_place_portrait' if kind=='portrait' else 'documentary_place_photo',
                  'outputDimensions':'x'.join(map(str,SIZES[kind])),'cropSettings':record['crop'][kind]}
  place['frontImageMeta']['orientation']='portrait';place['imageCard']=place['cardImage']
  place.update(imageCaption=record['caption'],imageCredit=meta['credit'],imageLicense=record['license'],imageSourceUrl=record['source_page'],
               imageComposition={'portraitPosition':'50% 50%','heroPosition':record['hero_position'],'portraitRatio':'3:4',
                                 'heroBehavior':'cover_with_subject_focal_point','quizCardBehavior':'contain_never_crop'})
  dump(path,place)
  indexed=next(p for p in index if p['id']==place['id'])
  for field in ['image','frontImage','cardImage']:indexed[field]=place[field]
  row.update(photo_source=record['source_page'],photo_license=record['license'],photo_author=record['author'],
             photo_status='three_licensed_local_variants_produced_visual_review_pending',
             frontImage_status='separate_local_portrait_file_produced',media_design_review='batch04_pending_visual_review')
 dump(index_path,index);dump(BATCH,batch)
 subprocess.run(['node','scripts/build-place-open-payloads.mjs'],cwd=ROOT,check=True)
 report={'schema':'history_go_oslo_photo_batch04_v1','date':'2026-10-18','produced':records,
         'held':[{'place_id':'alna_smalvoll','reason':'No identity-verified reusable photo of this exact river segment found; other Alna locations are not substitutes.'},
                 {'place_id':'torggata_blad','reason':'Official property photo is an editorial reference; no documented reuse license. No verified free photo of Hausmanns gate 19 found.'}],
         'counts':{'places':3,'assets':9,'held':2,'v1_promoted':0},'policy':'Image-only update; retain canonical production profile and editorial v1_candidate status.'}
 dump(REPORT/'report.json',report)
 canvas=Image.new('RGB',(1000,3*325),'#17181c');draw=ImageDraw.Draw(canvas)
 for n,r in enumerate(records):
  y=n*325;draw.text((10,y+5),r['id'],fill='white')
  for kind,x,size in [('hero',10,(420,270)),('portrait',450,(180,270)),('card',650,(330,220))]:
   with Image.open(ROOT/r['output'][kind]) as im:
    im.thumbnail(size);canvas.paste(im,(x,y+25))
 canvas.save(REPORT/'contact-sheet.jpg',quality=87)
 print('PRODUCED',json.dumps(report['counts']),flush=True)

if __name__=='__main__':main()
