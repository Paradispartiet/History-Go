#!/usr/bin/env python3
"""Import exact Kunst badge images from the pinned 18 Nov 2026 archive.

Use from a History-Go checkout:
    python3 scripts/badges/import_kunst_badges.py /path/to/HistoryGo_Kunst_10_undermerker_binærpakke_20261118.zip
    python3 scripts/badges/import_kunst_badges.py /path/to/archive.zip --install
    python3 scripts/badges/import_kunst_badges.py /path/to/archive.zip --install --activate-approved

Defaults to read-only validation. Does not fetch, alter, or recompress images.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import struct
import sys
import zipfile

ARCHIVE_SHA256 = "7fcb671214012ea5c9caad1989342e4d960f6561a431f7518877327aa79e69c7"
APPROVED = {"tegning_og_grafikk": "v2", "design_og_form": "v2"}
EXPECTED_IDS = {
    "maleri", "skulptur", "tegning_og_grafikk", "fotokunst", "samtidskunst",
    "street_art", "kunsthistorie", "design_og_form", "kunstinstitusjoner", "offentlig_kunst"
}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def git_blob_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()

def check_image(data, path, expected):
    width, height = expected["width"], expected["height"]
    if path.endswith(".png"):
        if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
            raise ValueError(f"Invalid PNG: {path}")
        if struct.unpack(">II", data[16:24]) != (width, height) or data[25] != 6:
            raise ValueError(f"PNG dimensions or alpha wrong: {path}")
    elif path.endswith(".webp"):
        if data[:4] != b"RIFF" or data[8:16] != b"WEBPVP8X":
            raise ValueError(f"Invalid extended WebP: {path}")
        riff_size = struct.unpack("<I", data[4:8])[0] + 8
        image_width = int.from_bytes(data[24:27], "little") + 1
        image_height = int.from_bytes(data[27:30], "little") + 1
        if riff_size != len(data) or (image_width, image_height) != (width, height) or not (data[20] & 0x10):
            raise ValueError(f"WebP dimensions or alpha wrong: {path}")
    else:
        raise ValueError(f"Unexpected image extension: {path}")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument("--install", action="store_true", help="Copy exact checked originals to the checkout")
    parser.add_argument("--activate-approved", action="store_true", help="Route only the two approved badges")
    args = parser.parse_args()
    if args.activate_approved and not args.install:
        parser.error("--activate-approved requires --install")
    archive = args.archive.resolve()
    root = args.repo.resolve()
    if not (root / "data/badges/kunst.json").is_file():
        parser.error("--repo must be a History-Go checkout with data/badges/kunst.json")

    archive_hash = hashlib.sha256()
    with archive.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            archive_hash.update(chunk)
    if archive_hash.hexdigest() != ARCHIVE_SHA256:
        raise ValueError("Archive SHA-256 does not match pinned Kunst package")

    with zipfile.ZipFile(archive) as z:
        manifest = json.loads(z.read("manifest.json"))
        candidates = manifest["subbadges"]
        if len(candidates) != 10 or {b["id"] for b in candidates} != EXPECTED_IDS:
            raise ValueError("Expected exactly ten distinct Kunst badges")

        paths, originals, approved = set(), {}, {}
        names = set(z.namelist())
        for badge in candidates:
            bid = badge["id"]
            if badge["userApproval"] == "approved":
                if APPROVED.get(bid) != badge["version"]:
                    raise ValueError(f"Unexpected approval for {bid}")
                approved[bid] = badge
            elif bid in APPROVED:
                raise ValueError(f"Approved badge {bid} is missing approval status")

            for f in badge["files"].values():
                path = f["path"]
                pp = PurePosixPath(path)
                if (pp.is_absolute() or ".." in pp.parts or
                    not path.startswith("bilder/merker/kunst/") or
                    path in paths or path not in names):
                    raise ValueError(f"Invalid, missing, or repeated asset path: {path}")
                paths.add(path)
                content = z.read(path)
                if len(content) != f["bytes"] or sha(content) != f["sha256"]:
                    raise ValueError(f"SHA-256 or byte-count mismatch: {path}")
                if git_blob_sha(content) != f["gitBlobSha"]:
                    raise ValueError(f"Git object hash mismatch: {path}")
                check_image(content, path, f)
                originals[path] = content
        if len(paths) != 30 or set(approved) != set(APPROVED):
            raise ValueError("Expected 30 files and exactly two approved badges")

    registry_path = root / "data/badges/kunst.json"
    registry = json.loads(registry_path.read_text(encoding="utf-8"))
    if registry.get("id") != "kunst" or registry.get("image") != "bilder/merker/kunst-brodert.webp":
        raise ValueError("Unexpected Kunst parent-badge registry")
    if set(registry.get("sub", [])) != EXPECTED_IDS:
        raise ValueError("Unexpected Kunst subcategories")
    active = registry.get("subBadgeImages") or {}
    for bid in APPROVED:
        app_path = next(f["path"] for f in approved[bid]["files"].values()
                        if f["path"].startswith("bilder/merker/kunst/undermerker/"))
        if bid in active and active[bid] != app_path:
            raise ValueError(f"Will not replace another active badge for {bid}")

    print(f"PASS: pinned archive, 30/30 binary hashes and dimensions; 10/10 IDs")
    print("Approved for activation: design_og_form v2, tegning_og_grafikk v2")
    if not args.install:
        print("Dry run only; no files written")
        return

    for path, data in originals.items():
        dest = root.joinpath(*PurePosixPath(path).parts)
        if dest.exists() and dest.read_bytes() != data:
            raise ValueError(f"Refusing to overwrite different binary: {path}")
    for path, data in originals.items():
        dest = root.joinpath(*PurePosixPath(path).parts)
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            dest.write_bytes(data)
    print("INSTALLED: 30 original binaries; not yet committed or pushed")

    if args.activate_approved:
        new_active = dict(active)
        for bid in APPROVED:
            new_active[bid] = next(f["path"] for f in approved[bid]["files"].values()
                                   if f["path"].startswith("bilder/merker/kunst/undermerker/"))
        registry["subBadgeImages"] = new_active
        registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("STAGED: 2 approved badge routes only; 8 remain inactive")
    else:
        print("All badge routes unchanged")

if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise SystemExit(1)
