#!/usr/bin/env python3
"""Source-verified, unregistered portrait alternatives for two Oslo places."""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp/oslo-six-portrait-alternates'
SOURCE = ROOT / 'scripts/prepare-oslo-six-commons-webp.py'
USER_AGENT_DESCRIPTION = 'Uses existing Wikimedia source verification only'
SPEC = spec_from_file_location('oslo_commons_sources', SOURCE)
COMMONS = module_from_spec(SPEC)
SPEC.loader.exec_module(COMMONS)

WIDTH, HEIGHT = 900, 1350
SITES = [
    {
        'place_id': 'ekebergrestauranten',
        'file_page': 'https://commons.wikimedia.org/wiki/File:Ekebergrestauranten_Oslo_2016-04.jpg',
        'author': 'Zinneke',
        'license': 'CC BY-SA 3.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/3.0/',
        'original_sha1_hex': '172964cf4ac42c262c37c2ef85720c030bb1de8c',
        'original_dimensions': [3456, 5184],
        'crop_centers': [('original_aspect_centered', (0.5, 0.5))],
        'why': 'Original image is standing 2:3, unlike the low-quality 2010 portrait crop.'
    },
    {
        'place_id': 'frognerseteren',
        'file_page': 'https://commons.wikimedia.org/wiki/File:Frognerseteren_restaurant_-_2025_(2).jpg',
        'author': 'Ssu',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'original_sha1_hex': '6a6a0d802a1539724d274c083f5bbcd4eb0986ae',
        'original_dimensions': [4032, 3024],
        'crop_centers': [('center_original', (0.5, 0.5)),
                         ('offset_original', (0.65, 0.5))],
        'why': 'Evaluate newer 2025 building composition in lieu of 2009 sky-heavy candidate.'
    }
]

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    proposals=[]
    thumbs=[]
    for p in SITES:
        info=COMMONS.commons_image_info(p['file_page'])
        data=COMMONS.fetch(info['url'])
        if hashlib.sha1(data).hexdigest()!=p['original_sha1_hex']:
            raise RuntimeError('Original-source SHA1 mismatch for '+p['place_id'])
        if str(info['sha1']).lower().lstrip('0') not in {
            p['original_sha1_hex'].lstrip('0'),
            COMMONS.sha1_base36(data).lower().lstrip('0')
        }:
            raise RuntimeError('MediaWiki imageinfo checksum mismatch for '+p['place_id'])
        if info['mime'] != 'image/jpeg' or data[:2] != b'\xff\xd8':
            raise RuntimeError('Original MIME or JPEG signature mismatch for '+p['place_id'])
        with Image.open(io.BytesIO(data)) as src:
            # Pillow identifies some Apple JPEG containers as MPO. Commons
            # still reports image/jpeg. Decode the first image only, after
            # checking the original source SHA-1 and JPEG magic bytes above.
            if src.format not in ('JPEG', 'MPO'):
                raise RuntimeError('Unsupported original image container for '+p['place_id']+': '+str(src.format))
            if getattr(src,'n_frames',1)>1:
                src.seek(0)
            src.load()
            original=ImageOps.exif_transpose(src).convert('RGB')
        if list(original.size)!=p['original_dimensions']:
            raise RuntimeError('Original dimensions conflict for '+p['place_id'])
        for mode,center in p['crop_centers']:
            frame=ImageOps.fit(original,(WIDTH,HEIGHT),method=Image.Resampling.LANCZOS,centering=center)
            target=OUT / (p['place_id']+'__'+mode+'.webp')
            frame.save(target,'WEBP',quality=86,method=6)
            sha=hashlib.sha256(target.read_bytes()).hexdigest()
            proposals.append({
                'place_id':p['place_id'],'mode':mode,'path':target.relative_to(ROOT).as_posix(),
                'sha256':sha,'width':WIDTH,'height':HEIGHT,
                'source_page':p['file_page'],'author':p['author'],
                'license':p['license'],'license_url':p['license_url'],
                'source_sha1':p['original_sha1_hex'],
                'review_reason':p['why'],
                'visual_approved':False,'committed_to_runtime':False
            })
            thumbs.append((p['place_id']+' | '+mode,frame.resize((270,405))))
    if len(proposals)!=3:
        raise RuntimeError('Expected three alternate crop proposals')
    fro=[x['sha256'] for x in proposals if x['place_id']=='frognerseteren']
    if len(set(fro))!=2:
        raise RuntimeError('Frognerseteren needs visually distinct alternatives')
    contact=Image.new('RGB',(3*286+14,475),'#1a202a')
    pen=ImageDraw.Draw(contact)
    for i,(label,img) in enumerate(thumbs):
        x=14+i*286
        contact.paste(img,(x,14))
        pen.text((x,430),label[:44],fill='#ffffff')
    contact.save(OUT/'alternate-contact-sheet.jpg',quality=90)
    report={
        'schema':'history_go_oslo_six_alt_portrait_source_review_v1',
        'status':'ARTIFACT_ONLY_UNREVIEWED_NEVER_RUNTIME',
        'source_license_pages_manually_checked':True,
        'count':len(proposals),
        'places':['ekebergrestauranten','frognerseteren'],
        'visual_approval_count':0,
        'active_place_bindings':0,
        'proposals':proposals,
        'note':'Licenses verified from respective Wikimedia Commons file pages; portraits still require visual review, checked-in bytes, credits, PlaceCard QA and complete place release gates.'
    }
    (OUT/'review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Alternative portrait proposals',len(proposals),'for two held places; zero live image bindings')

if __name__=='__main__':
    main()
