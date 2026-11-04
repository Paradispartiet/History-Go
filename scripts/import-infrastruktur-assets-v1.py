#!/usr/bin/env python3
"""Import the exact five Infrastruktur WebPs. Optional --activate requires visual approval."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data/badges'
EXPECTED = ['nb', 'en', 'es', 'pt', 'fr']
PREVIOUS = [
    'klassisk_arkitektur', 'modernisme', 'funksjonalisme',
    'brutalisme', 'postmodernisme', 'samtidsarkitektur', 'byplanlegging'
]

def load(name):
    return json.loads((DATA / name).read_text(encoding='utf8'))

def save(name, obj):
    (DATA / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf8')

def verify_webp(b, entry, locale):
    if len(b) != entry['bytes']:
        raise ValueError(f'{locale}: wrong byte length')
    if hashlib.sha256(b).hexdigest() != entry['sha256']:
        raise ValueError(f'{locale}: SHA-256 mismatch')
    if b[:4] != b'RIFF' or b[8:12] != b'WEBP':
        raise ValueError(f'{locale}: invalid WebP signature')
    chunk = b[12:16]
    if chunk == b'VP8X':
        w = int.from_bytes(b[24:27], 'little') + 1
        h = int.from_bytes(b[27:30], 'little') + 1
        alpha = bool(b[20] & 0x10)
    elif chunk == b'VP8L':
        if b[20] != 0x2f:
            raise ValueError(f'{locale}: invalid VP8L signature')
        bits = int.from_bytes(b[21:25], 'little')
        w = (bits & 0x3fff) + 1
        h = ((bits >> 14) & 0x3fff) + 1
        alpha = bool((bits >> 28) & 1)
    else:
        raise ValueError(f'{locale}: unsupported WebP chunk: {chunk!r}')
    if (w, h) != (1024, 1024) or not alpha:
        raise ValueError(f'{locale}: expected 1024×1024 with alpha')

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('archive', type=Path)
    p.add_argument('--activate', action='store_true')
    opts = p.parse_args()
    c = load('infrastruktur_candidate_v1.json')
    by = load('by.json')
    production = load('underbadge_batch01_production.json')
    locales = load('badge_locale_images_candidates.json')
    if c['categoryId'] != 'by' or c['id'] != 'infrastruktur' or c['size'] != [1024, 1024]:
        raise ValueError('Wrong candidate manifest')
    if list(c['variants']) != EXPECTED:
        raise ValueError('Languages must be nb, en, es, pt, fr')
    if list(by['subBadgeImages']) != PREVIOUS:
        raise ValueError('Existing seven By badges changed; refusing import')
    if opts.activate and not c['quality'].get('visualApproved'):
        raise ValueError('Visual approval required before --activate')
    payloads = {}
    with ZipFile(opts.archive) as z:
        for locale, entry in c['variants'].items():
            path = entry['path']
            expected = ('bilder/merker/by/undermerker/infrastruktur-brodert-v1.webp'
                        if locale == 'nb' else f'bilder/merker/by/locales/{locale}/infrastruktur.webp')
            if path != expected:
                raise ValueError(f'Unexpected output path: {path}')
            if path not in z.namelist():
                raise ValueError(f'Missing ZIP file: {path}')
            payload = z.read(path)
            verify_webp(payload, entry, locale)
            payloads[path] = payload
    # Validate all five before writing any binary file.
    for path, data in payloads.items():
        dest = ROOT / path
        if dest.exists() and dest.read_bytes() != data:
            raise ValueError(f'Asset differs from pinned SHA-256: {path}')
    for path, data in payloads.items():
        dest = ROOT / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    c['quality']['repositoryBinaryVerified'] = True
    c['quality']['technicalApproved'] = True
    c['binaryVerification']['repositoryHashesVerified'] = True
    if opts.activate:
        by['subBadgeImages']['infrastruktur'] = c['sourceImage']
        item = next(x for x in production['families']['by']['assets'] if x['id'] == 'infrastruktur')
        item.update({
            'status': 'integrated',
            'selectedImage': c['sourceImage'],
            'quality': {'visualApproved': True, 'technicalApproved': True},
            'bytes': c['variants']['nb']['bytes'],
            'width': 1024,
            'height': 1024,
            'sha256': c['variants']['nb']['sha256'],
            'letteringInsideBorder': True,
        })
        locales['skipped'] = [x for x in locales['skipped']
                              if not (x.get('category') == 'by' and x.get('id') == 'infrastruktur')]
        idx = next((i for i, x in enumerate(locales['entries'])
                    if x.get('category') != 'by'), len(locales['entries']))
        nb_sha = c['variants']['nb']['sha256']
        new_entries = [{
            'category': 'by', 'id': 'infrastruktur', 'locale': locale,
            'path': entry['path'], 'label': entry['heading'], 'footer': entry['footer'],
            'originalSha256': nb_sha, 'sha256': entry['sha256'], 'bytes': entry['bytes']
        } for locale, entry in c['variants'].items() if locale != 'nb']
        if not any(x.get('id') == 'infrastruktur' for x in locales['entries']):
            locales['entries'][idx:idx] = new_entries
        c['status'] = 'integrated'
        c['quality']['registered'] = True
        c['currentBlocker'] = None
        save('by.json', by)
        save('underbadge_batch01_production.json', production)
        save('badge_locale_images_candidates.json', locales)
    else:
        c['status'] = 'binary_verified_awaiting_approval'
        c['currentBlocker'] = 'Visual approval and registration still required'
    save('infrastruktur_candidate_v1.json', c)
    print('Five verified WebPs installed. Activated:', opts.activate)

if __name__ == '__main__':
    main()
