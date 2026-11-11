#!/usr/bin/env python3
"""Import exact WebP bytes for Vitenskap – Psykologi og hjerne (nb,en,es,pt,fr).

Run at repository root after copying vitenskap_psykologi_5_sprak.zip locally:
  python scripts/import-vitenskap-psykologi-hjerne-v1.py /path/to/vitenskap_psykologi_5_sprak.zip
  node --test tests/vitenskap-psykologi-hjerne-badge.test.mjs

Never recompress original WebPs. Fails before any write if one hash differs.
"""
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / 'data/badges/vitenskap_psykologi_og_hjerne_candidate_v1.json'
REGISTRY_PATH = ROOT / 'data/badges/vitenskap.json'
LANGS = ('nb','en','es','pt','fr')
ORIGINALS = {
 'naturvitenskap','teknologi','matematikk','informasjonsteknologi',
 'forskning_og_metode','astronomi_og_fysikk','kjemi_og_materialvitenskap',
 'teknologi_og_ingeniorfag','data_programvare_og_algoritmer',
 'nettverk_og_digital_infrastruktur','elektronikk_robotikk_og_automatisering','medisin',
}

def digest(data: bytes) -> tuple[str, str]:
    return (
        hashlib.sha256(data).hexdigest(),
        hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest(),
    )

def verify_webp(data: bytes, lang: str) -> None:
    if len(data) < 30 or data[:4] != b'RIFF' or data[8:16] != b'WEBPVP8X':
        raise ValueError(f'{lang}: not a supported extended WebP original')
    if int.from_bytes(data[24:27], 'little')+1 != 1024:
        raise ValueError(f'{lang}: incorrect width')
    if int.from_bytes(data[27:30], 'little')+1 != 1024:
        raise ValueError(f'{lang}: incorrect height')
    if (data[20] & 16) == 0:
        raise ValueError(f'{lang}: transparency absent')

def main(zip_path: Path) -> None:
    manifest = json.loads(MANIFEST_PATH.read_text('utf8'))
    reg = json.loads(REGISTRY_PATH.read_text('utf8'))
    if manifest['status'] != 'candidate' or manifest['id'] != 'psykologi_og_hjerne':
        raise ValueError('Candidate manifest no longer pending')
    if reg['id'] != 'vitenskap' or reg['color'] != '#6A5AE0':
        raise ValueError('Wrong parent category')
    if set(reg['subBadgeImages']) != ORIGINALS:
        raise ValueError('Expected exactly 12 existing underbadges (refusing to overwrite)')
    if set(manifest['variants']) != set(LANGS):
        raise ValueError('Missing locale')
    checked = {}
    with ZipFile(zip_path) as pack:
        for lang in LANGS:
            v = manifest['variants'][lang]
            expected = ('bilder/merker/vitenskap/brodert/' if lang == 'nb'
                        else f'bilder/merker/vitenskap/locales/{lang}/') + 'psykologi_og_hjerne.webp'
            if v['path'] != expected:
                raise ValueError(f'{lang}: unexpected target path')
            dest = ROOT / expected
            if dest.exists():
                raise FileExistsError(f'{lang}: refusing to replace existing asset {dest}')
            data = pack.read(f'psykologi_og_hjerne_{lang}.webp')
            verify_webp(data,lang)
            if len(data) != v['bytes'] or digest(data) != (v['sha256'],v['gitBlobSha']):
                raise ValueError(f'{lang}: original bytes do not match locked hashes')
            checked[dest] = data
    for dest,data in checked.items():
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(data)
    reg['subBadgeImages'][manifest['id']] = manifest['variants']['nb']['path']
    manifest['status'] = 'integrated'
    manifest['quality']['binaryVerifiedInRepository'] = True
    manifest['quality']['integrated'] = True
    manifest['binaryTransfer']['verifiedInRepository'] = True
    REGISTRY_PATH.write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    MANIFEST_PATH.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('Transferred 5 original WebP files; activated only Norwegian; 12 existing badges preserved.')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Usage: import-vitenskap-psykologi-hjerne-v1.py path/to/vitenskap_psykologi_5_sprak.zip')
    main(Path(sys.argv[1]))
