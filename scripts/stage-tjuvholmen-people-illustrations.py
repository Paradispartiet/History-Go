#!/usr/bin/env python3
"""Verify and optionally stage Tjuvholmen's three generated People illustrations.

This does NOT activate them in People, PlaceCard or runtime. It NEVER marks
identity likeness approved or counts illustrated portraits as approved photos.
Expected ZIP: the WebP import package delivered in the conversation.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import zipfile
from io import BytesIO
from pathlib import Path

MANIFEST = "reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json"
STAGING_DIR = "bilder/kort/people/candidates/tjuvholmen"
STAGING_REPORT = "reports/place-production/tjuvholmen-generated-people-illustration-import.json"
EXPECTED_IDS = {"bjarne_melgaard", "stephen_butkus", "hans_rasmus_astrup"}
MAX_FILE_BYTES = 2_000_000


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", required=True, type=Path, help="Local validated ZIP import package")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--stage", action="store_true",
                        help="Write ONLY candidate assets to a quarantined staging directory")
    args = parser.parse_args()
    root = args.root.resolve()
    manifest = json.loads((root / MANIFEST).read_text(encoding="utf-8"))
    if (manifest.get("place_id") != "tjuvholmen" or
        manifest.get("asset_kind") != "illustration" or
        manifest.get("visible_disclosure") != "Illustrasjon" or
        manifest.get("new_published_portrait_count") != 0):
        raise ValueError("Manifest must remain candidate-only, with mandatory illustration disclosure")
    people = manifest.get("people", [])
    if len(people) != 3 or {p["person_id"] for p in people} != EXPECTED_IDS:
        raise ValueError("Unexpected or duplicate person ID")
    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError("Install Pillow to verify the actual WebP binary and dimensions") from exc

    verified = []
    with zipfile.ZipFile(args.package, "r") as archive:
        names = set(archive.namelist())
        for entry in people:
            if entry.get("review_status") != "CANDIDATE_NOT_IDENTITY_APPROVED":
                raise ValueError("Identity-approval state unexpectedly changed")
            source_name = entry["candidate_path"]
            if (source_name not in names or
                not source_name.startswith("bilder/kort/people/") or
                not source_name.endswith("_illustrasjon_v1.webp") or
                ".." in Path(source_name).parts):
                raise ValueError("Missing or unsafe WebP archive path")
            stat = archive.getinfo(source_name)
            if stat.file_size > MAX_FILE_BYTES:
                raise ValueError("Unreasonably large WebP")
            blob = archive.read(source_name)
            digest = sha256(blob)
            if digest != entry["asset_sha256"]:
                raise ValueError(f"SHA-256 mismatch for {entry['person_id']}")
            with Image.open(BytesIO(blob)) as img:
                img.load()
                if img.format != "WEBP" or tuple(img.size) != (900, 1200):
                    raise ValueError("Image format/dimensions mismatch")
            candidate_file = root / STAGING_DIR / Path(source_name).name
            if candidate_file.is_symlink():
                raise ValueError("Refusing symlink staging target")
            if candidate_file.exists() and sha256(candidate_file.read_bytes()) != digest:
                raise ValueError("An existing staged file has different bytes")
            verified.append((entry["person_id"], candidate_file, blob, digest))

    # Only after every identity, SHA-256, type and dimension check has passed:
    if args.stage:
        stage_root = root / STAGING_DIR
        stage_root.mkdir(parents=True, exist_ok=True)
        for person_id, dest, blob, digest in verified:
            if not dest.exists():
                dest.write_bytes(blob)
        report = {
            "schema": "history_go_tjuvholmen_illustration_asset_staging_v1",
            "place_id": "tjuvholmen",
            "status": "THREE_WEBP_BYTES_STAGED_NOT_IDENTITY_APPROVED_NOT_PUBLISHED",
            "staged_count": len(verified),
            "source_package_kind": "conversation_webp_import_bundle",
            "intended_use": "candidate_only",
            "visible_disclosure_required": "Illustrasjon",
            "approved_illustration_count": 0,
            "published_illustration_count": 0,
            "people": [
                {"person_id": pid, "staged_path": dest.relative_to(root).as_posix(),
                 "sha256": digest, "size_bytes": len(blob), "dimensions": [900, 1200],
                 "review_status": "VISUAL_IDENTITY_REVIEW_REQUIRED"}
                for pid, dest, blob, digest in verified
            ]
        }
        report_file = root / STAGING_REPORT
        report_file.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n",
                               encoding="utf-8")
        print(f"STAGED {len(verified)}/3 exact files. No People or runtime links changed.")
    else:
        print(f"VERIFIED {len(verified)}/3 exact files, no files written. Add --stage to quarantine.")
    for pid, dest, blob, digest in verified:
        print(f"{pid}: {len(blob)} bytes SHA256={digest}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, RuntimeError, zipfile.BadZipFile) as error:
        print(f"REJECTED: {error}", file=sys.stderr)
        sys.exit(1)
