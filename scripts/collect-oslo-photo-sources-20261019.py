#!/usr/bin/env python3
"""Collect documentary photo candidates and unmodified Commons rights metadata.

Read-only research: never changes a served photo, Place text or production status.
"""
import html
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.tmp/oslo-twenty-photo-sources'
AGENT = 'HistoryGoPhotoResearch/1.0 (https://github.com/Paradispartiet/History-Go)'

def get(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': AGENT})
            with urllib.request.urlopen(req, timeout=55) as response:
                data = response.read(24 * 1024 * 1024 + 1)
            if len(data) > 24 * 1024 * 1024:
                raise ValueError('Source exceeds size limit')
            return data
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))

def api(args):
    return json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'format':'json','formatversion':2,**args})))

def clean(text):
    return html.unescape(re.sub(r'<[^>]*>', '', str(text or ''))).strip()

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((ROOT / 'data/places/production-tiers/oslo-twenty-photo-selection-20261019.json').read_text())
    report = {'schema':'history_go_commons_photo_source_research_v1', 'date':'2026-10-19', 'places':[], 'policy':'Metadata and file candidates only; human identity, rights and visual acceptance required.'}
    for row in manifest['places']:
        names = row['source_files'][:]
        entry = {'place_id':row['place_id'], 'sources':[], 'errors':[]}
        if row.get('search'):
            try:
                search = api({'action':'query','list':'search','srsearch':row['search'],'srnamespace':6,'srlimit':4})
                names += [x['title'].removeprefix('File:') for x in search['query']['search']]
            except Exception as error:
                entry['errors'].append(str(error))
        # Existing photos are researched too, so the final twenty-place review
        # does not confuse existing metadata with newly accepted provenance.
        if not names and row.get('existing_front_image'):
            place = json.loads((ROOT / row['place_file']).read_text())
            page = (place.get('frontImageMeta') or {}).get('sourcePage', '')
            if '/wiki/File:' in page:
                names.append(urllib.parse.unquote(page.split('/wiki/File:',1)[1]).replace('_',' '))
        for number, name in enumerate(dict.fromkeys(names)):
            try:
                query = api({'action':'query','prop':'imageinfo','titles':'File:'+name,'redirects':1,'iiprop':'url|size|extmetadata','iiurlwidth':2400})
                page = query['query']['pages'][0]
                info = page['imageinfo'][0]
                metadata = info.get('extmetadata', {})
                filename = row['place_id'] + '-' + str(number) + '.jpg'
                data = get(info.get('thumburl') or info['url'])
                with Image.open(io.BytesIO(data)) as original:
                    image = ImageOps.exif_transpose(original).convert('RGB')
                    image.save(OUT / filename, quality=94)
                entry['sources'].append({'filename':page['title'].removeprefix('File:'), 'local_file':filename,
                    'source_page':info.get('descriptionurl'), 'download_url':info.get('thumburl') or info['url'],
                    'original_dimensions':[info['width'], info['height']], 'download_dimensions':list(image.size),
                    'author':clean(metadata.get('Artist',{}).get('value')),
                    'license':clean(metadata.get('LicenseShortName',{}).get('value')),
                    'license_url':clean(metadata.get('LicenseUrl',{}).get('value')),
                    'description':clean(metadata.get('ImageDescription',{}).get('value')),
                    'date':clean(metadata.get('DateTimeOriginal',{}).get('value')),
                    'raw_extmetadata':metadata})
                print('SOURCE', row['place_id'], name, flush=True)
            except Exception as error:
                entry['errors'].append({'filename':name,'error':str(error)})
                print('HELD', row['place_id'], name, str(error), flush=True)
        report['places'].append(entry)
        (OUT / 'sources.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
        if entry['sources']:
            canvas = Image.new('RGB',(1200, len(entry['sources'])*330),'#191b20')
            draw = ImageDraw.Draw(canvas)
            for number, source in enumerate(entry['sources']):
                y = number*330
                draw.text((10,y+5),source['local_file']+' | '+source['license'], fill='white')
                draw.text((10,y+22),source['filename'][:140], fill='white')
                with Image.open(OUT/source['local_file']) as img:
                    img.thumbnail((1160,280))
                    canvas.paste(img,(10,y+45))
            canvas.save(OUT/(row['place_id']+'-sources.jpg'),quality=86)
    print('RESEARCH',len(report['places']),'places',sum(len(x['sources']) for x in report['places']),'sources',flush=True)

if __name__ == '__main__':
    main()
