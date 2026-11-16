#!/usr/bin/env python3
"""Validate and optionally stage History GO collection image candidates.

This NEVER changes canonical Places, logos, or production image paths.
Input ZIP packages are untrusted. Only expected WebP bytes are extracted.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = {
    'toyen-trafo-apparatpult-1916-candidate.json': 'bilder/kort/objects/candidates/toyen_trafo',
    'toyen-trafo-transformatorkjerne-1918-candidate.json': 'bilder/kort/objects/candidates/toyen_trafo',
    'freiaparken-structure-candidate.json': 'bilder/kort/structures/candidates/freiaparken',
}


def webp_dimensions(blob: bytes) -> tuple[int, int]:
    if len(blob) < 30 or blob[:4] != b'RIFF' or blob[8:12] != b'WEBP':
        raise ValueError('not a WebP RIFF image')
    if int.from_bytes(blob[4:8], 'little') + 8 != len(blob):
        raise ValueError('inconsistent RIFF length')
    kind = blob[12:16]
    if kind == b'VP8 ':
        if blob[23:26] != b'\x9d\x01\x2a':
            raise ValueError('invalid VP8 start marker')
        return (int.from_bytes(blob[26:28], 'little') & 0x3fff,
                int.from_bytes(blob[28:30], 'little') & 0x3fff)
    if kind == b'VP8L':
        if blob[20] != 0x2f:
            raise ValueError('invalid lossless WebP marker')
        bits = int.from_bytes(blob[21:25], 'little')
        return ((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1)
    if kind == b'VP8X':
        return (int.from_bytes(blob[24:27], 'little') + 1,
                int.from_bytes(blob[27:30], 'little') + 1)
    raise ValueError(f'unsupported WebP chunk: {kind!r}')


def inspect_packages(packages: list[Path], manifest_dir: Path) -> list[dict]:
    observed: dict[str, bytes] = {}
    for package in packages:
        with ZipFile(package) as archive:
            for info in archive.infolist():
                name = PurePosixPath(info.filename)
                if name.is_absolute() or '..' in name.parts or '\\' in info.filename:
                    raise ValueError(f'unsafe ZIP member: {info.filename}')
                if len(name.parts) != 1 or name.suffix.lower() != '.webp':
                    continue
                if name.name in observed:
                    if observed[name.name] != archive.read(info):
                        raise ValueError(f'conflicting candidates: {name.name}')
                    continue
                if info.file_size > 5_000_000:
                    raise ValueError('WebP candidate exceeds 5MB')
                observed[name.name] = archive.read(info)
    checked = []
    for manifest_name, directory in CANDIDATES.items():
        manifest = json.loads((manifest_dir / manifest_name).read_text(encoding='utf8'))
        filename = manifest['candidateFilename']
        if manifest.get('publishable') is not False:
            raise ValueError(f'{manifest_name} must remain unpublished')
        if filename not in observed:
            raise ValueError(f'candidate missing from ZIPs: {filename}')
        blob = observed[filename]
        digest = hashlib.sha256(blob).hexdigest()
        if digest != manifest['candidateSha256']:
            raise ValueError(f'SHA256 mismatch for {filename}')
        dimensions = webp_dimensions(blob)
        if dimensions != (manifest['candidateWidth'], manifest['candidateHeight']):
            raise ValueError(f'dimensions mismatch for {filename}')
        checked.append({'file': filename, 'destination': f'{directory}/{filename}',
                        'bytes': len(blob), 'sha256': digest, 'size': list(dimensions),
                        'blob': blob})
    return checked


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package', type=Path, action='append', required=True)
    parser.add_argument('--manifest-dir', type=Path,
                        default=ROOT / 'reports/collection-images')
    parser.add_argument('--root', type=Path, default=ROOT,
                        help='Root of repo where candidates should be staged')
    parser.add_argument('--stage', action='store_true',
                        help='Write only immutable candidate WebPs; never canonical files')
    args = parser.parse_args()
    reviewed = inspect_packages(args.package, args.manifest_dir)
    if args.stage:
        for asset in reviewed:
            dst = args.root / asset['destination']
            if dst.exists() and dst.read_bytes() != asset['blob']:
                raise ValueError(f'existing candidate differs: {dst}')
        for asset in reviewed:
            dst = args.root / asset['destination']
            dst.parent.mkdir(parents=True, exist_ok=True)
            if not dst.exists():
                dst.write_bytes(asset['blob'])
    print(json.dumps({'status': 'STAGED_CANDIDATES' if args.stage else 'VERIFIED_NOT_STAGED',
                      'publishable': False, 'checked': [{k: v for k, v in row.items() if k != 'blob'}
                                                     for row in reviewed]}, indent=2))


if __name__ == '__main__':
    main()
