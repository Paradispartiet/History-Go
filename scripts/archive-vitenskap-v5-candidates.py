#!/usr/bin/env python3
"""Archive science v5 preview WebPs as non-active, checksum-tracked Git candidates.

Only copies CI-generated, verified 1024x1024 WebP assets. The active register,
Norwegian originals, and v4 candidate files are never written.
"""
import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "out/vitenskap-v5-review"
REPORT = ROOT / "data/badges/vitenskap_v5_candidates_20261112.json"
GALLERY = Path("bilder/merker/vitenskap/kandidater/contact-sheet-v5-mobile.jpg")
EXPECTED_IDS = {
    "informasjonsteknologi", "matematikk", "forskning_og_metode",
    "astronomi_og_fysikk", "kjemi_og_materialvitenskap",
}
EXPECTED_LOCALES = {"en", "es", "pt", "fr"}


def hashes(data: bytes) -> dict:
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "gitBlobSha": hashlib.sha1(
            b"blob " + str(len(data)).encode() + b"\0" + data
        ).hexdigest(),
    }


def copy_protected(src: Path, dest: Path, expected: dict):
    assert src.is_file(), src
    data = src.read_bytes()
    actual = hashes(data)
    for key in ("bytes", "sha256", "gitBlobSha"):
        assert expected[key] == actual[key], (src, key)
    assert not dest.exists() or dest.read_bytes() == data, (
        "Refusing to overwrite existing different file", dest
    )
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        dest.write_bytes(data)


def main():
    review = json.loads((PREVIEW / "manifest.json").read_text(encoding="utf-8"))
    active = json.loads((ROOT / "data/badges/vitenskap.json").read_text(encoding="utf-8"))
    assert review["status"] == "v5_preview_unapproved_nonactive"
    assert len(active["subBadgeImages"]) == 16
    assert len(review["items"]) == 20
    assert {(item["id"], item["locale"]) for item in review["items"]} == {
        (badge, locale) for badge in EXPECTED_IDS for locale in EXPECTED_LOCALES
    }
    assert not REPORT.exists(), "Refusing to overwrite an existing v5 manifest"

    records = []
    active_paths = set(active["subBadgeImages"].values())
    for item in sorted(review["items"], key=lambda row: (row["id"], row["locale"])):
        assert item["id"] in EXPECTED_IDS
        assert item["locale"] in EXPECTED_LOCALES
        assert item["status"] == "candidate_not_approved_not_active"
        assert item["metrics"]["outsideBandChangesBeforeEncoding"] == 0
        assert item["metrics"]["sourceAlphaIdentical"] is True
        path = (
            f'bilder/merker/vitenskap/kandidater/revisjoner/{item["locale"]}/'
            f'{item["id"]}-v5-broderi.webp'
        )
        assert path not in active_paths
        src = PREVIEW / item["previewFile"]
        assert src.resolve().is_relative_to(PREVIEW.resolve())
        with Image.open(src) as im:
            assert im.size == (1024, 1024) and im.mode == "RGBA"
        copy_protected(src, ROOT / path, item)
        records.append({**item, "path": path,
                        "status": "stored_v5_candidate_not_active_or_approved"})

    gallery_src = PREVIEW / review["contactSheet"]
    with Image.open(gallery_src) as im:
        assert im.width >= 1400 and im.height >= 1400
    gallery_digest = hashes(gallery_src.read_bytes())
    copy_protected(gallery_src, ROOT / GALLERY, gallery_digest)
    archive = {
        "schemaVersion": 1,
        "categoryId": "vitenskap",
        "status": "twenty_v5_candidates_stored_not_approved_or_active",
        "sourceCandidateCount": 20,
        "activeRegistryUnchanged": True,
        "norwegianOriginalsAndV4CandidatesPreserved": True,
        "mapUsesMainBadge": True,
        "placeCardUsesActiveUnderbadgeWithMainFallback": True,
        "visualSignoffRequired": True,
        "requiresExplicitActivationPR": True,
        "mobileSizesReviewed": [96, 160],
        "mobileGallery": str(GALLERY),
        "mobileGalleryIntegrity": gallery_digest,
        "items": records,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Archived 20 v5 WebP candidates plus mobile review sheet; active badges untouched")


if __name__ == "__main__":
    main()
