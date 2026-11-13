#!/usr/bin/env python3
"""Import the three *actual* v7 WebP images, not substitutes, as non-active candidates.

Usage:
    python scripts/import-vitenskap-v7-candidates.py /path/to/unpacked/v7-zip

The directory must contain the exact WebP filenames and bytes listed in the
v7 intake manifest. No candidate is activated, and existing originals are
not overwritten. Do not invoke this with newly generated approximations.
"""
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INTAKE = ROOT / "data/badges/vitenskap_v7_candidate_intake_20261113.json"
ARCHIVE = ROOT / "data/badges/vitenskap_v7_archived_candidates_20261113.json"


def digest(data):
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "gitBlobSha": hashlib.sha1(
            b"blob " + str(len(data)).encode("ascii") + b"\0" + data
        ).hexdigest(),
    }


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Provide directory containing the actual three exported v7 WebPs.")
    folder = Path(sys.argv[1]).resolve()
    intake = json.loads(INTAKE.read_text(encoding="utf-8"))
    assert intake["status"] == "three_candidate_previews_created_outside_repo_binary_transfer_pending"
    assert intake["activation"] == "not_approved_not_active"
    assert intake["requiredFooter"] == "VITENSKAP & TEKNOLOGI"
    assert len(intake["expected"]) == 3
    assert not ARCHIVE.exists(), "Refusing to replace already archived v7 candidate manifest"
    catalog_path = ROOT / "data/badges/vitenskap.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    assert len(catalog["subBadgeImages"]) == 16

    targets = []
    for item in intake["expected"]:
        name = item["file"]
        assert name == item["id"] + "-v7-brodert-kandidat.webp"
        source = folder / name
        assert source.is_file(), f"Missing source image: {source}"
        data = source.read_bytes()
        expected = {key: item[key] for key in ("bytes", "sha256", "gitBlobSha")}
        assert digest(data) == expected, f"Content integrity mismatch: {name}"
        with Image.open(source) as im:
            assert im.format == "WEBP", name
            assert im.mode == "RGBA" and im.size == (1024, 1024), name
            assert all(im.getpixel(point)[3] == 0 for point in (
                (0, 0), (1023, 0), (0, 1023), (1023, 1023)
            )), f"Outside badge must be transparent: {name}"
        target = (
            ROOT / "bilder/merker/vitenskap/kandidater/revisjoner/nb" /
            f'{item["id"]}-v7-brodert.webp'
        )
        assert str(target.relative_to(ROOT)) not in catalog["subBadgeImages"].values()
        assert not target.exists() or target.read_bytes() == data, \
            f"Refusing to overwrite unrelated file: {target}"
        targets.append((target, data, item))

    # First validate all three; only then write any candidate bytes.
    archived = []
    for target, data, item in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            target.write_bytes(data)
        archived.append({
            **item,
            "path": str(target.relative_to(ROOT)),
            "status": "stored_unapproved_nonactive",
            "visualSignoffRequired": True,
        })
    assert catalog_path.read_text(encoding="utf-8") == (
        ROOT / "data/badges/vitenskap.json"
    ).read_text(encoding="utf-8")
    report = {
        "schemaVersion": 1,
        "categoryId": "vitenskap",
        "status": "three_real_v7_binary_candidate_artworks_archived_not_active",
        "items": archived,
        "visualSignoffRequired": True,
        "activeRegisterUnchanged": True,
        "norwegianOriginalsPreserved": True,
        "activationRequiresSeparatePR": True,
    }
    ARCHIVE.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n",
                       encoding="utf-8")
    print("Archived three exact v7 WebPs as independent candidates, no activation.")


if __name__ == "__main__":
    main()
