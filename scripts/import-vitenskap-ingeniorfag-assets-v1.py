#!/usr/bin/env python3
"""Import the five *original, byte-locked* Vitenskap engineering WebP files.

Usage (from repository root):
  python scripts/import-vitenskap-ingeniorfag-assets-v1.py /path/to/vitenskap_ingeniorfag_5_sprak.zip
  git add data/badges/vitenskap.json data/badges/vitenskap_teknologi_og_ingeniorfag_candidate_v1.json bilder/merker/vitenskap/
  node --test tests/vitenskap-teknologi-ingeniorfag-badge-candidate.test.mjs

No re-encoding, redraw, image fetch, or modification of existing badges.
"""
from __future__ import annotations

import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "data/badges/vitenskap_teknologi_og_ingeniorfag_candidate_v1.json"
REGISTRY = ROOT / "data/badges/vitenskap.json"
ID = "teknologi_og_ingeniorfag"
LOCALES = ("nb", "en", "es", "pt", "fr")
EXISTING = {
    "naturvitenskap",
    "teknologi",
    "matematikk",
    "informasjonsteknologi",
    "forskning_og_metode",
    "astronomi_og_fysikk",
    "kjemi_og_materialvitenskap",
}

def digest(data: bytes) -> tuple[str, str]:
    sha256 = hashlib.sha256(data).hexdigest()
    blob = hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\x00" + data).hexdigest()
    return sha256, blob

def assert_webp(data: bytes, language: str) -> None:
    if (data[:4], data[8:16]) != (b"RIFF", b"WEBPVP8X"):
        raise ValueError(f"{language}: expected extended WebP with VP8X")
    if len(data) < 30 or int.from_bytes(data[24:27], "little") + 1 != 1024:
        raise ValueError(f"{language}: wrong width")
    if int.from_bytes(data[27:30], "little") + 1 != 1024:
        raise ValueError(f"{language}: wrong height")
    if not data[20] & 0x10:
        raise ValueError(f"{language}: missing alpha channel")

def import_assets(archive: Path) -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    if manifest["categoryId"] != "vitenskap" or manifest["id"] != ID:
        raise ValueError("Unexpected badge manifest")
    if registry["id"] != "vitenskap" or registry["color"] != "#6A5AE0":
        raise ValueError("Unexpected science badge registry")
    if set(registry["subBadgeImages"]) != EXISTING:
        raise ValueError("Expected exactly the seven previously active Vitenskap badges")
    if manifest["status"] == "integrated":
        raise ValueError("The badge is already integrated; refusing to overwrite originals")
    if set(manifest["variants"]) != set(LOCALES):
        raise ValueError("The five locked language variants are required")

    validated: dict[Path, bytes] = {}
    with zipfile.ZipFile(archive) as pack:
        for locale in LOCALES:
            variant = manifest["variants"][locale]
            relative = variant["path"]
            if not relative.startswith("bilder/merker/vitenskap/") or not relative.endswith(".webp"):
                raise ValueError(f"{locale}: unsafe or unexpected asset destination")
            target = ROOT / relative
            content = pack.read(relative)
            if target.exists():
                raise FileExistsError(f"{locale}: would overwrite existing file: {target}")
            assert_webp(content, locale)
            if len(content) != variant["bytes"]:
                raise ValueError(f"{locale}: byte count differs from locked manifest")
            sha256, blob = digest(content)
            if (sha256, blob) != (variant["sha256"], variant["gitBlobSha"]):
                raise ValueError(f"{locale}: SHA-256 or Git blob hash mismatch")
            validated[target] = content

    # All five variants have passed verification before a single file is written.
    for target, content in validated.items():
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)

    registry["subBadgeImages"][ID] = manifest["variants"]["nb"]["path"]
    manifest["status"] = "integrated"
    manifest["quality"]["binaryVerified"] = True
    manifest["quality"]["integrated"] = True
    manifest["binaryTransfer"]["verifiedInRepository"] = True
    # Other language files remain in the repository but are intentionally inactive.
    manifest["localesActive"] = False
    REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Imported five SHA-256/Git-verified original WebP files, activated only nb.")
    for locale in LOCALES:
        v = manifest["variants"][locale]
        print(f"  {locale}: {v['path']} [{v['gitBlobSha']}]")
    print("No History badges and no previous science badge images were modified.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python scripts/import-vitenskap-ingeniorfag-assets-v1.py /path/to/five-language.zip")
    import_assets(Path(sys.argv[1]))
